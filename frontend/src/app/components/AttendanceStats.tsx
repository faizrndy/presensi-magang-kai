import {
  CalendarDays,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { AttendanceHistory } from "../api/attendance.api";

/* ================= TYPES ================= */
type Props = {
  attendances: AttendanceHistory[] | null | undefined;
};

type StatColor = "green" | "amber" | "red" | "slate";

type StatProps = {
  label: string;
  value: number;
  icon: any;
  color?: StatColor;
};

/* ================= COMPONENT ================= */
export function AttendanceStats({ attendances }: Props) {
  /* ================= SAFE DATA ================= */
  const safeData: AttendanceHistory[] = Array.isArray(attendances)
    ? attendances
    : [];

  /* ================= COUNT STATUS ================= */
  const hadir = safeData.filter(a => a.status === "hadir").length;
  const izin = safeData.filter(a => a.status === "izin").length;
  const alpa = safeData.filter(a => a.status === "alpa").length;

  // Total absen di sini biasanya jumlah hari kerja yang sudah berlalu
  const total = safeData.length;

  /* ================= PERCENTAGE ================= */
  // Logika: (Hadir / Total) * 100. Jika total 0, maka 0%.
  const percentage =
    total === 0 ? 0 : Math.round((hadir / total) * 100);

  /* ================= UI ================= */
  return (
    <div className="space-y-5 mt-8">
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="w-5 h-5 text-slate-500" />
        <h2 className="font-bold text-lg text-slate-800 tracking-tight">
          Ringkasan Kehadiran
        </h2>
      </div>

      {/* GRID STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-5">
        <Stat
          label="TOTAL ABSEN"
          value={total}
          icon={CalendarDays}
          color="slate"
        />

        <Stat
          label="HADIR"
          value={hadir}
          icon={CheckCircle2}
          color="green"
        />

        <Stat
          label="IZIN"
          value={izin}
          icon={Clock}
          color="amber"
        />

        <Stat
          label="ALPA"
          value={alpa}
          icon={XCircle}
          color="red"
        />

        {/* PERCENT CARD (BIRU KAI) */}
        <Card className="p-5 bg-[#3b41e3] text-white shadow-md border-none flex flex-col justify-between rounded-2xl relative overflow-hidden">
          <div>
            <div className="text-[10px] opacity-80 font-bold uppercase tracking-[0.1em]">
              KEHADIRAN
            </div>
            <div className="text-4xl font-black mt-1">
              {percentage}%
            </div>
          </div>
          
          <div className="mt-4">
             <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-500" 
                  style={{ width: `${percentage}%` }}
                />
             </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ================= STAT ITEM ================= */
function Stat({
  label,
  value,
  icon: Icon,
  color = "slate",
}: StatProps) {
  const colorMap: Record<StatColor, string> = {
    green: "text-green-500 bg-green-50",
    amber: "text-amber-500 bg-amber-50",
    red: "text-red-500 bg-red-50",
    slate: "text-slate-400 bg-slate-50",
  };

  const [textColor, bgColor] = colorMap[color].split(" ");

  return (
    <Card className="p-5 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border-none rounded-2xl flex flex-col justify-between bg-white">
      {/* Icon Bulat */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center ${bgColor}`}
      >
        <Icon className={`w-5 h-5 ${textColor}`} />
      </div>

      <div className="mt-5">
        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          {label}
        </div>
        <div className="text-3xl font-black text-slate-800">
          {value}
        </div>
      </div>
    </Card>
  );
}