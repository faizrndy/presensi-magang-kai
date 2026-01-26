import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { LogOut, Loader2, ArrowRight, CalendarX } from "lucide-react";
import { SHIFTS, ShiftKey } from "./IdentitySection";
import {
  checkInAttendance,
  checkOutAttendance,
} from "../api/attendance.api";

interface ActionCardsProps {
  internId: number;
  shift: ShiftKey | "libur" | "izin" | "";
  onSuccess: () => void;
}

export function ActionCards({
  internId,
  shift,
  onSuccess,
}: ActionCardsProps) {
  const [loading, setLoading] = useState(false);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [hasCheckedOut, setHasCheckedOut] = useState(false);

  /* ================= RESET JIKA SHIFT BERUBAH ================= */
  useEffect(() => {
    setHasCheckedIn(false);
    setHasCheckedOut(false);
  }, [shift]);

  const isSpecial = shift === "libur" || shift === "izin";

  const shiftData =
    shift && !isSpecial ? SHIFTS[shift] : null;

  /* ================= DISABLED STATE ================= */
  const checkInDisabled =
    loading || hasCheckedIn || !shift;

  const checkOutDisabled =
    loading ||
    !hasCheckedIn ||
    hasCheckedOut ||
    isSpecial;

  /* ================= HANDLER ================= */
  async function handleCheckIn() {
    if (checkInDisabled || !shift) return;

    try {
      setLoading(true);

      await checkInAttendance({
        intern_id: internId,
        shift,
      });

      setHasCheckedIn(true);

      // Libur & Izin langsung selesai
      if (isSpecial) {
        setHasCheckedOut(true);
      }

      onSuccess();
    } catch (e) {
      console.error(e);
      alert("Gagal melakukan absensi");
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckOut() {
    if (checkOutDisabled) return;

    try {
      setLoading(true);

      await checkOutAttendance({
        intern_id: internId,
      });

      setHasCheckedOut(true);
      onSuccess();
    } catch (e) {
      console.error(e);
      alert("Gagal check-out");
    } finally {
      setLoading(false);
    }
  }

  /* ================= LABEL ================= */
  const checkInTitle =
    shift === "libur"
      ? "Libur"
      : shift === "izin"
      ? "Izin"
      : "Check In";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">

      {/* ================= CHECK IN / IZIN / LIBUR ================= */}
      <Card
        onClick={checkInDisabled ? undefined : handleCheckIn}
        className={`p-5 rounded-xl shadow-md transition-all text-white
          ${
            checkInDisabled
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
          }`}
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold italic">
              {checkInTitle}
            </h3>

            {shiftData && (
              <>
                <p className="text-xs mt-1">
                  {shiftData.label}
                </p>
                <p className="text-xs">
                  Jam Masuk: {shiftData.start}
                </p>
              </>
            )}

            {shift === "libur" && (
              <p className="text-xs mt-2 italic">
                Hari Libur
              </p>
            )}

            {shift === "izin" && (
              <p className="text-xs mt-2 italic">
                Izin Tidak Masuk
              </p>
            )}

            {!shift && (
              <p className="text-xs mt-2 italic opacity-80">
                Pilih shift / izin / libur
              </p>
            )}
          </div>

          <div className="bg-white/10 p-2 rounded-lg">
            {loading && !hasCheckedIn ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : isSpecial ? (
              <CalendarX className="w-6 h-6" />
            ) : (
              <ArrowRight className="w-6 h-6" />
            )}
          </div>
        </div>
      </Card>

      {/* ================= CHECK OUT ================= */}
      <Card
        onClick={checkOutDisabled ? undefined : handleCheckOut}
        className={`p-5 rounded-xl shadow-md transition-all text-white
          ${
            checkOutDisabled
              ? "bg-slate-300 cursor-not-allowed"
              : "bg-slate-500 hover:bg-slate-600 cursor-pointer"
          }`}
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold italic">
              Check Out
            </h3>

            {shiftData ? (
              <>
                <p className="text-xs mt-1">
                  {shiftData.label}
                </p>
                <p className="text-xs">
                  Jam Keluar: realtime
                </p>
              </>
            ) : (
              <p className="text-xs mt-2 italic opacity-80">
                Tidak perlu checkout
              </p>
            )}
          </div>

          <div className="bg-white/10 p-2 rounded-lg">
            <LogOut className="w-6 h-6" />
          </div>
        </div>
      </Card>

    </div>
  );
}
