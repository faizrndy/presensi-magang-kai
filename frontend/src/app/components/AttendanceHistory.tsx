import {
  CheckCircle2,
  Clock,
  XCircle,
  Calendar,
} from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import type { AttendanceHistory as Attendance } from "../api/attendance.api";

/* ================= SHIFT TYPES ================= */
type ShiftType = "shift1" | "shift2" | "piket";

/* ================= SHIFT CONFIG ================= */
const SHIFT_INFO: Record<
  ShiftType,
  { label: string; time: string }
> = {
  shift1: { label: "Shift 1", time: "07:30 – 13:30" },
  shift2: { label: "Shift 2", time: "12:30 – 18:30" },
  piket: { label: "Piket", time: "08:00 – 16:00" },
};

/* ================= PROPS ================= */
interface Props {
  attendances?: Attendance[] | null;
}

/* ================= HELPERS ================= */
function formatDuration(minutes?: number) {
  if (!minutes || minutes <= 0) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
}

function getStatusIcon(status?: string) {
  switch (status) {
    case "hadir":
      return <CheckCircle2 className="text-green-600" />;
    case "izin":
      return <Clock className="text-yellow-600" />;
    case "libur":
      return <Calendar className="text-blue-600" />;
    default:
      return <XCircle className="text-red-600" />;
  }
}

function statusBadgeClass(status?: string) {
  switch (status) {
    case "hadir":
      return "bg-green-100 text-green-700 border-green-300";
    case "izin":
      return "bg-yellow-100 text-yellow-700 border-yellow-300";
    case "libur":
      return "bg-blue-100 text-blue-700 border-blue-300";
    default:
      return "bg-gray-100 text-gray-600 border-gray-300";
  }
}

/* ================= COMPONENT ================= */
export function AttendanceHistory({ attendances }: Props) {
  const data = Array.isArray(attendances) ? attendances : [];

  const history = [...data]
    .filter((i) => i?.tanggal)
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

          {history.map((item, index) => {
            const isAlpa = item.status === "alpa";
            const shiftInfo =
              item.shift && SHIFT_INFO[item.shift as ShiftType];

            return (
              <div
                key={index}
                className="relative flex gap-4 p-4 rounded-xl border border-slate-100 bg-white"
              >
                {/* ================= STATUS BADGE (KOTAK) ================= */}
                <Badge
                  className={`
                    absolute top-3 right-3
                    text-xs px-2.5 py-1
                    rounded-md border
                    font-semibold capitalize
                    ${statusBadgeClass(item.status)}
                  `}
                >
                  {item.status}
                </Badge>

                {/* ================= ICON ================= */}
                <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center">
                  {getStatusIcon(item.status)}
                </div>

                <div className="flex-1">
                  {/* ================= TANGGAL ================= */}
                  <div className="text-sm font-semibold text-slate-800">
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

                  {/* ================= DETAIL ================= */}
                  {!isAlpa && shiftInfo && (
                    <>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {shiftInfo.label} ({shiftInfo.time})
                      </div>

                      <div className="text-xs text-slate-500 mt-1">
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
                            {formatDuration(
                              item.pulang_awal_menit
                            )}
                          </span>
                        )}
                      </div>
                    </>
                  )}

                  {isAlpa && (
                    <div className="text-xs text-red-500 mt-1">
                      Tidak melakukan absensi
                    </div>
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
