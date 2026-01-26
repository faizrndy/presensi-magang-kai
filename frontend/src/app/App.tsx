import { useEffect, useState } from "react";
import AdminApp from "./AdminApp";
import { Header } from "./components/Header";
import {
  IdentitySection,
  ShiftKey,
} from "./components/IdentitySection";
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

import type { Intern } from "./components/IdentitySection";

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [interns, setInterns] = useState<Intern[]>([]);
  const [selectedIntern, setSelectedIntern] = useState<Intern | null>(null);

  const [shift, setShift] = useState<ShiftKey | "">("");
  const [history, setHistory] = useState<AttendanceHistoryType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const data = await getInterns();
        setInterns(data);
        if (data.length > 0) setSelectedIntern(data[0]);
      } catch (e) {
        console.error("Gagal memuat data peserta:", e);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  async function loadHistory(internId: number) {
    try {
      const data = await getAttendanceHistory(internId);
      setHistory(data);
    } catch (e) {
      console.error("Gagal memuat riwayat:", e);
      setHistory([]);
    }
  }

  useEffect(() => {
    if (selectedIntern?.id) {
      loadHistory(selectedIntern.id);
    } else {
      setHistory([]);
    }
  }, [selectedIntern]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        Memuat Portal Magang...
      </div>
    );
  }

  if (isAdmin) {
    return (
      <>
        <AdminApp />
        <Button
          onClick={() => setIsAdmin(false)}
          className="fixed bottom-6 right-6 rounded-lg px-4 py-2"
        >
          Kembali ke Portal Peserta
        </Button>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <IdentitySection
          interns={interns}
          userName={selectedIntern?.name || ""}
          school={selectedIntern?.school || ""}
          selectedShift={shift}
          onUserNameChange={(name) => {
            const found = interns.find((i) => i.name === name);
            if (found) {
              setSelectedIntern(found);
              setShift("");
            }
          }}
          onShiftChange={(val) => setShift(val)}
        />

        {selectedIntern && (
          <ActionCards
            internId={selectedIntern.id}
            shift={shift || null}
            onSuccess={() => loadHistory(selectedIntern.id)}
          />
        )}

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

      {/* ✅ BUTTON PESERTA – SUDAH KOTAK */}
      <Button
        onClick={() => setIsAdmin(true)}
        className="fixed bottom-6 right-6 bg-[#f85a16] text-white 
                   rounded-lg px-4 py-2 font-semibold shadow-lg"
      >
        Lihat Dashboard Admin
      </Button>
    </div>
  );
}
