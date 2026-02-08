import { Card } from "./ui/card";
import { LogOut, ArrowRight } from "lucide-react";
import { SHIFTS, ShiftKey } from "./IdentitySection";
import {
  checkInAttendance,
  checkOutAttendance,
} from "../api/attendance.api";

interface ActionCardsProps {
  internId: number;
  shift: ShiftKey | "";
  alreadyCheckedIn: boolean;
  alreadyCheckedOut: boolean;
  onCheckInSuccess: () => void;   // ✅ WAJIB
  onCheckOutSuccess: () => void;  // ✅ WAJIB
}

export function ActionCards({
  internId,
  shift,
  alreadyCheckedIn,
  alreadyCheckedOut,
  onCheckInSuccess,
  onCheckOutSuccess,
}: ActionCardsProps) {
  const shiftData = shift ? SHIFTS[shift] : null;

  const checkInDisabled =
    alreadyCheckedIn || !shift;

  const checkOutDisabled =
    !alreadyCheckedIn || alreadyCheckedOut;

  async function handleCheckIn() {
    if (checkInDisabled) return;

    try {
      await checkInAttendance({
        intern_id: internId,
        shift,
      });

      // 🔥 UI update
      onCheckInSuccess();
    } catch (err: any) {
      // kalau backend bilang sudah ada, anggap sukses
      if (err?.message?.includes("sudah ada")) {
        onCheckInSuccess();
        return;
      }
      alert(err.message || "Gagal check-in");
    }
  }

  async function handleCheckOut() {
    if (checkOutDisabled) return;

    try {
      await checkOutAttendance({
        intern_id: internId,
      });
      onCheckOutSuccess();
    } catch (err: any) {
      alert(err.message || "Gagal check-out");
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      {/* CHECK IN */}
      <Card
        onClick={checkInDisabled ? undefined : handleCheckIn}
        className={`p-5 rounded-xl text-white ${
          checkInDisabled
            ? "bg-blue-300 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
        }`}
      >
        <div className="flex justify-between">
          <div>
            <h3 className="text-xl font-bold italic">
              {alreadyCheckedIn ? "Sudah Check In" : "Check In"}
            </h3>
            {shiftData && (
              <>
                <p className="text-xs">{shiftData.label}</p>
                <p className="text-xs">Jam Masuk: {shiftData.start}</p>
              </>
            )}
          </div>
          <ArrowRight />
        </div>
      </Card>

      {/* CHECK OUT */}
      <Card
        onClick={checkOutDisabled ? undefined : handleCheckOut}
        className={`p-5 rounded-xl text-white ${
          checkOutDisabled
            ? "bg-slate-300 cursor-not-allowed"
            : "bg-slate-500 hover:bg-slate-600 cursor-pointer"
        }`}
      >
        <div className="flex justify-between">
          <div>
            <h3 className="text-xl font-bold italic">
              {alreadyCheckedOut ? "Sudah Check Out" : "Check Out"}
            </h3>
            {shiftData && (
              <>
                <p className="text-xs">{shiftData.label}</p>
                <p className="text-xs">Jam Keluar: realtime</p>
              </>
            )}
          </div>
          <LogOut />
        </div>
      </Card>
    </div>
  );
}
