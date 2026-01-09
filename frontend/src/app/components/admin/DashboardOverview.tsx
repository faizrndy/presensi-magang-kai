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
  action: string;
  time: string;
};

type Intern = {
  id: number;
  name: string;
};

/* ===============================
   HELPER
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

  /* ===============================
     LOGIC FIXED
  ================================ */
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
          action:
            todayAttendance.status === "hadir"
              ? "Hadir"
              : todayAttendance.status === "izin"
              ? "Izin"
              : "Alpa",
          time: todayAttendance.tanggal,
        });
      }

      const alpa =
        interns.length - hadir - izin;

      setHadirHariIni(hadir);
      setIzinHariIni(izin);
      setAlpaHariIni(alpa);

      setActivities(
        todayActivities.slice(-5).reverse()
      );
    } catch (err) {
      console.error("Gagal load dashboard overview", err);
    }
  }

  /* ===============================
     UI (TIDAK DIUBAH)
  ================================ */
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-4 p-4">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">
                Total Peserta
              </p>
              <p className="text-2xl font-bold">
                {totalInterns}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4 p-4">
            <div className="p-2 rounded-lg bg-green-100 text-green-600">
              <UserCheck size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">
                Hadir Hari Ini
              </p>
              <p className="text-2xl font-bold">
                {hadirHariIni}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4 p-4">
            <div className="p-2 rounded-lg bg-red-100 text-red-600">
              <UserX size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">
                Tidak Hadir
              </p>
              <p className="text-2xl font-bold">
                {alpaHariIni}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4 p-4">
            <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600">
              <CalendarClock size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">
                Total Izin
              </p>
              <p className="text-2xl font-bold">
                {izinHariIni}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} />
            <h3 className="font-semibold">
              Aktivitas Terbaru
            </h3>
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
                  className="flex justify-between text-sm"
                >
                  <div>
                    <p className="font-medium">
                      {a.name}
                    </p>
                    <p className="text-gray-500">
                      {a.action}
                    </p>
                  </div>
                  <p className="text-gray-400">
                    {a.time}
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
