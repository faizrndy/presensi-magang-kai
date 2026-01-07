import { CheckCircle2, Clock, XCircle, Calendar } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Attendance } from "../api/attendance.api";

// ✅ 1. Tambahkan attendances ke dalam Props (diambil dari App.tsx)
type AttendanceHistoryProps = {
  userName: string;
  attendances: Attendance[]; 
};

type HistoryItem = {
  type: "present" | "permission" | "absent";
  title: string;
  date: string;
  time: string;
  status: string;
  statusColor: string;
};

export function AttendanceHistory({ userName, attendances }: AttendanceHistoryProps) {
  // ✅ 2. HAPUS useState DAN useEffect LOKAL.
  // Kita langsung mengolah data dari Props agar Auto-Update.

  // Proteksi jika data bukan array
  const safeAttendances = Array.isArray(attendances) ? attendances : [];

  // Filter dan Map data secara real-time
  const history: HistoryItem[] = safeAttendances
    .filter((a) => a.intern?.toLowerCase().trim() === userName?.toLowerCase().trim())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Urutkan dari yang terbaru
    .slice(0, 10) // Ambil 10 terakhir
    .map((item) => {
      if (item.status === "hadir") {
        return {
          type: "present",
          title: "Hadir",
          date: formatDate(item.date),
          time: "—",
          status: "Hadir",
          statusColor: "bg-green-100 text-green-700",
        };
      }
      if (item.status === "izin") {
        return {
          type: "permission",
          title: "Izin",
          date: formatDate(item.date),
          time: "—",
          status: "Izin",
          statusColor: "bg-amber-100 text-amber-700",
        };
      }
      return {
        type: "absent",
        title: "Alpa",
        date: formatDate(item.date),
        time: "—",
        status: "Tidak Hadir",
        statusColor: "bg-red-100 text-red-700",
      };
    });

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  function getIcon(type: string) {
    switch (type) {
      case "present":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "permission":
        return <Clock className="w-5 h-5 text-amber-600" />;
      case "absent":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Calendar className="w-5 h-5 text-slate-600" />;
    }
  }

  return (
    <Card className="p-6 bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg text-slate-900 italic">
          Riwayat Absensi Terakhir
        </h2>
      </div>

      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Calendar className="w-12 h-12 mb-2 opacity-20" />
              <p className="text-sm">Belum ada riwayat absensi</p>
            </div>
          ) : (
            history.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:border-indigo-100 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mt-1">
                  {getIcon(item.type)}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-slate-800">
                      {item.title}
                    </h3>
                    <Badge
                      variant="secondary"
                      className={`${item.statusColor} border-0 text-[10px] font-bold`}
                    >
                      {item.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    {item.date}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}