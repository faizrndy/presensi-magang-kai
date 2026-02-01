import { useEffect, useMemo, useState } from "react";
import {
  Download,
  TrendingUp,
  CheckCircle2,
  Clock,
  CalendarOff,
} from "lucide-react";

import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

import { getInterns } from "../../api/intern.api";
import { getAttendanceHistory } from "../../api/attendance.api";

/* ================= TYPES ================= */
type Attendance = {
  intern_id: number;
  intern_name: string;
  tanggal: string; // YYYY-MM-DD
  shift: string;
  jam_masuk: string | null;
  jam_keluar: string | null;
  status: "hadir" | "izin" | "libur";
};

type RecapRow = {
  date: string;
  day: string;
  hadir: number;
  izin: number;
  libur: number;
  percentage: string;
};

/* ================= DATE HELPERS ================= */
function parseLocalDate(date: string) {
  const clean = date.slice(0, 10); // ambil YYYY-MM-DD
  const [y, m, d] = clean.split("-").map(Number);
  return new Date(y, m - 1, d);
}


function formatDate(date: string) {
  return parseLocalDate(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getMonthKey(date: string) {
  const clean = date.slice(0, 10); // ⬅️ PENTING
  const [y, m] = clean.split("-");
  return `${y}-${m}`;
}


function monthLabel(key: string) {
  const [y, m] = key.split("-");
  return new Date(Number(y), Number(m) - 1).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
}

/* ================= COMPONENT ================= */
export function AttendanceReports() {
  const [rawData, setRawData] = useState<Attendance[]>([]);
  const [rows, setRows] = useState<RecapRow[]>([]);
  const [month, setMonth] = useState("");

  /* ===== LOAD DATA ===== */
  useEffect(() => {
    (async () => {
      const interns = await getInterns();
      const all: Attendance[] = [];

      for (const intern of interns) {
        const history = await getAttendanceHistory(intern.id);
        history.forEach((h: any) => {
          all.push({
            intern_id: intern.id,
            intern_name: intern.name,
            tanggal: h.tanggal,
            shift: h.shift,
            jam_masuk: h.jam_masuk,
            jam_keluar: h.jam_keluar,
            status: h.status,
          });
        });
      }

      setRawData(all);
    })();
  }, []);

  /* ===== BUILD TABLE (INI YANG HILANG SEBELUMNYA) ===== */
  useEffect(() => {
    const filtered = month
      ? rawData.filter(d => getMonthKey(d.tanggal) === month)
      : rawData;

    const grouped: Record<string, Attendance[]> = {};

    filtered.forEach(d => {
      const key = d.tanggal.slice(0, 10);
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(d);
    });

    const result: RecapRow[] = Object.entries(grouped).map(
      ([date, list]) => {
        const hadir = list.filter(l => l.status === "hadir").length;
        const izin = list.filter(l => l.status === "izin").length;
        const libur = list.filter(l => l.status === "libur").length;

        const aktif = hadir + izin;
        const percentage =
          aktif === 0 ? "—" : `${((hadir / aktif) * 100).toFixed(1)}%`;

        return {
          date,
          day: parseLocalDate(date).toLocaleDateString("id-ID", {
            weekday: "long",
          }),
          hadir,
          izin,
          libur,
          percentage,
        };
      }
    );

    result.sort((a, b) => b.date.localeCompare(a.date));
    setRows(result);
  }, [rawData, month]); // 🔥 WAJIB

  /* ===== SUMMARY ===== */
  const summary = useMemo(() => {
    const filtered = month
      ? rawData.filter(d => getMonthKey(d.tanggal) === month)
      : rawData;

    const hadir = filtered.filter(d => d.status === "hadir").length;
    const izin = filtered.filter(d => d.status === "izin").length;
    const libur = filtered.filter(d => d.status === "libur").length;

    const aktif = hadir + izin;
    const avg = aktif === 0 ? 0 : Number(((hadir / aktif) * 100).toFixed(1));

    return { hadir, izin, libur, avg };
  }, [rawData, month]);

  const months = Array.from(
    new Set(rawData.map(d => getMonthKey(d.tanggal)))
  ).sort().reverse();

  // 🔥 AUTO PILIH BULAN SEKARANG
useEffect(() => {
  if (rawData.length === 0) return;

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;

  // kalau bulan sekarang ada di data, set otomatis
  if (months.includes(currentMonth)) {
    setMonth(currentMonth);
  }
}, [rawData]);


  /* ================= UI ================= */
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Laporan Absensi</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 border-l-4 border-green-500">
          <TrendingUp /> <b>{summary.avg}%</b> Rata-rata Hadir
        </Card>
        <Card className="p-6 border-l-4 border-blue-500">
          <CheckCircle2 /> <b>{summary.hadir}</b> Hadir
        </Card>
        <Card className="p-6 border-l-4 border-amber-500">
          <Clock /> <b>{summary.izin}</b> Izin
        </Card>
        <Card className="p-6 border-l-4 border-slate-500">
          <CalendarOff /> <b>{summary.libur}</b> Libur
        </Card>
      </div>

      <Card className="p-4 flex gap-4">
        <select
          className="border px-3 py-2 rounded-md"
          value={month}
          onChange={e => setMonth(e.target.value)}
        >
          <option value="">Semua Bulan</option>
          {months.map(m => (
            <option key={m} value={m}>
              {monthLabel(m)}
            </option>
          ))}
        </select>

        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Download CSV
        </Button>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Hari</TableHead>
              <TableHead>Hadir</TableHead>
              <TableHead>Izin</TableHead>
              <TableHead>Libur</TableHead>
              <TableHead>%</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={i}>
                <TableCell>{formatDate(r.date)}</TableCell>
                <TableCell>{r.day}</TableCell>
                <TableCell><Badge className="bg-blue-500">{r.hadir}</Badge></TableCell>
                <TableCell><Badge className="bg-amber-500">{r.izin}</Badge></TableCell>
                <TableCell><Badge className="bg-slate-500">{r.libur}</Badge></TableCell>
                <TableCell>{r.percentage}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
