/* =====================================================
   TYPES
===================================================== */

export type ShiftType = "pagi" | "siang";
export type AttendanceStatus = "hadir" | "izin" | "alpa";

export interface TodayAttendance {
  id: number;
  intern_id: number;
  tanggal: string;
  shift: ShiftType;
  jam_masuk: string | null;
  jam_keluar: string | null;
  telat_menit: number;
  pulang_awal_menit: number;
  status: AttendanceStatus;
}

export interface AttendanceHistory {
  tanggal: string;
  shift: ShiftType;
  jam_masuk: string | null;
  telat_menit: number;
  jam_keluar: string | null;
  pulang_awal_menit: number;
  status: AttendanceStatus;
}

/* =====================================================
   BASE CONFIG
===================================================== */

const BASE_URL = "http://localhost:5001/api";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
};

/* =====================================================
   API FUNCTIONS
===================================================== */

/* ================= STATUS HARI INI ================= */
export async function getTodayAttendance(
  internId: number
): Promise<TodayAttendance | null> {
  const res = await fetch(
    `${BASE_URL}/attendance/today/${internId}?t=${Date.now()}`,
    { headers: NO_CACHE_HEADERS }
  );

  if (!res.ok) {
    throw new Error("Gagal mengambil status absensi hari ini");
  }

  const data = await res.json();
  return data ?? null;
}

/* ================= CHECK IN (SHIFT AWARE) ================= */
export async function checkIn(
  intern_id: number,
  shift: ShiftType
) {
  const res = await fetch(`${BASE_URL}/attendance/checkin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...NO_CACHE_HEADERS,
    },
    body: JSON.stringify({ intern_id, shift }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Gagal melakukan check in");
  }

  return res.json();
}

/* ================= CHECK OUT ================= */
export async function checkOut(intern_id: number) {
  const res = await fetch(`${BASE_URL}/attendance/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...NO_CACHE_HEADERS,
    },
    body: JSON.stringify({ intern_id }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Gagal melakukan check out");
  }

  return res.json();
}

/* ================= RIWAYAT ABSENSI ================= */
export async function getAttendanceHistory(
  internId: number
): Promise<AttendanceHistory[]> {
  const res = await fetch(
    `${BASE_URL}/attendance/history/${internId}?t=${Date.now()}`,
    { headers: NO_CACHE_HEADERS }
  );

  if (!res.ok) {
    throw new Error("Gagal mengambil riwayat absensi");
  }

  return res.json();
}

/* ================= IZIN (SHIFT AWARE) ================= */
export async function izin(
  intern_id: number,
  shift: ShiftType
) {
  const res = await fetch(`${BASE_URL}/attendance/izin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...NO_CACHE_HEADERS,
    },
    body: JSON.stringify({ intern_id, shift }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Gagal mengajukan izin");
  }

  return res.json();
}
