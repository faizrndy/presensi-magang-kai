const express = require("express");
const cors = require("cors");
const db = require("./db");
const cron = require("node-cron");

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  next();
});

/* ================= ROOT ================= */
app.get("/", (_, res) => {
  res.send("Backend Absensi Shift Ready 🚀");
});

/* ================= SHIFT CONFIG ================= */
const SHIFTS = {
  shift1: { start: "07:30:00", end: "13:30:00" },
  shift2: { start: "12:30:00", end: "18:30:00" },
  piket:  { start: "08:00:00", end: "16:00:00" },
};

/* ================= HELPERS ================= */
function timeToMinutes(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function getCurrentTime() {
  return new Date().toTimeString().slice(0, 8);
}

/* ================= INTERNS ================= */
app.get("/api/interns", async (_, res) => {
  const [rows] = await db.query(
    "SELECT id, name, school FROM interns ORDER BY id DESC"
  );
  res.json(rows);
});

/* ================= ATTENDANCE ================= */

/* ===== TODAY ===== */
app.get("/api/attendance/today/:internId", async (req, res) => {
  const [[row]] = await db.query(
    "SELECT * FROM attendance WHERE intern_id = ? AND tanggal = ?",
    [req.params.internId, getToday()]
  );
  res.json(row || null);
});

/* ===== HISTORY ===== */
app.get("/api/attendance/history/:internId", async (req, res) => {
  const [rows] = await db.query(
    `SELECT tanggal, shift, jam_masuk, telat_menit,
            jam_keluar, pulang_awal_menit, status
     FROM attendance
     WHERE intern_id = ?
     ORDER BY tanggal DESC`,
    [req.params.internId]
  );
  res.json(rows);
});

/* ================= CHECK IN ================= */
app.post("/api/attendance/checkin", async (req, res) => {
  const { intern_id, shift } = req.body;
  const today = getToday();
  const now = getCurrentTime();

  if (!intern_id || !SHIFTS[shift]) {
    return res.status(400).json({ message: "Data tidak valid" });
  }

  const [[exist]] = await db.query(
    "SELECT status FROM attendance WHERE intern_id = ? AND tanggal = ?",
    [intern_id, today]
  );

  if (exist) {
    return res.status(409).json({
      message: `Sudah ${exist.status} hari ini`,
    });
  }

  const nowMin = timeToMinutes(now);
  const startMin = timeToMinutes(SHIFTS[shift].start);
  const endMin = timeToMinutes(SHIFTS[shift].end);

  let telat = 0;
  if (nowMin > startMin) {
    telat = Math.min(nowMin - startMin, endMin - startMin);
  }

  await db.query(
    `INSERT INTO attendance
     (intern_id, tanggal, shift, jam_masuk, telat_menit, status)
     VALUES (?, ?, ?, ?, ?, 'hadir')`,
    [intern_id, today, shift, now, telat]
  );

  res.json({ message: "Check in berhasil" });
});

/* ================= CHECK OUT ================= */
app.post("/api/attendance/checkout", async (req, res) => {
  const { intern_id } = req.body;
  const today = getToday();
  const now = getCurrentTime();

  const [[att]] = await db.query(
    "SELECT * FROM attendance WHERE intern_id = ? AND tanggal = ?",
    [intern_id, today]
  );

  if (!att || att.jam_keluar) {
    return res.status(400).json({ message: "Tidak valid" });
  }

  const endMin = timeToMinutes(SHIFTS[att.shift].end);
  const nowMin = timeToMinutes(now);

  const jamKeluar = nowMin > endMin ? SHIFTS[att.shift].end : now;
  const pulangAwal = nowMin < endMin ? endMin - nowMin : 0;

  await db.query(
    `UPDATE attendance
     SET jam_keluar = ?, pulang_awal_menit = ?
     WHERE id = ?`,
    [jamKeluar, pulangAwal, att.id]
  );

  res.json({ message: "Check out berhasil" });
});

/* ================= IZIN ================= */
app.post("/api/attendance/izin", async (req, res) => {
  const { intern_id, shift } = req.body;
  const today = getToday();

  const [[exist]] = await db.query(
    "SELECT id FROM attendance WHERE intern_id = ? AND tanggal = ?",
    [intern_id, today]
  );

  if (exist) {
    return res.status(409).json({ message: "Sudah ada status hari ini" });
  }

  await db.query(
    `INSERT INTO attendance (intern_id, tanggal, shift, status)
     VALUES (?, ?, ?, 'izin')`,
    [intern_id, today, shift]
  );

  res.json({ message: "Izin berhasil" });
});

/* ================= AUTO ALPA (GLOBAL 18:31) ================= */
async function autoAlpa() {
  const today = getToday();
  const [interns] = await db.query("SELECT id FROM interns");

  for (const intern of interns) {
    const [[exist]] = await db.query(
      "SELECT id FROM attendance WHERE intern_id = ? AND tanggal = ?",
      [intern.id, today]
    );

    if (exist) continue;

    await db.query(
      `INSERT INTO attendance (intern_id, tanggal, shift, status)
       VALUES (?, ?, 'shift2', 'alpa')`,
      [intern.id, today]
    );

    console.log(`❌ AUTO ALPA → intern ${intern.id}`);
  }
  autoAlpa(); // 🔥 TEST ONLY
}


cron.schedule("31 18 * * *", () => {
  autoAlpa();
});


/* ================= SERVER ================= */
app.listen(PORT, () => {
  console.log(`🚀 Backend running http://localhost:${PORT}`);
});
