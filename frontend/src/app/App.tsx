import { useEffect, useState } from "react";
import AdminApp from "./AdminApp";
import { Header } from "./components/Header";
import { IdentitySection, Intern } from "./components/IdentitySection";
import { ActionCards } from "./components/ActionCards";
import { AttendanceStats } from "./components/AttendanceStats";
import { AttendanceHistory } from "./components/AttendanceHistory";
import { WorkSchedule } from "./components/WorkSchedule";
import { ContactCard } from "./components/ContactCard";
import { Button } from "./components/ui/button";

import { getInterns } from "./api/intern.api";
import { getAttendances, Attendance } from "./api/attendance.api";

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [interns, setInterns] = useState<Intern[]>([]);
  const [userName, setUserName] = useState("");
  const [school, setSchool] = useState("");
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Ambil data pertama kali saat aplikasi dimuat
  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([loadInterns(), loadAttendances()]);
      } catch (error) {
        console.error("Gagal memuat data awal:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  async function loadInterns() {
    const data = await getInterns();
    setInterns(data);
    if (data.length > 0 && !userName) {
      setUserName(data[0].name);
      setSchool(data[0].school);
    }
  }

  // Fungsi ini krusial untuk fitur auto-refresh
  async function loadAttendances() {
    console.log("Mengambil data absensi terbaru...");
    const data = await getAttendances();
    setAttendances(data); // State ini akan dikirim ke Stats dan History
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <p className="text-lg font-medium animate-pulse">Menghubungkan ke database...</p>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <>
        <AdminApp />
        <Button
          onClick={() => setIsAdmin(false)}
          className="fixed bottom-6 right-6 z-50 shadow-xl"
        >
          Lihat Portal Peserta
        </Button>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 pb-20">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <IdentitySection
          interns={interns}
          userName={userName}
          school={school}
          onUserNameChange={setUserName}
          onSchoolChange={setSchool}
        />

        {/* 🔑 Callback onSuccess memicu loadAttendances setelah absen berhasil */}
        <ActionCards
          userName={userName}
          onSuccess={loadAttendances}
        />

        {/* 🔑 Menghitung stats langsung dari array attendances yang terbaru */}
        <AttendanceStats
          attendances={attendances}
          userName={userName}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* 🔑 Menampilkan riwayat dari array attendances yang terbaru */}
            <AttendanceHistory
              attendances={attendances}
              userName={userName}
            />
          </div>
          <div className="space-y-6">
            <WorkSchedule />
            <ContactCard />
          </div>
        </div>
      </main>

      <Button
        onClick={() => setIsAdmin(true)}
        className="fixed bottom-6 right-6 bg-orange-600 hover:bg-orange-700 shadow-xl z-50"
      >
        Lihat Dashboard Admin
      </Button>
    </div>
  );
}