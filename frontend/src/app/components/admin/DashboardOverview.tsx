import { useEffect, useState } from "react";
import {
  Users,
  UserX,
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
  status: "hadir" | "izin" | "libur" | "alpa";
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
  return null;
}

/* ================= COMPONENT ================= */
export function DashboardOverview() {
  const [totalInterns, setTotalInterns] = useState(0);
  const [hadirHariIni, setHadirHariIni] = useState(0);
  const [izinHariIni, setIzinHariIni] = useState(0);
  const [liburHariIni, setLiburHariIni] = useState(0);
  const [alpaHariIni, setAlpaHariIni] = useState(0);
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

    const alpa = interns.length - hadir - izin - libur;

    setHadirHariIni(hadir);
    setIzinHariIni(izin);
    setLiburHariIni(libur);
    setAlpaHariIni(alpa);

    setActivities(todayActivities.slice(-5).reverse());
  }

  /* ================= UI ================= */
  return (
    <div className="space-y-6">
      {/* ===== SUMMARY ===== */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <SummaryCard icon={<Users />} label="Total Peserta" value={totalInterns} />
        <SummaryCard icon={<CheckCircle2 />} label="Hadir" value={hadirHariIni} />
        <SummaryCard icon={<Clock />} label="Izin" value={izinHariIni} />
        <SummaryCard icon={<CalendarOff />} label="Libur" value={liburHariIni} />
        <SummaryCard icon={<UserX />} label="Alpa" value={alpaHariIni} />
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
            <ul className="space-y-4">
              {activities.map((a, i) => (
                <li key={i} className="border-b pb-3 text-sm">
                  {/* NAMA */}
                  <p className="font-medium text-slate-800">
                    {a.name}
                  </p>

                  {/* BADGE STATUS */}
                  <div className="flex gap-2 mt-1">
                    {a.status === "hadir" && (
                      <>
                        <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">
                          HADIR
                        </span>
                        {a.shift && (
                          <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                            {shiftLabel(a.shift)}
                          </span>
                        )}
                      </>
                    )}

                    {a.status === "izin" && (
                      <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700">
                        IZIN
                      </span>
                    )}

                    {a.status === "libur" && (
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                        LIBUR
                      </span>
                    )}

                    {a.status === "alpa" && (
                      <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700">
                        ALPA
                      </span>
                    )}
                  </div>

                  {/* DETAIL */}
                  {a.status === "hadir" && (
                    <p className="text-slate-600 mt-1">
                      Masuk {formatTime(a.jam_masuk)} • Pulang{" "}
                      {formatTime(a.jam_keluar)}
                    </p>
                  )}

                  {a.status === "izin" && (
                    <p className="text-slate-500 mt-1">
                      Klik izin {formatTime(a.jam_masuk)}
                    </p>
                  )}

                  {a.status === "libur" && (
                    <p className="text-slate-500 mt-1">
                      Klik libur {formatTime(a.jam_masuk)}
                    </p>
                  )}

                  {a.status === "alpa" && (
                    <p className="text-red-600 mt-1">
                      Tidak hadir
                    </p>
                  )}
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
