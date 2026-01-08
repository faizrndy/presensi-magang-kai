const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  next();
});

/* ================= ROOT ================= */
app.get("/", (req, res) => {
  res.send("Backend Absensi Shift Ready 🚀");
});

/* ================= SHIFT CONFIG ================= */
const SHIFTS = {
  pagi: {
    label: "Shift Pagi",
    start: "08:00:00",
    end: "13:00:00",
  },
  siang: {
    label: "Shift Siang",
    start: "12:00:00",
    end: "16:00:00",
  },
};

/* ================= HELPER ================= */
function timeToMinutes(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function getCurrentTime() {
  return new Date().toTimeString().slice(0, 8); // HH:MM:SS
}

/* ================= INTERNS ================= */
app.get("/api/interns", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, school, status FROM interns ORDER BY id DESC"
    );
    res.json(rows);
  } catch {
    res.status(500).json({ message: "Gagal mengambil data peserta" });
  }
});

/* ================= ATTENDANCE ================= */

// TODAY
app.get("/api/attendance/today/:internId", async (req, res) => {
  const today = getToday();
  const { internId } = req.params;

  try {
    const [[row]] = await db.query(
      "SELECT * FROM attendance WHERE intern_id = ? AND tanggal = ?",
      [internId, today]
    );
    res.json(row || null);
  } catch {
    res.status(500).json({ message: "Gagal mengambil data hari ini" });
  }
});

// HISTORY
app.get("/api/attendance/history/:internId", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT tanggal, shift, jam_masuk, telat_menit,
              jam_keluar, pulang_awal_menit, status
       FROM attendance
       WHERE intern_id = ?
       ORDER BY tanggal DESC`,
      [req.params.internId]
    );
    res.json(rows);
  } catch {
    res.status(500).json({ message: "Gagal mengambil riwayat" });
  }
});

/* ================= CHECK IN ================= */
app.post("/api/attendance/checkin", async (req, res) => {
  const { intern_id, shift } = req.body;

  if (!intern_id || !shift) {
    return res.status(400).json({ message: "intern_id & shift wajib" });
  }

  const shiftCfg = SHIFTS[shift];
  if (!shiftCfg) {
    return res.status(400).json({ message: "Shift tidak valid" });
  }

  const today = getToday();
  const now = getCurrentTime();

  const nowMin = timeToMinutes(now);
  const startMin = timeToMinutes(shiftCfg.start);
  const endMin = timeToMinutes(shiftCfg.end);

  const durasiShift = endMin - startMin;

  try {
    const [exist] = await db.query(
      "SELECT id FROM attendance WHERE intern_id = ? AND tanggal = ?",
      [intern_id, today]
    );

    if (exist.length > 0) {
      return res.status(409).json({ message: "Sudah presensi hari ini" });
    }

    let telatMenit = 0;

    if (nowMin > startMin) {
      telatMenit = Math.min(nowMin - startMin, durasiShift);
    }

    await db.query(
      `INSERT INTO attendance
       (intern_id, tanggal, shift, jam_masuk, telat_menit, status)
       VALUES (?, ?, ?, ?, ?, 'hadir')`,
      [intern_id, today, shift, now, telatMenit]
    );

    res.json({
      message: "Check in berhasil",
      jam_masuk: now,
      telat_menit: telatMenit,
    });
  } catch {
    res.status(500).json({ message: "Gagal check in" });
  }
});

/* ================= CHECK OUT ================= */
app.post("/api/attendance/checkout", async (req, res) => {
  const { intern_id } = req.body;
  const today = getToday();
  const now = getCurrentTime();

  try {
    const [[att]] = await db.query(
      "SELECT * FROM attendance WHERE intern_id = ? AND tanggal = ?",
      [intern_id, today]
    );

    if (!att) {
      return res.status(400).json({ message: "Belum check in" });
    }

    if (att.jam_keluar) {
      return res.status(400).json({ message: "Sudah check out" });
    }

    const shiftCfg = SHIFTS[att.shift];

    const nowMin = timeToMinutes(now);
    const endMin = timeToMinutes(shiftCfg.end);

    const jamKeluarDicatat =
      nowMin > endMin ? shiftCfg.end : now;

    const pulangAwalMenit =
      nowMin < endMin ? endMin - nowMin : 0;

    await db.query(
      `UPDATE attendance
       SET jam_keluar = ?, pulang_awal_menit = ?
       WHERE id = ?`,
      [jamKeluarDicatat, pulangAwalMenit, att.id]
    );

    res.json({
      message: "Check out berhasil",
      jam_keluar: jamKeluarDicatat,
      pulang_awal_menit: pulangAwalMenit,
    });
  } catch {
    res.status(500).json({ message: "Gagal check out" });
  }
});

/* ================= IZIN ================= */
app.post("/api/attendance/izin", async (req, res) => {
  const { intern_id, shift } = req.body;
  const today = getToday();

  if (!intern_id || !shift) {
    return res.status(400).json({ message: "intern_id & shift wajib" });
  }

  try {
    const [exist] = await db.query(
      "SELECT id FROM attendance WHERE intern_id = ? AND tanggal = ?",
      [intern_id, today]
    );

    if (exist.length > 0) {
      return res.status(409).json({ message: "Sudah ada status hari ini" });
    }

    await db.query(
      `INSERT INTO attendance (intern_id, tanggal, shift, status)
       VALUES (?, ?, ?, 'izin')`,
      [intern_id, today, shift]
    );

    res.json({ message: "Izin berhasil dicatat" });
  } catch {
    res.status(500).json({ message: "Gagal mencatat izin" });
  }
});

/* ================= SERVER ================= */
app.listen(PORT, () => {
  console.log(`🚀 Backend running http://localhost:${PORT}`);
});
