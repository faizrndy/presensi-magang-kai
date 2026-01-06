import { useEffect, useState } from "react";
import {
  ArrowLeft,
  User,
  GraduationCap,
  CalendarCheck,
  CalendarX,
  AlertCircle,
} from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

import {
  getInternById,
  InternDetail as InternDetailType,
} from "../../api/intern.api";

interface InternDetailProps {
  internId: number;
  onBack: () => void;
}

export function InternDetail({ internId, onBack }: InternDetailProps) {
  const [intern, setIntern] = useState<InternDetailType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [internId]);

  async function loadData() {
    try {
      const data = await getInternById(internId);
      setIntern(data);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p className="p-6">Memuat data...</p>;

  if (!intern) {
    return (
      <div className="p-6">
        <Button onClick={onBack}>Kembali</Button>
        <p className="mt-4 text-red-600">Data peserta tidak ditemukan</p>
      </div>
    );
  }

  // 🔥 LANGSUNG DARI BACKEND
  const hadir = intern.hadir ?? 0;
  const izin = intern.izin ?? 0;
  const alpa = intern.alpa ?? 0;
  const percentage = `${intern.percentage ?? 0}%`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Detail Peserta Magang</h2>
          <p className="text-slate-600">Informasi lengkap peserta</p>
        </div>
      </div>

      {/* Profile */}
      <Card className="p-6">
        <div className="flex gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${intern.name}`}
            />
            <AvatarFallback>
              {intern.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>

          <div>
            <h3 className="text-2xl font-bold">{intern.name}</h3>
            <div className="flex items-center gap-2 text-slate-600 mt-2">
              <GraduationCap className="w-4 h-4" />
              {intern.school}
            </div>

            <span className="inline-block mt-3 px-3 py-1 rounded-full bg-green-100 text-green-700">
              {intern.status}
            </span>
          </div>
        </div>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SummaryCard label="Hadir" value={hadir} icon={CalendarCheck} color="green" />
        <SummaryCard label="Izin" value={izin} icon={AlertCircle} color="amber" />
        <SummaryCard label="Alpa" value={alpa} icon={CalendarX} color="red" />
        <SummaryCard label="Persentase" value={percentage} icon={User} color="blue" />
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number | string;
  icon: any;
  color: "green" | "amber" | "red" | "blue";
}) {
  const colorMap = {
    green: "border-green-500 text-green-600",
    amber: "border-amber-500 text-amber-600",
    red: "border-red-500 text-red-600",
    blue: "border-blue-500 text-blue-600",
  };

  return (
    <Card className={`p-6 border-l-4 ${colorMap[color]}`}>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-slate-600">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <Icon className={`w-8 h-8 ${colorMap[color]}`} />
      </div>
    </Card>
  );
}
