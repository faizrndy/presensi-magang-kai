/* =====================================================
   TYPES
===================================================== */

/**
 * 🔑 HARUS SAMA DENGAN BACKEND
 * shift1 | shift2 | piket | libur | izin
 */
export type ShiftType =
  | "shift1"
  | "shift2"
  | "piket"
  | "libur"
  | "izin";

export type AttendanceStatus =
  | "hadir"
  | "libur"
  | "izin"
  | "alpa";

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
  jam_keluar: string | null;
  telat_menit: number;
  pulang_awal_menit: number;
  status: AttendanceStatus;
}

/* =====================================================
   BASE CONFIG
===================================================== */

const BASE_URL = "http://localhost:5001/api/attendance";

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
    `${BASE_URL}/today/${internId}?t=${Date.now()}`,
    { headers: NO_CACHE_HEADERS }
  );

  if (!res.ok) return null;
  return res.json();
}

/* ================= CHECK IN / LIBUR / IZIN ================= */
export async function checkInAttendance(payload: {
  intern_id: number;
  shift: ShiftType;
}) {
  const res = await fetch(`${BASE_URL}/checkin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...NO_CACHE_HEADERS,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Gagal melakukan absensi");
  }

  return res.json();
}

/* ================= CHECK OUT (HANYA SHIFT) ================= */
export async function checkOutAttendance(payload: {
  intern_id: number;
}) {
  const res = await fetch(`${BASE_URL}/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...NO_CACHE_HEADERS,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Gagal melakukan check-out");
  }

  return res.json();
}

/* ================= RIWAYAT ABSENSI ================= */
export async function getAttendanceHistory(
  internId: number
): Promise<AttendanceHistory[]> {
  const res = await fetch(
    `${BASE_URL}/history/${internId}?t=${Date.now()}`,
    { headers: NO_CACHE_HEADERS }
  );

  if (!res.ok) {
    throw new Error("Gagal mengambil riwayat absensi");
  }

  return res.json();
}
