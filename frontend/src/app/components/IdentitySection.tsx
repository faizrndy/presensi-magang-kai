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


interface IdentitySectionProps {
  interns: any[];
  userName: string;
  school: string;
  selectedShift: AttendanceType | "";
  onUserNameChange: (name: string) => void;
  onShiftChange: (shift: AttendanceType) => void;
}

export function IdentitySection({
  interns,
  userName,
  school,
  selectedShift,
  onUserNameChange,
  onShiftChange,
}: IdentitySectionProps) {
  return (
    <Card className="p-6 bg-white border-none shadow-sm rounded-2xl">
      <div className="flex flex-col md:flex-row items-start gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
          <User className="w-6 h-6 text-white" />
        </div>

        <div className="flex-1 w-full">
          <div className="mb-4">
            <h2 className="font-bold text-lg text-slate-800">
              Identitas Peserta
            </h2>
            <p className="text-xs text-slate-500">
              Pilih nama dan status kehadiran hari ini.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Nama */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-slate-600 uppercase">
                Nama Peserta
              </Label>
              <Select value={userName} onValueChange={onUserNameChange}>
                <SelectTrigger className="h-10 bg-slate-50 border-slate-200 rounded-lg">
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

            {/* Sekolah */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-slate-600 uppercase">
                Asal Sekolah / Kampus
              </Label>
              <div className="h-10 px-3 flex items-center bg-slate-100 border border-slate-200 rounded-lg text-slate-500 text-sm">
                {school || "—"}
              </div>
            </div>

            {/* Shift / Libur / Izin */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-slate-600 uppercase">
                Status Kehadiran
              </Label>
              <Select
                value={selectedShift}
                onValueChange={(value) =>
                  onShiftChange(value as AttendanceType)
                }
              >
                <SelectTrigger className="h-10 bg-slate-50 border-slate-200 rounded-lg">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>

                <SelectContent>
                  {/* ===== SHIFT ===== */}
                  {Object.entries(SHIFTS).map(([key, shift]) => (
                    <SelectItem key={key} value={key}>
                      {shift.label}
                    </SelectItem>
                  ))}

                  {/* ===== LIBUR & IZIN ===== */}
                  <SelectItem value="izin">Izin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
