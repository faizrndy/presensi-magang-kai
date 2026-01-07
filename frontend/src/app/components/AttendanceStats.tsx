import {
  CalendarDays,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { Attendance } from "../api/attendance.api";

type Props = {
  userName: string;
  attendances: Attendance[]; 
};

export function AttendanceStats({ userName, attendances }: Props) {
  // Proteksi jika data bukan array
  const safeData = Array.isArray(attendances) ? attendances : [];

  // 🔥 FILTER SANGAT PENTING: Gunakan toLowerCase() dan trim() pada KEDUA sisi
  // Ini mencegah angka tetap 0 hanya karena masalah huruf kapital atau spasi
  const mine = safeData.filter((a) => {
    if (!a.intern || !userName) return false;
    return a.intern.toLowerCase().trim() === userName.toLowerCase().trim();
  });

  // Hitung angka secara real-time dari array props terbaru
  const hadir = mine.filter((a) => a.status === "hadir").length;
  const izin = mine.filter((a) => a.status === "izin").length;
  const alpa = mine.filter((a) => a.status === "alpa").length;

  const total = hadir + izin + alpa;
  const percentage = total === 0 ? 0 : Math.round((hadir / total) * 100);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-slate-700" />
        <h2 className="font-semibold text-lg text-slate-900">Ringkasan Kehadiran</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Stat label="TOTAL ABSEN" value={total} icon={CalendarDays} />
        <Stat label="HADIR" value={hadir} icon={CheckCircle2} color="green" />
        <Stat label="IZIN" value={izin} icon={Clock} color="amber" />
        <Stat label="ALPA" value={alpa} icon={XCircle} color="red" />

        <Card className="p-4 bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-lg border-none">
          <div className="text-[10px] mb-1 opacity-90 font-bold uppercase tracking-wider">Kehadiran</div>
          <div className="text-3xl font-black">{percentage}%</div>
          <Progress value={percentage} className="h-1.5 mt-3 bg-white/20" />
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value, icon: Icon, color = "slate" }: any) {
  const colorMap: any = {
    green: "text-green-600 bg-green-50",
    amber: "text-amber-500 bg-amber-50",
    red: "text-red-600 bg-red-50",
    slate: "text-slate-600 bg-slate-50"
  };

  return (
    <Card className="p-4 shadow-sm border-slate-100 flex flex-col justify-between">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorMap[color].split(' ')[1]}`}>
        <Icon className={`w-5 h-5 ${colorMap[color].split(' ')[0]}`} />
      </div>
      <div className="mt-3">
        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{label}</div>
        <div className="text-2xl font-black text-slate-800">{value}</div>
      </div>
    </Card>
  );
}