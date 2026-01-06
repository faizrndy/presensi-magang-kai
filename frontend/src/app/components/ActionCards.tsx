// ActionCards.tsx
import { LogIn, CalendarClock } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { addAttendance, getAttendances } from "../api/attendance.api";
import { useEffect, useState } from "react";

type ActionCardsProps = {
  userName: string;
};

export function ActionCards({ userName }: ActionCardsProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (!userName) return;

    async function checkToday() {
      const data = await getAttendances();
      const already = data.find(
        (a) => a.intern === userName && a.date === today
      );
      setLocked(!!already);
    }

    checkToday();
  }, [userName, today]);

  async function handleSubmit(status: "hadir" | "izin") {
    if (locked) {
      toast.warning("Anda sudah presensi hari ini");
      return;
    }

    try {
      await addAttendance({
        intern: userName,
        date: today,
        status,
      });

      toast.success("Presensi berhasil dicatat");
      setLocked(true);
    } catch (err: any) {
      toast.error(err.message || "Gagal presensi");
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card
        onClick={() => handleSubmit("hadir")}
        className={`cursor-pointer ${
          locked ? "opacity-50 pointer-events-none" : "bg-indigo-600"
        }`}
      >
        <div className="p-6 text-white">
          <h3 className="text-xl font-bold">Masuk</h3>
          {locked && <Badge>Terkunci</Badge>}
        </div>
      </Card>

      <Card
        onClick={() => handleSubmit("izin")}
        className={`cursor-pointer ${
          locked ? "opacity-50 pointer-events-none" : "bg-orange-600"
        }`}
      >
        <div className="p-6 text-white">
          <h3 className="text-xl font-bold">Izin</h3>
        </div>
      </Card>
    </div>
  );
}
