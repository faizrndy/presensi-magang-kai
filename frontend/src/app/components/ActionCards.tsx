import { Card } from "./ui/card";
import { toast } from "sonner";
import { LogIn, CalendarClock, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  checkIn,
  checkOut,
  getTodayAttendance,
  izin,
} from "../api/attendance.api";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

type Props = {
  internId: number;
  onSuccess: () => void;
};

function formatDuration(minutes?: number) {
  if (!minutes || minutes <= 0) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
}

export function ActionCards({ internId, onSuccess }: Props) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState<any>(null);

  useEffect(() => {
    if (!internId) return;
    getTodayAttendance(internId)
      .then(setTodayAttendance)
      .catch(() => setTodayAttendance(null));
  }, [internId]);

  async function handleCheckIn() {
    if (isProcessing || todayAttendance?.jam_masuk) return;
    setIsProcessing(true);
    try {
      await checkIn(internId);
      toast.success("Check in berhasil");
      onSuccess();
      setTodayAttendance(await getTodayAttendance(internId));
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleCheckOut() {
    if (
      isProcessing ||
      !todayAttendance?.jam_masuk ||
      todayAttendance?.jam_keluar
    )
      return;

    setIsProcessing(true);
    try {
      await checkOut(internId);
      toast.success("Check out berhasil");
      onSuccess();
      setTodayAttendance(await getTodayAttendance(internId));
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleIzin() {
    if (isProcessing || todayAttendance) return;
    setIsProcessing(true);
    try {
      await izin(internId);
      toast.success("Izin berhasil dicatat");
      onSuccess();
      setTodayAttendance(await getTodayAttendance(internId));
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ================= CHECK IN ================= */}
        <Card
          onClick={handleCheckIn}
          className={`p-6 text-white cursor-pointer border-none ${
            todayAttendance?.jam_masuk || isProcessing
              ? "bg-slate-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          <div className="flex justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold italic">Check In</p>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help text-white/70 text-sm">
                        ⓘ
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs leading-relaxed">
                        Jam kerja mulai pukul <b>08:00</b>
                        <br />
                        Masuk setelah jam ini dihitung terlambat
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <p className="text-sm opacity-90">
                Jam Masuk: {todayAttendance?.jam_masuk || "—"}
              </p>

              {todayAttendance?.telat_menit > 0 && (
                <div className="mt-1 flex items-center gap-1 text-xs text-rose-100/90">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-200" />
                  <span>
                    Terlambat{" "}
                    {formatDuration(todayAttendance.telat_menit)}
                  </span>
                </div>
              )}
            </div>

            {isProcessing ? (
              <Loader2 className="animate-spin" />
            ) : (
              <LogIn />
            )}
          </div>
        </Card>

        {/* ================= CHECK OUT ================= */}
        <Card
          onClick={handleCheckOut}
          className={`p-6 text-white cursor-pointer border-none ${
            !todayAttendance?.jam_masuk ||
            todayAttendance?.jam_keluar ||
            isProcessing
              ? "bg-slate-400 cursor-not-allowed"
              : "bg-orange-600 hover:bg-orange-700"
          }`}
        >
          <div className="flex justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold italic">Check Out</p>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help text-white/70 text-sm">
                        ⓘ
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs leading-relaxed">
                        Jam kerja selesai pukul <b>16:00</b>
                        <br />
                        Pulang sebelum jam ini dihitung pulang lebih awal
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <p className="text-sm opacity-90">
                Jam Keluar: {todayAttendance?.jam_keluar || "—"}
              </p>

              {todayAttendance?.pulang_awal_menit > 0 && (
                <div className="mt-1 flex items-center gap-1 text-xs text-amber-100/90">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-200" />
                  <span>
                    Pulang lebih awal{" "}
                    {formatDuration(
                      todayAttendance.pulang_awal_menit
                    )}
                  </span>
                </div>
              )}
            </div>

            {isProcessing ? (
              <Loader2 className="animate-spin" />
            ) : (
              <CalendarClock />
            )}
          </div>
        </Card>
      </div>

      {/* ================= IZIN ================= */}
      <div className="flex justify-center mt-4">
        <button
          onClick={handleIzin}
          disabled={!!todayAttendance}
          className="text-sm px-4 py-1.5 border rounded-md text-red-500 border-red-300 disabled:opacity-40"
        >
          Ajukan Izin
        </button>
      </div>
    </div>
  );
}
