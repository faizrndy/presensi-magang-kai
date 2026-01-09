import { useEffect, useState } from "react";
import {
  Users,
  UserCheck,
  UserX,
  CalendarClock,
  TrendingUp,
} from "lucide-react";

import { Card } from "../ui/card";
import { getInterns } from "../../api/intern.api";
import { getAttendanceHistory } from "../../api/attendance.api";

/* ===============================
   TYPES
================================ */
type Activity = {
  name: string;
  status: "hadir" | "izin" | "alpa";
  shift: "shift1" | "shift2" | "piket";
  tanggal: string;
  jam_masuk: string | null;
  jam_keluar: string | null;
  telat_menit: number;
  pulang_awal_menit: number;
};

type Intern = {
  id: number;
  name: string;
};

/* ===============================
   SHIFT INFO
================================ */
const SHIFT_INFO = {
  shift1: "Shift 1 (07:30 – 13:30)",
  shift2: "Shift 2 (12:30 – 18:30)",
  piket: "Piket (08:00 – 16:00)",
};

/* ===============================
   HELPERS
================================ */
function isToday(dateString: string) {
  const today = new Date();
  const d = new Date(dateString);

  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/* ===============================
   COMPONENT
================================ */
export function DashboardOverview() {
  const [totalInterns, setTotalInterns] = useState(0);
  const [hadirHariIni, setHadirHariIni] = useState(0);
  const [izinHariIni, setIzinHariIni] = useState(0);
  const [alpaHariIni, setAlpaHariIni] = useState(0);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const interns: Intern[] = await getInterns();
      setTotalInterns(interns.length);

      let hadir = 0;
      let izin = 0;
      const todayActivities: Activity[] = [];

      for (const intern of interns) {
        const history = await getAttendanceHistory(intern.id);

        const todayAttendance = history.find(a =>
          isToday(a.tanggal)
        );

        if (!todayAttendance) continue;

        if (todayAttendance.status === "hadir") hadir++;
        if (todayAttendance.status === "izin") izin++;

        todayActivities.push({
          name: intern.name,
          status: todayAttendance.status,
          shift: todayAttendance.shift,
          tanggal: todayAttendance.tanggal,
          jam_masuk: todayAttendance.jam_masuk,
          jam_keluar: todayAttendance.jam_keluar,
          telat_menit: todayAttendance.telat_menit,
          pulang_awal_menit: todayAttendance.pulang_awal_menit,
        });
      }

      const alpa = interns.length - hadir - izin;

      setHadirHariIni(hadir);
      setIzinHariIni(izin);
      setAlpaHariIni(alpa);

      setActivities(todayActivities.slice(-5).reverse());
    } catch (err) {
      console.error("Gagal load dashboard overview", err);
    }
  }

  /* ===============================
     UI
  ================================ */
  return (
    <div className="space-y-6">
      {/* ===== SUMMARY ===== */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard icon={<Users />} label="Total Peserta" value={totalInterns} />
        <SummaryCard icon={<UserCheck />} label="Hadir Hari Ini" value={hadirHariIni} />
        <SummaryCard icon={<UserX />} label="Tidak Hadir" value={alpaHariIni} />
        <SummaryCard icon={<CalendarClock />} label="Total Izin" value={izinHariIni} />
      </div>

      {/* ===== ACTIVITY ===== */}
      <Card>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} />
            <h3 className="font-semibold">Aktivitas Terbaru</h3>
          </div>

          {activities.length === 0 ? (
            <p className="text-sm text-gray-500">
              Belum ada aktivitas hari ini
            </p>
          ) : (
            <ul className="space-y-4">
              {activities.map((a, i) => (
                <li
                  key={i}
                  className="flex justify-between items-start text-sm border-b pb-3"
                >
                  <div>
                    <p className="font-medium">{a.name}</p>

                    <p className="text-xs text-slate-500">
                      {SHIFT_INFO[a.shift]}
                    </p>

                    <p className="text-xs mt-1">
                      Masuk: <b>{a.jam_masuk || "—"}</b> · Pulang:{" "}
                      <b>{a.jam_keluar || "—"}</b>
                    </p>

                    {a.telat_menit > 0 && (
                      <p className="text-xs text-rose-600 mt-0.5">
                        ⏰ Terlambat {formatDuration(a.telat_menit)}
                      </p>
                    )}

                    {a.pulang_awal_menit > 0 && (
                      <p className="text-xs text-amber-600 mt-0.5">
                        ⏳ Pulang lebih awal{" "}
                        {formatDuration(a.pulang_awal_menit)}
                      </p>
                    )}
                  </div>

                  <p className="text-xs text-gray-400">
                    {formatDateTime(a.tanggal)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
    </div>
  );
}

/* ===============================
   MINI COMPONENT
================================ */
function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <Card>
      <div className="flex items-center gap-4 p-4">
        <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </Card>
  );
}
