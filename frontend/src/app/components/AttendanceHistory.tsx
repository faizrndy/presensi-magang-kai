import {
  CheckCircle2,
  Clock,
  XCircle,
  Calendar,
} from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { AttendanceHistory as Attendance } from "../api/attendance.api";

/* ================= TYPES ================= */
type ShiftType = "shift1" | "shift2" | "piket";

/* ================= SHIFT LABEL ================= */
const SHIFT_LABEL: Record<
  ShiftType,
  { label: string; time: string }
> = {
  shift1: { label: "Shift 1", time: "07:30 – 13:30" },
  shift2: { label: "Shift 2", time: "12:30 – 18:30" },
  piket: { label: "Piket", time: "08:00 – 16:00" },
};

type Props = {
  attendances?: Attendance[] | null;
};

/* ================= HELPERS ================= */
function formatDuration(minutes?: number) {
  if (!minutes || minutes <= 0) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
}

function getShiftInfo(shift?: string) {
  if (shift && SHIFT_LABEL[shift as ShiftType]) {
    return SHIFT_LABEL[shift as ShiftType];
  }
  return null;
}

function getStatusIcon(status?: string) {
  if (status === "hadir")
    return <CheckCircle2 className="text-green-600" />;
  if (status === "izin")
    return <Clock className="text-amber-600" />;
  return <XCircle className="text-red-600" />;
}

/* ================= COMPONENT ================= */
export function AttendanceHistory({ attendances }: Props) {
  const safeData = Array.isArray(attendances) ? attendances : [];

  const history = [...safeData]
    .sort(
      (a, b) =>
        new Date(b.tanggal).getTime() -
        new Date(a.tanggal).getTime()
    )
    .slice(0, 10);

  return (
    <Card className="p-6 bg-white/80 backdrop-blur-sm">
      <h2 className="font-semibold text-lg italic mb-4">
        Riwayat Absensi Terakhir
      </h2>

      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-3">
          {history.length === 0 && (
            <div className="text-center text-slate-400 py-12">
              <Calendar className="mx-auto mb-2 opacity-20" />
              Belum ada riwayat absensi
            </div>
          )}

          {history.map((item, i) => {
            const shiftInfo = getShiftInfo(item.shift);
            const isAlpa = item.status === "alpa";

            return (
              <div
                key={i}
                className="flex gap-4 p-4 rounded-xl border border-slate-100 bg-white"
              >
                {/* ICON */}
                <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center">
                  {getStatusIcon(item.status)}
                </div>

                <div className="flex-1">
                  {/* HEADER */}
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold capitalize text-slate-800">
                      {item.status}
                    </h3>
                    <Badge className="text-[10px] capitalize">
                      {item.status}
                    </Badge>
                  </div>

                  {/* TANGGAL */}
                  <div className="text-xs text-slate-500">
                    {new Date(item.tanggal).toLocaleDateString(
                      "id-ID",
                      {
                        weekday: "long",
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </div>

                  {/* ⛔ SHIFT & JAM HANYA JIKA BUKAN ALPA */}
                  {!isAlpa && shiftInfo && (
                    <>
                      {/* SHIFT */}
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {shiftInfo.label} ({shiftInfo.time})
                      </div>

                      {/* DETAIL JAM */}
                      <div className="text-[11px] text-slate-400 mt-1">
                        {item.jam_masuk && (
                          <span>Masuk {item.jam_masuk}</span>
                        )}

                        {item.telat_menit > 0 && (
                          <span className="text-rose-500/80">
                            {" "}
                            · Terlambat{" "}
                            {formatDuration(item.telat_menit)}
                          </span>
                        )}

                        {item.jam_keluar && (
                          <span>
                            {" "}
                            · Pulang {item.jam_keluar}
                          </span>
                        )}

                        {item.pulang_awal_menit > 0 && (
                          <span className="text-amber-500/80">
                            {" "}
                            · Pulang awal{" "}
                            {formatDuration(item.pulang_awal_menit)}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </Card>
  );
}
