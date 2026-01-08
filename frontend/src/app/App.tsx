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
import {
  getAttendanceHistory,
  AttendanceHistory as AttendanceHistoryType,
} from "./api/attendance.api";

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [interns, setInterns] = useState<Intern[]>([]);
  const [selectedIntern, setSelectedIntern] = useState<Intern | null>(null);

  const [history, setHistory] = useState<AttendanceHistoryType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /* ================= LOAD AWAL ================= */
  useEffect(() => {
    const init = async () => {
      try {
        const internData = await getInterns();
        setInterns(internData);

        if (internData.length > 0) {
          setSelectedIntern(internData[0]);
        }
      } catch (error) {
        console.error("Gagal memuat data awal:", error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  /* ================= LOAD RIWAYAT ================= */
  async function loadHistory(internId: number) {
    try {
      const data = await getAttendanceHistory(internId);
      setHistory(data);
    } catch (error) {
      console.error("Gagal mengambil riwayat absensi:", error);
    }
  }

  // reload riwayat saat ganti intern
  useEffect(() => {
    if (selectedIntern?.id) {
      loadHistory(selectedIntern.id);
    }
  }, [selectedIntern]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <p className="text-lg font-medium animate-pulse">
          Menghubungkan ke database...
        </p>
      </div>
    );
  }

  /* ================= ADMIN ================= */
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

  /* ================= USER ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 pb-20">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <IdentitySection
          interns={interns}
          userName={selectedIntern?.name || ""}
          school={selectedIntern?.school || ""}
          onUserNameChange={(name) => {
            const found = interns.find((i) => i.name === name);
            if (found) setSelectedIntern(found);
          }}
          onSchoolChange={() => {}}
        />

        {/* ================= ACTION ================= */}
        {selectedIntern && (
          <ActionCards
            internId={selectedIntern.id}
            onSuccess={() => loadHistory(selectedIntern.id)}
          />
        )}

        {/* ================= STATS ================= */}
        <AttendanceStats attendances={history} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AttendanceHistory attendances={history} />
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
