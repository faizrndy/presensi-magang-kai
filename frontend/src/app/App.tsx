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

  useEffect(() => {
    loadInterns();
    loadAttendances();
  }, []);

  async function loadInterns() {
    const data = await getInterns();
    setInterns(data);

    if (data.length > 0) {
      setUserName(data[0].name);
      setSchool(data[0].school);
    }
  }

  async function loadAttendances() {
    const data = await getAttendances();
    setAttendances(data);
  }

  if (isAdmin) {
    return (
      <>
        <AdminApp />
        <Button
          onClick={() => setIsAdmin(false)}
          className="fixed bottom-6 right-6"
        >
          Lihat Portal Peserta
        </Button>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <IdentitySection
          interns={interns}
          userName={userName}
          school={school}
          onUserNameChange={setUserName}
          onSchoolChange={setSchool}
        />

        {/* 🔑 KIRIM CALLBACK */}
        <ActionCards
          userName={userName}
          onSuccess={loadAttendances}
        />

        {/* 🔑 KIRIM DATA REAL */}
        <AttendanceStats
          attendances={attendances}
          userName={userName}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
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
        className="fixed bottom-6 right-6 bg-orange-600"
      >
        Lihat Dashboard Admin
      </Button>
    </div>
  );
}
