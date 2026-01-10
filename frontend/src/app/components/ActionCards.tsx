import { Card } from "./ui/card";
import { toast } from "sonner";
import { LogIn, CalendarClock, Loader2 } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import {
  checkIn,
  checkOut,
  getTodayAttendance,
  izin,
  TodayAttendance,
} from "../api/attendance.api";

/* ================= TYPES ================= */
export type ShiftType = "shift1" | "shift2" | "piket";

type Props = {
  internId: number;
  shift: ShiftType; // dari dropdown (HANYA sebelum check-in)
  onSuccess: () => void;
};

/* ================= SHIFT CONFIG ================= */
const SHIFT_INFO: Record<
  ShiftType,
  { label: string; start: string; end: string }
> = {
  shift1: { label: "Shift 1", start: "07:30", end: "13:30" },
  shift2: { label: "Shift 2", start: "12:30", end: "18:30" },
  piket: { label: "Piket", start: "08:00", end: "16:00" },
};

/* ================= HELPERS ================= */
function formatDuration(minutes?: number) {
  if (!minutes || minutes <= 0) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
}

function isValidShift(val: any): val is ShiftType {
  return val === "shift1" || val === "shift2" || val === "piket";
}

/* ================= COMPONENT ================= */
export function ActionCards({ internId, shift, onSuccess }: Props) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [todayAttendance, setTodayAttendance] =
    useState<TodayAttendance | null>(null);

  /* ================= LOAD TODAY ================= */
  useEffect(() => {
    if (!internId) {
      setTodayAttendance(null);
      return;
    }

    getTodayAttendance(internId)
      .then(setTodayAttendance)
      .catch(() => setTodayAttendance(null));
  }, [internId]);

  /* ================= SHIFT FINAL (TERKUNCI) ================= */
  const activeShift: ShiftType = useMemo(() => {
    // 🔒 JIKA SUDAH CHECK-IN / IZIN / ALPA → PAKAI SHIFT DATABASE
    if (isValidShift(todayAttendance?.shift)) {
      return todayAttendance.shift;
    }

    // ⛔ BELUM CHECK-IN → BOLEH DARI DROPDOWN
    if (isValidShift(shift)) {
      return shift;
    }

    return "shift1";
  }, [todayAttendance, shift]);

  const shiftInfo = SHIFT_INFO[activeShift];

  /* ================= HANDLERS ================= */
  async function handleCheckIn() {
    if (
      isProcessing ||
      todayAttendance?.jam_masuk ||
      todayAttendance?.status === "alpa"
    )
      return;

    setIsProcessing(true);
    try {
      await checkIn(internId, activeShift);
      toast.success("Check in berhasil");
      onSuccess();
      setTodayAttendance(await getTodayAttendance(internId));
    } catch (e: any) {
      toast.error(e.message || "Gagal check in");
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
      toast.error(e.message || "Gagal check out");
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleIzin() {
    if (isProcessing || todayAttendance) return;

    setIsProcessing(true);
    try {
      await izin(internId, activeShift);
      toast.success("Izin berhasil dicatat");
      onSuccess();
      setTodayAttendance(await getTodayAttendance(internId));
    } catch (e: any) {
      toast.error(e.message || "Gagal mengajukan izin");
    } finally {
      setIsProcessing(false);
    }
  }

  /* ================= DISABLE LOGIC ================= */
  const disableCheckIn =
    isProcessing ||
    !!todayAttendance?.jam_masuk ||
    todayAttendance?.status === "alpa";

  const disableCheckOut =
    isProcessing ||
    !todayAttendance?.jam_masuk ||
    !!todayAttendance?.jam_keluar;

  /* ================= UI ================= */
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
              <p className="text-xs opacity-90">
                {shiftInfo.label} • {shiftInfo.start} – {shiftInfo.end}
              </p>

              <p className="text-sm opacity-90 mt-1">
                Jam Masuk: {todayAttendance?.jam_masuk || "—"}
              </p>

              {todayAttendance?.telat_menit > 0 && (
                <div className="mt-1 text-xs text-rose-100">
                  Terlambat{" "}
                  {formatDuration(todayAttendance.telat_menit)}
                </div>
              )}

              {todayAttendance?.jam_masuk && (
                <div className="mt-1 text-[10px] opacity-80">
                  🔒 Shift terkunci setelah check-in
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
              <p className="text-xs opacity-90">
                {shiftInfo.label} • {shiftInfo.start} – {shiftInfo.end}
              </p>

              <p className="text-sm opacity-90 mt-1">
                Jam Keluar: {todayAttendance?.jam_keluar || "—"}
              </p>

              {todayAttendance?.pulang_awal_menit > 0 && (
                <div className="mt-1 text-xs text-amber-100">
                  Pulang lebih awal{" "}
                  {formatDuration(todayAttendance.pulang_awal_menit)}
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
