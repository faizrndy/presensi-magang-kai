import { Card } from "./ui/card";
import { toast } from "sonner";
import { LogIn, CalendarClock, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
  shift: "pagi" | "siang";
  onSuccess: () => void;
};

/* ================= SHIFT CONFIG ================= */
const SHIFT_INFO = {
  pagi: {
    label: "Shift Pagi",
    start: "08:00",
    end: "13:00",
  },
  siang: {
    label: "Shift Siang",
    start: "12:00",
    end: "16:00",
  },
};

/* ================= HELPERS ================= */
function timeToMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function getCurrentMinutes() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

function formatDuration(minutes?: number) {
  if (!minutes || minutes <= 0) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
}

export function ActionCards({ internId, shift, onSuccess }: Props) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState<any>(null);

  const shiftInfo = SHIFT_INFO[shift];

  /* ================= LOAD TODAY ================= */
  useEffect(() => {
    if (!internId) return;
    getTodayAttendance(internId)
      .then(setTodayAttendance)
      .catch(() => setTodayAttendance(null));
  }, [internId]);

  /* ================= SHIFT TIME CHECK ================= */
  const isWithinShift = useMemo(() => {
    const now = getCurrentMinutes();
    return (
      now >= timeToMinutes(shiftInfo.start) &&
      now <= timeToMinutes(shiftInfo.end)
    );
  }, [shiftInfo]);

  /* ================= HANDLERS ================= */
  async function handleCheckIn() {
    if (isProcessing || todayAttendance?.jam_masuk) return;

    if (!isWithinShift) {
      toast.error(`Check in di luar jam ${shiftInfo.label}`);
      return;
    }

    setIsProcessing(true);
    try {
      await checkIn(internId, shift);
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
      await izin(internId, shift);
      toast.success("Izin berhasil dicatat");
      onSuccess();
      setTodayAttendance(await getTodayAttendance(internId));
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsProcessing(false);
    }
  }

  const disableCheckIn =
    isProcessing ||
    todayAttendance?.jam_masuk ||
    !isWithinShift;

  const disableCheckOut =
    isProcessing ||
    !todayAttendance?.jam_masuk ||
    todayAttendance?.jam_keluar;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ================= CHECK IN ================= */}
        <Card
          onClick={!disableCheckIn ? handleCheckIn : undefined}
          className={`p-6 text-white border-none ${
            disableCheckIn
              ? "bg-slate-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
          }`}
        >
          <div className="flex justify-between">
            <div>
              <p className="text-xl font-bold italic">Check In</p>

              <p className="text-sm opacity-90">
                Jam Masuk: {todayAttendance?.jam_masuk || "—"}
              </p>

              {todayAttendance?.telat_menit > 0 && (
                <div className="mt-1 text-xs text-rose-100/90">
                  <b>{shiftInfo.label}</b> • Terlambat{" "}
                  {formatDuration(todayAttendance.telat_menit)}
                  <br />
                  <span className="opacity-80">
                    (Jam masuk {shiftInfo.start})
                  </span>
                </div>
              )}
            </div>

            {isProcessing ? <Loader2 className="animate-spin" /> : <LogIn />}
          </div>
        </Card>

        {/* ================= CHECK OUT ================= */}
        <Card
          onClick={!disableCheckOut ? handleCheckOut : undefined}
          className={`p-6 text-white border-none ${
            disableCheckOut
              ? "bg-slate-400 cursor-not-allowed"
              : "bg-orange-600 hover:bg-orange-700 cursor-pointer"
          }`}
        >
          <div className="flex justify-between">
            <div>
              <p className="text-xl font-bold italic">Check Out</p>

              <p className="text-sm opacity-90">
                Jam Keluar: {todayAttendance?.jam_keluar || "—"}
              </p>

              {todayAttendance?.pulang_awal_menit > 0 && (
                <div className="mt-1 text-xs text-amber-100/90">
                  <b>{shiftInfo.label}</b> • Pulang lebih awal{" "}
                  {formatDuration(todayAttendance.pulang_awal_menit)}
                  <br />
                  <span className="opacity-80">
                    (Jam pulang {shiftInfo.end})
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
          disabled={!!todayAttendance || isProcessing}
          className="text-sm px-4 py-1.5 border rounded-md text-red-500 border-red-300 disabled:opacity-40"
        >
          Ajukan Izin
        </button>
      </div>
    </div>
  );
}
