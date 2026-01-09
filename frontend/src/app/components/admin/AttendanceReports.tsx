import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Download,
  TrendingUp,
  CheckCircle2,
  Clock,
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
  tanggal: string;
  shift: string;
  jam_masuk: string | null;
  jam_keluar: string | null;
  telat_menit: number;
  pulang_awal_menit: number;
  status: "hadir" | "izin" | "alpa";
};

type RecapRow = {
  date: string;
  day: string;
  hadir: number;
  izin: number;
  alpa: number;
  percentage: string;
};

/* ================= HELPERS ================= */
function formatDate(date: string) {
  return new Date(date).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function getMonthKey(date: string) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
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
  const [rows, setRows] = useState<RecapRow[]>([]);
  const [rawData, setRawData] = useState<Attendance[]>([]);
  const [totalInterns, setTotalInterns] = useState(0);
  const [month, setMonth] = useState<string>("");

  useEffect(() => {
    loadData();
  }, []);

  /* ================= LOAD DATA ================= */
  async function loadData() {
    const interns = await getInterns();
    setTotalInterns(interns.length);

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
          telat_menit: h.telat_menit || 0,
          pulang_awal_menit: h.pulang_awal_menit || 0,
          status: h.status,
        });
      });
    }

    setRawData(all);
    buildTable(all);
  }

  /* ================= BUILD TABLE ================= */
  function buildTable(data: Attendance[]) {
    const filtered = month
      ? data.filter(d => getMonthKey(d.tanggal) === month)
      : data;

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
        const alpa = totalInterns - hadir - izin;

        const total = hadir + izin + alpa;
        const percentage =
          total === 0 ? "—" : `${((hadir / total) * 100).toFixed(1)}%`;

        return {
          date,
          day: new Date(date).toLocaleDateString("id-ID", {
            weekday: "long",
          }),
          hadir,
          izin,
          alpa,
          percentage,
        };
      }
    );

    result.sort((a, b) => b.date.localeCompare(a.date));
    setRows(result);
  }

  /* ================= SUMMARY ================= */
  const summary = useMemo(() => {
    const filtered = month
      ? rawData.filter(d => getMonthKey(d.tanggal) === month)
      : rawData;

    const hadir = filtered.filter(d => d.status === "hadir").length;
    const izin = filtered.filter(d => d.status === "izin").length;
    const alpa = totalInterns * rows.length - hadir - izin;

    const total = hadir + izin + alpa;
    const avg =
      total === 0 ? 0 : Number(((hadir / total) * 100).toFixed(1));

    return { hadir, izin, alpa, avg };
  }, [rawData, rows, month, totalInterns]);

  /* ================= CSV DETAIL ================= */
  function downloadCSV() {
    const filtered = month
      ? rawData.filter(d => getMonthKey(d.tanggal) === month)
      : rawData;

    const header = [
      "Tanggal",
      "Nama",
      "Shift",
      "Jam Masuk",
      "Jam Keluar",
      "Terlambat (menit)",
      "Pulang Awal (menit)",
      "Status",
    ];

    const content = filtered.map(d =>
      [
        d.tanggal.slice(0, 10),
        d.intern_name,
        d.shift,
        d.jam_masuk ?? "-",
        d.jam_keluar ?? "-",
        d.telat_menit > 0 ? d.telat_menit : "-",
        d.pulang_awal_menit > 0 ? d.pulang_awal_menit : "-",
        d.status,
      ].join(",")
    );

    const csv = [header.join(","), ...content].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "laporan-absensi-detail.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  /* ================= UI ================= */
  const months = Array.from(
    new Set(rawData.map(d => getMonthKey(d.tanggal)))
  ).sort().reverse();

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold">Laporan Absensi</h2>
        <p className="text-slate-600">Rekap kehadiran peserta magang</p>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-l-4 border-green-500">
          <TrendingUp /> <b>{summary.avg}%</b> Rata-rata Hadir
        </Card>
        <Card className="p-6 border-l-4 border-blue-500">
          <CheckCircle2 /> <b>{summary.hadir}</b> Hadir
        </Card>
        <Card className="p-6 border-l-4 border-amber-500">
          <Clock /> <b>{summary.izin}</b> Izin
        </Card>
      </div>

      {/* FILTER */}
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

        <Button variant="outline" onClick={downloadCSV}>
          <Download className="w-4 h-4 mr-2" />
          Download CSV
        </Button>
      </Card>

      {/* TABLE */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Hari</TableHead>
              <TableHead>Hadir</TableHead>
              <TableHead>Izin</TableHead>
              <TableHead>Alpa</TableHead>
              <TableHead>Persentase</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Tidak ada data
                </TableCell>
              </TableRow>
            )}

            {rows.map((r, i) => (
              <TableRow key={i}>
                <TableCell>{formatDate(r.date)}</TableCell>
                <TableCell>{r.day}</TableCell>
                <TableCell>
                  <Badge className="bg-green-100">{r.hadir}</Badge>
                </TableCell>
                <TableCell>
                  <Badge className="bg-amber-100">{r.izin}</Badge>
                </TableCell>
                <TableCell>
                  <Badge className="bg-red-100">{r.alpa}</Badge>
                </TableCell>
                <TableCell>{r.percentage}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
