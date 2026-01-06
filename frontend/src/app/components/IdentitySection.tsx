import { useEffect } from "react";
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

export type Intern = {
  id: number;
  name: string;
  school: string;
};

interface IdentitySectionProps {
  interns: Intern[];
  userName: string;
  school: string;
  onUserNameChange: (name: string) => void;
  onSchoolChange: (school: string) => void;
}

export function IdentitySection({
  interns,
  userName,
  school,
  onUserNameChange,
  onSchoolChange,
}: IdentitySectionProps) {
  /** 🔹 ketika nama berubah → sekolah otomatis ikut */
  useEffect(() => {
    const selected = interns.find((i) => i.name === userName);
    if (selected) {
      onSchoolChange(selected.school);
    }
  }, [userName, interns, onSchoolChange]);

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
              Pilih nama Anda sebelum melakukan absensi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ================= NAMA PESERTA ================= */}
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

            {/* ================= ASAL SEKOLAH ================= */}
            <div className="space-y-2">
              <Label>Asal Sekolah / Kampus</Label>
              <div className="px-3 py-2 border rounded-md bg-slate-100 text-slate-700">
                {school || "—"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
