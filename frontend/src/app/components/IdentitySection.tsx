import { User } from "lucide-react";
import { Card } from "./ui/card";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export const SHIFTS = {
  shift1: {
    label: "Shift 1 (07:30 – 13:30)",
    start: "07:30",
    end: "13:30",
  },
  shift2: {
    label: "Shift 2 (12:30 – 18:30)",
    start: "12:30",
    end: "18:30",
  },
  piket: {
    label: "Piket (08:00 – 16:00)",
    start: "08:00",
    end: "16:00",
  },
};

export type ShiftKey = keyof typeof SHIFTS;
export type AttendanceType = ShiftKey | "izin";

export interface Intern {
  id: number;
  name: string;
  school: string;
}

interface IdentitySectionProps {
  interns: Intern[];
  userName: string;
  school: string;
  selectedShift: AttendanceType | "";
  isLocked: boolean; // 🔒 KUNCI SETELAH CHECK-IN
  onUserNameChange: (name: string) => void;
  onShiftChange: (shift: AttendanceType) => void;
}

export function IdentitySection({
  interns,
  userName,
  school,
  selectedShift,
  isLocked,
  onUserNameChange,
  onShiftChange,
}: IdentitySectionProps) {
  return (
    <Card className="p-6 bg-white shadow-sm rounded-2xl">
      <div className="flex gap-4">
        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
          <User className="w-6 h-6 text-white" />
        </div>

        <div className="flex-1">
          <h2 className="font-bold text-lg text-slate-800">
            Identitas Peserta
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Pilih nama dan status kehadiran hari ini.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* NAMA */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold uppercase">
                Nama Peserta
              </Label>
              <Select value={userName} onValueChange={onUserNameChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih nama" />
                </SelectTrigger>
                <SelectContent>
                  {interns.map((i) => (
                    <SelectItem key={i.id} value={i.name}>
                      {i.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* SEKOLAH */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold uppercase">
                Asal Sekolah / Kampus
              </Label>
              <div className="h-10 px-3 flex items-center bg-slate-100 rounded-lg text-sm">
                {school || "—"}
              </div>
            </div>

            {/* STATUS KEHADIRAN */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold uppercase">
                Status Kehadiran
              </Label>

              <Select
                value={selectedShift}
                disabled={isLocked}   // 🔒 DIKUNCI DI SINI
                onValueChange={(value) =>
                  onShiftChange(value as AttendanceType)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>

                <SelectContent>
                  {Object.entries(SHIFTS).map(([key, shift]) => (
                    <SelectItem key={key} value={key}>
                      {shift.label}
                    </SelectItem>
                  ))}
                  <SelectItem value="izin">Izin</SelectItem>
                </SelectContent>
              </Select>

              {isLocked && (
                <p className="text-[11px] text-slate-400 italic">
                  Status kehadiran terkunci setelah check-in
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
