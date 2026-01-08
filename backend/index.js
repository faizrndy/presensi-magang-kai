const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

// no cache
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  next();
});

/* ================= ROOT ================= */
app.get("/", (req, res) => {
  res.send("Backend Absensi Jalan 🚀");
});

/* ================= HELPER ================= */
function diffMinutes(time1, time2) {
  const [h1, m1] = time1.split(":").map(Number);
  const [h2, m2] = time2.split(":").map(Number);
  return h1 * 60 + m1 - (h2 * 60 + m2);
}

/* ================= INTERNS ================= */

// GET ALL INTERNS
app.get("/api/interns", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, school, status FROM interns ORDER BY id DESC"
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data peserta" });
  }
});

// GET INTERN DETAIL + STATS
app.get("/api/interns/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [[intern]] = await db.query(
      "SELECT id, name, school, status FROM interns WHERE id = ?",
      [id]
    );

    if (!intern) {
      return res.status(404).json({ message: "Peserta tidak ditemukan" });
    }

    const [attendance] = await db.query(
      "SELECT status FROM attendance WHERE intern_id = ?",
      [id]
    );

    const hadir = attendance.filter(a => a.status === "hadir").length;
    const izin  = attendance.filter(a => a.status === "izin").length;
    const alpa  = attendance.filter(a => a.status === "alpa").length;
    const total = hadir + izin + alpa;
    const percentage = total === 0 ? 0 : Number(((hadir / total) * 100).toFixed(1));

    res.json({ ...intern, hadir, izin, alpa, total, percentage });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/* ================= ATTENDANCE ================= */

// GET ATTENDANCE TODAY
app.get("/api/attendance/today/:internId", async (req, res) => {
  const { internId } = req.params;
  const today = new Date().toISOString().slice(0, 10);

  try {
    const [[row]] = await db.query(
      "SELECT * FROM attendance WHERE intern_id = ? AND tanggal = ?",
      [internId, today]
    );
    res.json(row || null);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data hari ini" });
  }
});

// GET ATTENDANCE HISTORY
app.get("/api/attendance/history/:internId", async (req, res) => {
  const { internId } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT tanggal, jam_masuk, telat_menit, jam_keluar, pulang_awal_menit, status
       FROM attendance
       WHERE intern_id = ?
       ORDER BY tanggal DESC`,
      [internId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil riwayat" });
  }
});

// ================= CHECK IN =================
app.post("/api/attendance/checkin", async (req, res) => {
  const { intern_id } = req.body;

  if (!intern_id) {
    return res.status(400).json({ message: "intern_id wajib" });
  }

  const today = new Date().toISOString().slice(0, 10);
  const now = new Date().toTimeString().slice(0, 5);
  const JAM_MASUK = "08:00";

  const telat = diffMinutes(now, JAM_MASUK);
  const telatMenit = telat > 0 ? telat : 0;

  try {
    await db.query(
      `INSERT INTO attendance 
       (intern_id, tanggal, jam_masuk, telat_menit, status)
       VALUES (?, ?, ?, ?, 'hadir')`,
      [intern_id, today, now, telatMenit]
    );

    res.json({
      message: "Check in berhasil",
      jam_masuk: now,
      telat_menit: telatMenit,
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Sudah check in hari ini" });
    }
    res.status(500).json({ message: "Gagal check in" });
  }
});

// ================= CHECK OUT =================
app.post("/api/attendance/checkout", async (req, res) => {
  const { intern_id } = req.body;

  if (!intern_id) {
    return res.status(400).json({ message: "intern_id wajib" });
  }

  const today = new Date().toISOString().slice(0, 10);
  const now = new Date().toTimeString().slice(0, 5);
  const JAM_PULANG = "17:00";

  try {
    const [[attendance]] = await db.query(
      "SELECT * FROM attendance WHERE intern_id = ? AND tanggal = ?",
      [intern_id, today]
    );

    if (!attendance) {
      return res.status(400).json({ message: "Belum check in" });
    }

    if (attendance.jam_keluar) {
      return res.status(400).json({ message: "Sudah check out" });
    }

    const pulangAwal = diffMinutes(JAM_PULANG, now);
    const pulangAwalMenit = pulangAwal > 0 ? pulangAwal : 0;

    await db.query(
      `UPDATE attendance 
       SET jam_keluar = ?, pulang_awal_menit = ?
       WHERE id = ?`,
      [now, pulangAwalMenit, attendance.id]
    );

    res.json({
      message: "Check out berhasil",
      jam_keluar: now,
      pulang_awal_menit: pulangAwalMenit,
    });
  } catch (error) {
    res.status(500).json({ message: "Gagal check out" });
  }
});

// ================= IZIN =================
app.post("/api/attendance/izin", async (req, res) => {
  const { intern_id } = req.body;

  if (!intern_id) {
    return res.status(400).json({ message: "intern_id wajib" });
  }

  const today = new Date().toISOString().slice(0, 10);

  try {
    await db.query(
      `INSERT INTO attendance (intern_id, tanggal, status)
       VALUES (?, ?, 'izin')`,
      [intern_id, today]
    );

    res.json({ message: "Izin berhasil dicatat" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ message: "Status hari ini sudah tercatat" });
    }
    res.status(500).json({ message: "Gagal mencatat izin" });
  }
});


/* ================= SERVER ================= */
app.listen(PORT, () => {
  console.log(`🚀 Backend running http://localhost:${PORT}`);
});
