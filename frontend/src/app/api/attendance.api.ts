/* =====================================================
   TYPES
===================================================== */

/**
 * 🔑 HARUS SAMA DENGAN BACKEND
 * shift1 | shift2 | piket | izin
 */
export type ShiftType =
  | "shift1"
  | "shift2"
  | "piket"
  | "izin";

export type AttendanceStatus =
  | "hadir"
  | "libur"
  | "izin";

export interface TodayAttendance {
  id: number;
  intern_id: number;
  tanggal: string; // YYYY-MM-DD (SUDAH DINORMALISASI)
  shift: ShiftType;
  jam_masuk: string | null;
  jam_keluar: string | null;
  telat_menit: number;
  pulang_awal_menit: number;
  status: AttendanceStatus;
}

export interface AttendanceHistory {
  tanggal: string; // YYYY-MM-DD (SUDAH DINORMALISASI)
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
   🔥 DATE NORMALIZER (ANTI UTC BUG)
===================================================== */

function normalizeDate(date: string): string {
  // backend kirim UTC → kita ubah ke tanggal lokal
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

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

  const data = await res.json();

  return {
    ...data,
    tanggal: normalizeDate(data.tanggal),
  };
}

/* ================= CHECK IN ================= */
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

  const data = await res.json();

  return {
    ...data,
    tanggal: normalizeDate(data.tanggal),
  };
}

/* ================= CHECK OUT ================= */
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

  const data = await res.json();

  return {
    ...data,
    tanggal: normalizeDate(data.tanggal),
  };
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

  const data = await res.json();

  return data.map((item: AttendanceHistory) => ({
    ...item,
    tanggal: normalizeDate(item.tanggal),
  }));
}
