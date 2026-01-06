const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

/* ================= ROOT ================= */
app.get("/", (req, res) => {
  res.send("Backend Absensi Jalan 🚀");
});

/* ================= INTERNS ================= */

// GET ALL INTERNS
app.get("/api/interns", async (req, res) => {
  const [rows] = await db.query(
    "SELECT id, name, school, status FROM interns ORDER BY id DESC"
  );
  res.json(rows);
});

// GET INTERN BY ID
app.get("/api/interns/:id", async (req, res) => {
  const [rows] = await db.query(
    "SELECT id, name, school, status FROM interns WHERE id = ?",
    [req.params.id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ message: "Peserta tidak ditemukan" });
  }

  res.json(rows[0]);
});


// ADD INTERN
app.post("/api/interns", async (req, res) => {
  const { name, school } = req.body;

  if (!name || !school) {
    return res.status(400).json({ message: "Nama & sekolah wajib" });
  }

  await db.query(
    "INSERT INTO interns (name, school, status) VALUES (?, ?, 'Aktif')",
    [name, school]
  );

  res.json({ message: "Peserta berhasil ditambahkan" });
});

// DELETE INTERN
app.delete("/api/interns/:id", async (req, res) => {
  await db.query("DELETE FROM interns WHERE id = ?", [req.params.id]);
  res.json({ message: "Peserta berhasil dihapus" });
});

/* ================= ATTENDANCE ================= */

// GET ALL ATTENDANCE
app.get("/api/attendance", async (req, res) => {
  const [rows] = await db.query(
    "SELECT id, intern, date, status FROM attendance ORDER BY date DESC"
  );
  res.json(rows);
});

// ADD ATTENDANCE (LOCK 1x / hari)
app.post("/api/attendance", async (req, res) => {
  const { intern, date, status } = req.body;

  if (!intern || !date || !status) {
    return res.status(400).json({ message: "Data tidak lengkap" });
  }

  const [existing] = await db.query(
    "SELECT id FROM attendance WHERE intern = ? AND date = ?",
    [intern, date]
  );

  if (existing.length > 0) {
    return res.status(409).json({
      message: "Anda sudah presensi hari ini",
    });
  }

  await db.query(
    "INSERT INTO attendance (intern, date, status) VALUES (?, ?, ?)",
    [intern, date, status]
  );

  res.json({ message: "Presensi berhasil" });
});



app.listen(PORT, () => {
  console.log(`🚀 Backend running http://localhost:${PORT}`);
});
