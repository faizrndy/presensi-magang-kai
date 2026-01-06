import { useEffect, useState } from "react";
import { CheckCircle2, Clock, XCircle, Calendar } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { getAttendances, Attendance } from "../api/attendance.api";

type AttendanceHistoryProps = {
  userName: string;
};

type HistoryItem = {
  type: "present" | "permission" | "absent";
  title: string;
  date: string;
  time: string;
  status: string;
  statusColor: string;
};

export function AttendanceHistory({ userName }: AttendanceHistoryProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (!userName) return;
    loadHistory();
  }, [userName]);

  async function loadHistory() {
    const data: Attendance[] = await getAttendances();

    const filtered = data
      .filter((a) => a.intern === userName)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 10); // tampilkan 10 terakhir

    const mapped: HistoryItem[] = filtered.map((item) => {
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

    setHistory(mapped);
  }

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
    <Card className="p-6 bg-white/80 backdrop-blur-sm border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg text-slate-900">
          Riwayat Absensi Terakhir
        </h2>
      </div>

      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-3">
          {history.length === 0 && (
            <p className="text-slate-500 text-sm text-center py-8">
              Belum ada riwayat absensi
            </p>
          )}

          {history.map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-4 rounded-lg border border-slate-200 bg-white"
            >
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mt-1">
                {getIcon(item.type)}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-slate-900">
                    {item.title}
                  </h3>
                  <Badge
                    variant="secondary"
                    className={`${item.statusColor} border-0`}
                  >
                    {item.status}
                  </Badge>
                </div>
                <div className="text-sm text-slate-600">
                  {item.date}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
