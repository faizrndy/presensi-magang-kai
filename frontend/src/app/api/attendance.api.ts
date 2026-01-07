export interface Attendance {
  id: number;
  intern: string;
  date: string;
  status: "hadir" | "izin" | "alpa";
}

const BASE_URL = "http://localhost:5001/api";

// src/api/attendance.api.ts
export async function getAttendances(): Promise<Attendance[]> {
  const res = await fetch(`${BASE_URL}/attendance?t=${Date.now()}`, {
    method: "GET",
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache'
    }
  });
  return res.json();
}

export async function addAttendance(data: { intern: string; date: string; status: string }) {
  const res = await fetch(`${BASE_URL}/attendance`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Gagal menyimpan absensi");
  }
  return res.json();
}