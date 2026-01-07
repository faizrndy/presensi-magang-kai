const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

// Middleware No-Cache (Sudah benar, dipertahankan)
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

/* ================= ROOT ================= */
app.get("/", (req, res) => {
  res.send("Backend Absensi Jalan 🚀");
});

/* ================= INTERNS ================= */

// GET ALL INTERNS
app.get("/api/interns", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, school, status FROM interns ORDER BY id DESC"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error Get Interns:", error.message);
    res.status(500).json({ message: "Gagal mengambil data peserta" });
  }
});

// GET INTERN BY ID DENGAN STATS
app.get("/api/interns/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [[intern]] = await db.query(
      "SELECT id, name, school, status FROM interns WHERE id = ?",
      [id]
    );

    if (!intern) return res.status(404).json({ message: "Peserta tidak ditemukan" });

    // Perbaikan query: ambil semua kolom yang dibutuhkan
    const [attendance] = await db.query(
      "SELECT status FROM attendance WHERE LOWER(TRIM(intern)) = LOWER(TRIM(?))",
      [intern.name]
    );

    const hadir = attendance.filter(a => a.status === "hadir").length;
    const izin  = attendance.filter(a => a.status === "izin").length;
    const alpa  = attendance.filter(a => a.status === "alpa").length;
    const total = hadir + izin + alpa;
    const percentage = total === 0 ? 0 : Number(((hadir / total) * 100).toFixed(1));

    res.json({ ...intern, hadir, izin, alpa, total, percentage });
  } catch (error) {
    console.error("Error Get Intern Details:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/* ================= ATTENDANCE ================= */

// GET ALL ATTENDANCE
app.get("/api/attendance", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, intern, date, status FROM attendance ORDER BY date DESC, id DESC"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error Get Attendance:", error.message);
    res.status(500).json({ message: "Gagal mengambil riwayat" });
  }
});

// ADD ATTENDANCE (FIXED & LOGGED)
// backend/index.js - Bagian POST Attendance
app.post("/api/attendance", async (req, res) => {
  const { intern, date, status } = req.body;

  if (!intern || !date || !status) {
    return res.status(400).json({ message: "Data tidak lengkap" });
  }

  try {
    // 1. Validasi Double Absen
    const [existing] = await db.query(
      "SELECT id FROM attendance WHERE LOWER(TRIM(intern)) = LOWER(TRIM(?)) AND date = ?",
      [intern, date]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "Anda sudah presensi hari ini" });
    }

    // 2. 🔥 EKSEKUSI INSERT DAN TUNGGU KONFIRMASI (AWAIT)
    const [result] = await db.query(
      "INSERT INTO attendance (intern, date, status) VALUES (?, ?, ?)",
      [intern.trim(), date, status]
    );

    // 3. LOGGING: Cek terminal anda, jika log ini muncul, data PASTI ada di DB
    console.log(`------------------------------------------`);
    console.log(`✅ DATABASE UPDATED: ID [${result.insertId}]`);
    console.log(`👤 Intern: ${intern}`);
    console.log(`📅 Date: ${date}`);
    console.log(`------------------------------------------`);

    res.status(201).json({ 
      message: "Presensi berhasil disimpan", 
      id: result.insertId 
    });

  } catch (error) {
    console.error("❌ MYSQL ERROR:", error.message);
    res.status(500).json({ message: "Gagal menyimpan ke database" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running http://localhost:${PORT}`);
});