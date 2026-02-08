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
  /* ================= ADMIN ================= */
  const [isAdmin, setIsAdmin] = useState(false);

  /* ================= INTERN ================= */
  const [interns, setInterns] = useState<Intern[]>([]);
  const [selectedIntern, setSelectedIntern] = useState<Intern | null>(null);

  /* ================= ABSENSI ================= */
  const [shift, setShift] = useState<ShiftKey | "">("");
  const [history, setHistory] = useState<AttendanceHistoryType[]>([]);
  const [loading, setLoading] = useState(true);

  /* ================= TRANSISI CHECK-IN (PER INTERN) ================= */
  const [forceCheckedInMap, setForceCheckedInMap] = useState<
    Record<number, boolean>
  >({});

  /* ================= LOAD INTERN ================= */
  useEffect(() => {
    (async () => {
      try {
        const data = await getInterns();
        setInterns(data);
        if (data.length > 0) {
          setSelectedIntern(data[0]);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ================= LOAD HISTORY ================= */
  async function loadHistory(internId: number) {
    const data = await getAttendanceHistory(internId);
    setHistory(data);
  }

  useEffect(() => {
    if (selectedIntern?.id) {
      loadHistory(selectedIntern.id);
    } else {
      setHistory([]);
    }
  }, [selectedIntern]);

  /* ================= ABSENSI HARI INI ================= */
  const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD

  const todayAttendance = history.find(
    (h) => h.date === today
  );

  const alreadyCheckedIn =
    !!(selectedIntern &&
      forceCheckedInMap[selectedIntern.id]) ||
    !!todayAttendance?.check_in_time;

  const alreadyCheckedOut = !!todayAttendance?.check_out_time;

  const isAttendanceLocked = alreadyCheckedIn;

  const activeShift =
    alreadyCheckedIn && todayAttendance?.shift
      ? todayAttendance.shift
      : shift;

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Memuat Portal Magang...
      </div>
    );
  }

  /* ================= ADMIN VIEW ================= */
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

  /* ================= PESERTA VIEW ================= */
  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* IDENTITAS */}
        <IdentitySection
          interns={interns}
          userName={selectedIntern?.name || ""}
          school={selectedIntern?.school || ""}
          selectedShift={activeShift}
          isLocked={isAttendanceLocked}
          onUserNameChange={(name) => {
            const found = interns.find((i) => i.name === name);
            if (!found) return;
            setSelectedIntern(found);
            setShift("");
          }}
          onShiftChange={setShift}
        />

        {/* ACTION */}
        {selectedIntern && (
          <ActionCards
            key={selectedIntern.id}
            internId={selectedIntern.id}
            shift={activeShift}
            alreadyCheckedIn={alreadyCheckedIn}
            alreadyCheckedOut={alreadyCheckedOut}
            onCheckInSuccess={() => {
              setForceCheckedInMap((prev) => ({
                ...prev,
                [selectedIntern.id]: true,
              }));
              loadHistory(selectedIntern.id);
            }}
            onCheckOutSuccess={() => {
              setForceCheckedInMap((prev) => ({
                ...prev,
                [selectedIntern.id]: false,
              }));
              loadHistory(selectedIntern.id);
            }}
          />
        )}

        {/* STAT */}
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

      {/* ADMIN BUTTON */}
      <Button
        onClick={() => setIsAdmin(true)}
        className="fixed bottom-6 right-6 bg-[#f85a16] text-white shadow-lg"
      >
        Lihat Dashboard Admin
      </Button>
    </div>
  );
}
