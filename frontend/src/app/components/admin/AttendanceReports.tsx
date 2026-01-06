import { useEffect, useMemo, useState } from "react";
import { Calendar, Download, Filter, TrendingUp, CheckCircle2, Clock } from "lucide-react";
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

import { getAttendances, Attendance } from "../../api/attendance.api";

/* ================= TYPES ================= */
type RecapRow = {
  date: string;
  day: string;
  hadir: number;
  izin: number;
  alpa: number;
  percentage: string;
};

export function AttendanceReports() {
  const [rows, setRows] = useState<RecapRow[]>([]);
  const [rawData, setRawData] = useState<Attendance[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const data = await getAttendances();
    setRawData(data);

    /* ================= GROUP BY DATE ================= */
    const grouped: Record<string, Attendance[]> = {};

    data.forEach((item) => {
      if (!grouped[item.date]) grouped[item.date] = [];
      grouped[item.date].push(item);
    });

    const result: RecapRow[] = Object.entries(grouped).map(
      ([date, records]) => {
        const hadir = records.filter((r) => r.status === "hadir").length;
        const izin = records.filter((r) => r.status === "izin").length;
        const alpa = records.filter((r) => r.status === "alpa").length;

        const total = hadir + izin + alpa;
        const percentage =
          total === 0 ? "—" : `${((hadir / total) * 100).toFixed(1)}%`;

        const day = new Date(date).toLocaleDateString("id-ID", {
          weekday: "long",
        });

        return { date, day, hadir, izin, alpa, percentage };
      }
    );

    result.sort((a, b) => b.date.localeCompare(a.date));
    setRows(result);
  }

  /* ================= SUMMARY ================= */
  const summary = useMemo(() => {
    const hadir = rawData.filter((d) => d.status === "hadir").length;
    const izin = rawData.filter((d) => d.status === "izin").length;
    const alpa = rawData.filter((d) => d.status === "alpa").length;

    const total = hadir + izin + alpa;
    const average =
      total === 0 ? 0 : Number(((hadir / total) * 100).toFixed(1));

    return { hadir, izin, alpa, average };
  }, [rawData]);

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Laporan Absensi</h2>
        <p className="text-slate-600 mt-1">
          Rekap kehadiran peserta magang
        </p>
      </div>

      {/* ================= SUMMARY BOX ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* RATA-RATA */}
        <Card className="p-6 border-l-4 border-green-500">
          <div className="flex items-center gap-4">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-slate-600">
                Rata-rata Kehadiran
              </p>
              <p className="text-3xl font-bold text-slate-900">
                {summary.average}%
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Dari seluruh data absensi
              </p>
            </div>
          </div>
        </Card>

        {/* TOTAL HADIR */}
        <Card className="p-6 border-l-4 border-blue-500">
          <div className="flex items-center gap-4">
            <CheckCircle2 className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-slate-600">
                Total Hadir
              </p>
              <p className="text-3xl font-bold text-slate-900">
                {summary.hadir}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Seluruh periode
              </p>
            </div>
          </div>
        </Card>

        {/* TOTAL IZIN */}
        <Card className="p-6 border-l-4 border-amber-500">
          <div className="flex items-center gap-4">
            <Clock className="w-8 h-8 text-amber-600" />
            <div>
              <p className="text-sm text-slate-600">
                Total Izin
              </p>
              <p className="text-3xl font-bold text-slate-900">
                {summary.izin}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Seluruh periode
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* ================= FILTER ================= */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <Button variant="outline" className="gap-2">
            <Calendar className="w-4 h-4" />
            Pilih Periode
          </Button>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Download Laporan
          </Button>
        </div>
      </Card>

      {/* ================= TABLE ================= */}
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
                <TableCell colSpan={6} className="text-center text-slate-500">
                  Belum ada data absensi
                </TableCell>
              </TableRow>
            )}

            {rows.map((row, i) => (
              <TableRow key={i}>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.day}</TableCell>

                <TableCell>
                  {row.hadir ? (
                    <Badge className="bg-green-100 text-green-700">
                      {row.hadir}
                    </Badge>
                  ) : "—"}
                </TableCell>

                <TableCell>
                  {row.izin ? (
                    <Badge className="bg-amber-100 text-amber-700">
                      {row.izin}
                    </Badge>
                  ) : "—"}
                </TableCell>

                <TableCell>
                  {row.alpa ? (
                    <Badge className="bg-red-100 text-red-700">
                      {row.alpa}
                    </Badge>
                  ) : "—"}
                </TableCell>

                <TableCell className="font-medium">
                  {row.percentage}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
