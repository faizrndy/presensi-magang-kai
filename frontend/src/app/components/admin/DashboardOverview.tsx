import { useEffect, useState } from "react";
import {
  Users,
  TrendingUp,
  CalendarOff,
  Clock,
  CheckCircle2,
} from "lucide-react";

import { Card } from "../ui/card";
import { getInterns } from "../../api/intern.api";
import { getAttendanceHistory } from "../../api/attendance.api";

/* ================= TYPES ================= */
type Activity = {
  name: string;
  status: "hadir" | "izin" | "libur";
  shift?: "shift1" | "shift2" | "piket";
  tanggal: string;
  jam_masuk: string | null;
  jam_keluar: string | null;
};

type Intern = {
  id: number;
  name: string;
};

/* ================= HELPERS ================= */
function isToday(dateString: string) {
  const today = new Date();
  const d = new Date(dateString);

  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

function formatTime(time?: string | null) {
  if (!time) return "-";
  return time.slice(0, 5);
}

function shiftLabel(shift?: Activity["shift"]) {
  if (shift === "shift1") return "Shift 1";
  if (shift === "shift2") return "Shift 2";
  if (shift === "piket") return "Piket";
  return "";
}

function shiftBadgeStyle(shift?: Activity["shift"]) {
  if (shift === "shift1") return "bg-blue-100 text-blue-700";
  if (shift === "shift2") return "bg-purple-100 text-purple-700";
  if (shift === "piket") return "bg-cyan-100 text-cyan-700";
  return "bg-slate-100 text-slate-600";
}

/* ================= COMPONENT ================= */
export function DashboardOverview() {
  const [totalInterns, setTotalInterns] = useState(0);
  const [hadirHariIni, setHadirHariIni] = useState(0);
  const [izinHariIni, setIzinHariIni] = useState(0);
  const [liburHariIni, setLiburHariIni] = useState(0);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const interns: Intern[] = await getInterns();
    setTotalInterns(interns.length);

    let hadir = 0;
    let izin = 0;
    let libur = 0;

    const todayActivities: Activity[] = [];

    for (const intern of interns) {
      const history = await getAttendanceHistory(intern.id);
      const today = history.find((h) => isToday(h.tanggal));

      if (!today) continue;

      if (today.status === "hadir") hadir++;
      if (today.status === "izin") izin++;
      if (today.status === "libur") libur++;

      todayActivities.push({
        name: intern.name,
        status: today.status,
        shift: today.shift,
        tanggal: today.tanggal,
        jam_masuk: today.jam_masuk,
        jam_keluar: today.jam_keluar,
      });
    }

    setHadirHariIni(hadir);
    setIzinHariIni(izin);
    setLiburHariIni(libur);
    setActivities(todayActivities.slice(-5).reverse());
  }

  /* ================= UI ================= */
  return (
    <div className="space-y-6">
      {/* ===== SUMMARY ===== */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard icon={<Users />} label="Total Peserta" value={totalInterns} />
        <SummaryCard icon={<CheckCircle2 />} label="Hadir" value={hadirHariIni} />
        <SummaryCard icon={<Clock />} label="Izin" value={izinHariIni} />
        <SummaryCard icon={<CalendarOff />} label="Libur" value={liburHariIni} />
      </div>

      {/* ===== ACTIVITY ===== */}
      <Card>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} />
            <h3 className="font-semibold">Aktivitas Hari Ini</h3>
          </div>

          {activities.length === 0 ? (
            <p className="text-sm text-gray-500">
              Belum ada aktivitas hari ini
            </p>
          ) : (
            <ul className="space-y-3">
              {activities.map((a, i) => (
                <li
                  key={i}
                  className="flex items-start gap-4 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition"
                >
                  {/* STATUS BADGE */}
                  <div>
                    {a.status === "hadir" && (
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-700">
                        HADIR
                      </span>
                    )}
                    {a.status === "izin" && (
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-700">
                        IZIN
                      </span>
                    )}
                    {a.status === "libur" && (
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-200 text-slate-700">
                        LIBUR
                      </span>
                    )}
                  </div>

                  {/* CONTENT */}
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">{a.name}</p>

                    {a.status === "hadir" && (
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-sm">
                        {a.shift && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${shiftBadgeStyle(
                              a.shift
                            )}`}
                          >
                            {shiftLabel(a.shift)}
                          </span>
                        )}
                        <span className="text-slate-600">
                          Masuk {formatTime(a.jam_masuk)} • Pulang{" "}
                          {formatTime(a.jam_keluar)}
                        </span>
                      </div>
                    )}

                    {a.status === "izin" && (
                      <p className="text-sm text-slate-500 mt-0.5">
                        Mengajukan izin pukul {formatTime(a.jam_masuk)}
                      </p>
                    )}

                    {a.status === "libur" && (
                      <p className="text-sm text-slate-500 mt-0.5">
                        Tidak ada absensi (otomatis sistem)
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
    </div>
  );
}

/* ================= MINI COMPONENT ================= */
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
