// ================= TYPES =================
export interface TodayAttendance {
  id: number;
  intern_id: number;
  tanggal: string;
  jam_masuk: string | null;
  jam_keluar: string | null;
  telat_menit: number;
  pulang_awal_menit: number;
  status: "hadir" | "izin" | "alpa";
}

export interface AttendanceHistory {
  tanggal: string;
  jam_masuk: string | null;
  telat_menit: number;
  jam_keluar: string | null;
  pulang_awal_menit: number;
  status: "hadir" | "izin" | "alpa";
}

// ================= BASE =================
const BASE_URL = "http://localhost:5001/api";

// ================= API =================

// status hari ini
export async function getTodayAttendance(
  internId: number
): Promise<TodayAttendance | null> {
  const res = await fetch(
    `${BASE_URL}/attendance/today/${internId}?t=${Date.now()}`,
    {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
      },
    }
  );

  if (!res.ok) {
    throw new Error("Gagal mengambil status hari ini");
  }

  return res.json();
}

// check in
export async function checkIn(intern_id: number) {
  const res = await fetch(`${BASE_URL}/attendance/checkin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    },
    body: JSON.stringify({ intern_id }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Gagal check in");
  }

  return res.json();
}

// check out
export async function checkOut(intern_id: number) {
  const res = await fetch(`${BASE_URL}/attendance/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    },
    body: JSON.stringify({ intern_id }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Gagal check out");
  }

  return res.json();
}

// riwayat absensi (tabel)
export async function getAttendanceHistory(
  internId: number
): Promise<AttendanceHistory[]> {
  const res = await fetch(
    `${BASE_URL}/attendance/history/${internId}?t=${Date.now()}`,
    {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
      },
    }
  );

  if (!res.ok) {
    throw new Error("Gagal mengambil riwayat absensi");
  }

  return res.json();
}


// ajukan izin
export async function izin(intern_id: number) {
  const res = await fetch(`${BASE_URL}/attendance/izin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    },
    body: JSON.stringify({ intern_id }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Gagal mengajukan izin");
  }

  return res.json();
}
