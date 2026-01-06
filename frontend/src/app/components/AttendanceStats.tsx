import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { getAttendances } from "../api/attendance.api";

type Props = {
  userName: string;
};

export function AttendanceStats({ userName }: Props) {
  const [hadir, setHadir] = useState(0);
  const [izin, setIzin] = useState(0);
  const [alpa, setAlpa] = useState(0);

  useEffect(() => {
    if (!userName) return;
    loadStats();
  }, [userName]);

  async function loadStats() {
    const data = await getAttendances();
    const mine = data.filter((a) => a.intern === userName);

    setHadir(mine.filter((a) => a.status === "hadir").length);
    setIzin(mine.filter((a) => a.status === "izin").length);
    setAlpa(mine.filter((a) => a.status === "alpa").length);
  }

  const total = hadir + izin + alpa;
  const percentage = total === 0 ? 0 : Math.round((hadir / total) * 100);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-slate-700" />
        <h2 className="font-semibold text-lg text-slate-900">
          Ringkasan Kehadiran
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Stat label="TOTAL ABSEN" value={total} icon={CalendarDays} />
        <Stat label="HADIR" value={hadir} icon={CheckCircle2} color="green" />
        <Stat label="IZIN" value={izin} icon={Clock} color="amber" />
        <Stat label="ALPA" value={alpa} icon={XCircle} color="red" />

        <Card className="p-4 bg-gradient-to-br from-indigo-600 to-blue-700 text-white">
          <div className="text-xs mb-1">PERSENTASE KEHADIRAN</div>
          <div className="text-3xl font-bold">{percentage}%</div>
          <Progress value={percentage} className="h-2 mt-2 bg-white/20" />
        </Card>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  color = "slate",
}: any) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <Icon className={`w-5 h-5 text-${color}-600`} />
      </div>
      <div className="text-xs mt-2">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </Card>
  );
}
