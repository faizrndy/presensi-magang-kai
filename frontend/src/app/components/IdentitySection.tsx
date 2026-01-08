import { useEffect } from "react";
import { User, Clock, Lock } from "lucide-react";
import { Card } from "./ui/card";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { TodayAttendance } from "../api/attendance.api";

export type Intern = {
  id: number;
  name: string;
  school: string;
};

interface IdentitySectionProps {
  interns: Intern[];
  userName: string;
  school: string;
  shift: "pagi" | "siang";
  todayAttendance: TodayAttendance | null;

  onUserNameChange: (name: string) => void;
  onSchoolChange: (school: string) => void;
  onShiftChange: (shift: "pagi" | "siang") => void;
}

export function IdentitySection({
  interns,
  userName,
  school,
  shift,
  todayAttendance,
  onUserNameChange,
  onSchoolChange,
  onShiftChange,
}: IdentitySectionProps) {
  /* ================= AUTO ISI SEKOLAH ================= */
  useEffect(() => {
    const selected = interns.find((i) => i.name === userName);
    if (selected) {
      onSchoolChange(selected.school);
    }
  }, [userName, interns, onSchoolChange]);

  /* ================= SHIFT DIKUNCI JIKA SUDAH PRESENSI ================= */
  const isShiftLocked = !!todayAttendance;

  useEffect(() => {
    if (todayAttendance?.shift) {
      onShiftChange(todayAttendance.shift);
    }
  }, [todayAttendance, onShiftChange]);

  return (
    <Card className="p-6 bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
          <User className="w-6 h-6 text-white" />
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <h2 className="font-semibold text-lg text-slate-900">
              Identitas Peserta
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Pilih nama dan shift kerja sebelum melakukan absensi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* ================= NAMA ================= */}
            <div className="space-y-2">
              <Label>Nama Peserta</Label>
              <Select value={userName} onValueChange={onUserNameChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih nama peserta" />
                </SelectTrigger>
                <SelectContent>
                  {interns.map((intern) => (
                    <SelectItem key={intern.id} value={intern.name}>
                      {intern.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ================= SEKOLAH ================= */}
            <div className="space-y-2">
              <Label>Asal Sekolah / Kampus</Label>
              <div className="px-3 py-2 border rounded-md bg-slate-100 text-slate-700">
                {school || "—"}
              </div>
            </div>

            {/* ================= SHIFT ================= */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-slate-500" />
                Shift Kerja
              </Label>

              <Select
                value={shift}
                onValueChange={(v) =>
                  !isShiftLocked && onShiftChange(v as "pagi" | "siang")
                }
                disabled={isShiftLocked}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih shift kerja" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="pagi">
                    Shift Pagi (08:00 – 13:00)
                  </SelectItem>
                  <SelectItem value="siang">
                    Shift Siang (12:00 – 16:00)
                  </SelectItem>
                </SelectContent>
              </Select>

              {isShiftLocked && (
                <p className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                  <Lock className="w-3 h-3" />
                  Shift dikunci karena sudah presensi hari ini
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
