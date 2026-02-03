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

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ================= TYPES ================= */
type Intern = {
  id: number;
  name: string;
};

type Attendance = {
  intern_id: number;
  intern_name: string;
  tanggal: string;
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

/* ================= HELPERS ================= */
function parseLocalDate(date: string) {
  const [y, m, d] = date.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(date: string) {
  return parseLocalDate(date).toLocaleDateString("id-ID");
}

function getMonthKey(date: string) {
  return date.slice(0, 7);
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
  const [interns, setInterns] = useState<Intern[]>([]);
  const [rawData, setRawData] = useState<Attendance[]>([]);
  const [rows, setRows] = useState<RecapRow[]>([]);
  const [month, setMonth] = useState("");
  const [internId, setInternId] = useState<number | "all">("all");

  /* ===== LOAD DATA ===== */
  useEffect(() => {
    (async () => {
      const internList = await getInterns();
      setInterns(internList);

      const all: Attendance[] = [];
      for (const intern of internList) {
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

  /* ===== FILTER ===== */
  const filteredData = useMemo(() => {
    return rawData.filter(d => {
      const byMonth = month ? getMonthKey(d.tanggal) === month : true;
      const byIntern =
        internId === "all" ? true : d.intern_id === internId;
      return byMonth && byIntern;
    });
  }, [rawData, month, internId]);

  /* ===== TABLE ===== */
  useEffect(() => {
    const grouped: Record<string, Attendance[]> = {};
    filteredData.forEach(d => {
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

        return {
          date,
          day: parseLocalDate(date).toLocaleDateString("id-ID", {
            weekday: "long",
          }),
          hadir,
          izin,
          libur,
          percentage:
            aktif === 0 ? "—" : `${((hadir / aktif) * 100).toFixed(1)}%`,
        };
      }
    );

    result.sort((a, b) => b.date.localeCompare(a.date));
    setRows(result);
  }, [filteredData]);

  /* ===== SUMMARY ===== */
  const summary = useMemo(() => {
    const hadir = filteredData.filter(d => d.status === "hadir").length;
    const izin = filteredData.filter(d => d.status === "izin").length;
    const libur = filteredData.filter(d => d.status === "libur").length;
    const aktif = hadir + izin;
    const avg = aktif === 0 ? 0 : Number(((hadir / aktif) * 100).toFixed(1));
    return { hadir, izin, libur, avg };
  }, [filteredData]);

  const months = Array.from(
    new Set(rawData.map(d => getMonthKey(d.tanggal)))
  ).sort().reverse();

  /* ===== PDF EXPORT ===== */
  async function downloadPDF() {
    const targets =
      internId === "all"
        ? interns
        : interns.filter(i => i.id === internId);

    for (const intern of targets) {
      const data = filteredData.filter(d => d.intern_id === intern.id);

      const doc = new jsPDF();
      doc.setFont("Times", "Normal");
      doc.setFontSize(12);

      const img = new Image();
      img.src = "/kai.png";
      await new Promise(r => (img.onload = r));
      doc.addImage(img, "PNG", 14, 10, 40, 18); // ❌ tidak gepeng

      doc.setFont("Times", "Bold");
      doc.setFontSize(14);
      doc.text("LAPORAN ABSENSI", 105, 20, { align: "center" });

      doc.setFont("Times", "Normal");
      doc.setFontSize(12);
      doc.text(`Nama : ${intern.name}`, 14, 40);
      doc.text(
        `Periode : ${month ? monthLabel(month) : "Semua Bulan"}`,
        14,
        47
      );

      autoTable(doc, {
        startY: 55,
        styles: {
          font: "Times",
          fontSize: 12,
        },
        headStyles: {
          fillColor: [10, 35, 66], // NAVY
          textColor: 255,
        },
        head: [
          ["Tanggal", "Status", "Shift", "Jam Masuk", "Jam Keluar"],
        ],
        body: data.map(d => [
          formatDate(d.tanggal),
          d.status.toUpperCase(),
          d.shift,
          d.jam_masuk || "-",
          d.jam_keluar || "-",
        ]),
      });

      doc.save(`absensi_${intern.name}.pdf`);
    }
  }

  /* ================= UI ================= */
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Laporan Absensi</h2>

      {/* SUMMARY CARD — WARNA JANGAN DIUBAH */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 border-2 border-green-500">
          <TrendingUp className="mb-2" />
          <b className="text-xl">{summary.avg}%</b>
          <p>Rata-rata Hadir</p>
        </Card>

        <Card className="p-6 border-2 border-blue-500">
          <CheckCircle2 className="mb-2" />
          <b className="text-xl">{summary.hadir}</b>
          <p>Hadir</p>
        </Card>

        <Card className="p-6 border-2 border-amber-500">
          <Clock className="mb-2" />
          <b className="text-xl">{summary.izin}</b>
          <p>Izin</p>
        </Card>

        <Card className="p-6 border-2 border-slate-500">
          <CalendarOff className="mb-2" />
          <b className="text-xl">{summary.libur}</b>
          <p>Libur</p>
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

        <select
          className="border px-3 py-2 rounded-md"
          value={internId}
          onChange={e =>
            setInternId(
              e.target.value === "all"
                ? "all"
                : Number(e.target.value)
            )
          }
        >
          <option value="all">Semua Peserta</option>
          {interns.map(i => (
            <option key={i.id} value={i.id}>
              {i.name}
            </option>
          ))}
        </select>

        <Button variant="outline" onClick={downloadPDF}>
          <Download className="w-4 h-4 mr-2" />
          Download PDF
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
                <TableCell>
                  <Badge className="bg-blue-500">{r.hadir}</Badge>
                </TableCell>
                <TableCell>
                  <Badge className="bg-amber-500">{r.izin}</Badge>
                </TableCell>
                <TableCell>
                  <Badge className="bg-slate-500">{r.libur}</Badge>
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
