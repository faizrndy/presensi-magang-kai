const express = require("express");
const cors = require("cors");
const db = require("./db");
const cron = require("node-cron");

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

app.use((_, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  next();
});

/* ================= ROOT ================= */
app.get("/", (_, res) => {
  res.send("Backend Absensi Shift Ready 🚀 (WIB)");
});

/* ================= SHIFT CONFIG ================= */
const SHIFTS = {
  shift1: { start: "07:30:00", end: "13:30:00" },
  shift2: { start: "12:30:00", end: "18:30:00" },
  piket: { start: "08:00:00", end: "16:00:00" },
};

/* ================= HELPERS (WIB) ================= */
const nowWIB = () =>
  new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
  );

const today = () => {
  const d = nowWIB();
  return d.toISOString().slice(0, 10);
};

const yesterday = () => {
  const d = nowWIB();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
};


const nowTime = () => {
  const d = nowWIB();
  return d.toTimeString().slice(0, 8);
};

const timeToMinutes = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const isWeekend = () => {
  const day = nowWIB().getDay(); // 0 = Minggu, 6 = Sabtu
  return day === 0 || day === 6;
};

/* ================= INTERNS ================= */

// GET semua peserta
app.get("/api/interns", async (_, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, school FROM interns ORDER BY id DESC"
    );
    res.json(rows);
  } catch {
    res.status(500).json({ message: "Gagal mengambil data peserta" });
  }
});

// POST tambah peserta
app.post("/api/interns", async (req, res) => {
  const { name, school } = req.body;

  if (!name || !school) {
    return res.status(400).json({ message: "Nama & sekolah wajib diisi" });
  }

  const [result] = await db.query(
    "INSERT INTO interns (name, school) VALUES (?, ?)",
    [name, school]
  );

  res.json({
    id: result.insertId,
    name,
    school,
  });
});

// DELETE peserta
app.delete("/api/interns/:id", async (req, res) => {
  await db.query("DELETE FROM interns WHERE id = ?", [req.params.id]);
  res.json({ message: "Peserta berhasil dihapus" });
});

/* ================= ATTENDANCE ================= */

// TODAY
app.get("/api/attendance/today/:internId", async (req, res) => {
  const [[row]] = await db.query(
    "SELECT * FROM attendance WHERE intern_id = ? AND tanggal = ?",
    [req.params.internId, today()]
  );
  res.json(row || null);
});

// HISTORY
app.get("/api/attendance/history/:internId", async (req, res) => {
  const [rows] = await db.query(
    `SELECT 
        tanggal,
        shift,
        jam_masuk,
        jam_keluar,
        telat_menit,
        pulang_awal_menit,
        status
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

  if (!intern_id || !shift) {
    return res.status(400).json({ message: "Data tidak lengkap" });
  }

  const validShifts = ["shift1", "shift2", "piket", "izin"];
  if (!validShifts.includes(shift)) {
    return res.status(400).json({ message: "Shift tidak valid" });
  }

  const [[exist]] = await db.query(
    "SELECT id FROM attendance WHERE intern_id = ? AND tanggal = ?",
    [intern_id, today()]
  );
  if (exist) {
    return res.status(409).json({ message: "Absensi hari ini sudah ada" });
  }

  const now = nowTime();

  // IZIN
if (shift === "izin") {
  await db.query(
    `INSERT INTO attendance
     (intern_id, tanggal, shift, jam_masuk, jam_keluar, telat_menit, pulang_awal_menit, status)
     VALUES (?, ?, 'izin', ?, ?, 0, 0, 'izin')`,
    [intern_id, today(), now, now]
  );

  return res.json({ message: "Izin berhasil dicatat" });
}


  // HADIR
  const nowMin = timeToMinutes(now);
  const startMin = timeToMinutes(SHIFTS[shift].start);
  const endMin = timeToMinutes(SHIFTS[shift].end);

  const telat =
    nowMin > startMin
      ? Math.min(nowMin - startMin, endMin - startMin)
      : 0;

  await db.query(
    `INSERT INTO attendance
     (intern_id, tanggal, shift, jam_masuk, telat_menit, status)
     VALUES (?, ?, ?, ?, ?, 'hadir')`,
    [intern_id, today(), shift, now, telat]
  );

  res.json({ message: "Check-in berhasil" });
});

/* ================= CHECK OUT ================= */
app.post("/api/attendance/checkout", async (req, res) => {
  const { intern_id } = req.body;

  const [[att]] = await db.query(
    `SELECT * FROM attendance
     WHERE intern_id = ?
       AND tanggal = ?
       AND status = 'hadir'
       AND jam_keluar IS NULL`,
    [intern_id, today()]
  );

  if (!att) {
    return res.status(400).json({ message: "Check-out tidak valid" });
  }

  const now = nowTime();
  const nowMin = timeToMinutes(now);
  const endMin = timeToMinutes(SHIFTS[att.shift].end);

  const pulangAwal = nowMin < endMin ? endMin - nowMin : 0;

  await db.query(
    `UPDATE attendance
     SET jam_keluar = ?, pulang_awal_menit = ?
     WHERE id = ?`,
    [now, pulangAwal, att.id]
  );

  res.json({ message: "Check-out berhasil" });
});

/* ================= AUTO ALPA / LIBUR (WIB) ================= */
cron.schedule(
  "0 0 * * *",
  async () => {
    const targetDate = yesterday();
    const [interns] = await db.query("SELECT id FROM interns");

    for (const i of interns) {
      const [[exist]] = await db.query(
        "SELECT id FROM attendance WHERE intern_id = ? AND tanggal = ?",
        [i.id, targetDate]
      );

      if (exist) continue;

      await db.query(
        `INSERT INTO attendance (intern_id, tanggal, shift, status)
         VALUES (?, ?, 'libur', 'libur')`,
        [i.id, targetDate]
      );
    }

    console.log(`✅ Auto LIBUR untuk ${targetDate} (00:00 WIB)`);
  },
  { timezone: "Asia/Jakarta" }
);


/* ================= SERVER ================= */
app.listen(PORT, () => {
  console.log(`🚀 Backend running http://localhost:${PORT} (WIB)`);
});
