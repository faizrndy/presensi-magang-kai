import { useState } from "react";
import { AdminHeader } from "./components/admin/AdminHeader";
import { AdminSidebar } from "./components/admin/AdminSidebar";
import { DashboardOverview } from "./components/admin/DashboardOverview";
import { InternList } from "./components/admin/InternList";
import { AttendanceReports } from "./components/admin/AttendanceReports";
import { AddIntern } from "./components/admin/AddIntern";
import { InternDetail } from "./components/admin/InternDetail";

export default function AdminApp() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedInternId, setSelectedInternId] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminHeader />

      <div className="flex">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="flex-1 p-6 lg:p-8">
          {activeTab === "overview" && <DashboardOverview />}

          {activeTab === "interns" && selectedInternId === null && (
            <InternList
              onAddIntern={() => setActiveTab("add-intern")}
              onSelectIntern={(id) => setSelectedInternId(id)}
            />
          )}

          {selectedInternId !== null && (
            <InternDetail
              internId={selectedInternId}
              onBack={() => setSelectedInternId(null)}
            />
          )}

          {activeTab === "attendance" && <AttendanceReports />}

          {activeTab === "add-intern" && (
            <AddIntern onBack={() => setActiveTab("interns")} />
          )}
        </main>
      </div>
    </div>
  );
}
