import { Card } from "./ui/card";
import { toast } from "sonner";
import { addAttendance, getAttendances } from "../api/attendance.api";
import { LogIn, CalendarClock, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export function ActionCards({ userName, onSuccess }: { userName: string; onSuccess: () => void }) {
  const today = new Date().toLocaleDateString('en-CA'); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasCheckedToday, setHasCheckedToday] = useState(false);

  // 1. Reset state hasCheckedToday setiap kali userName berubah
  useEffect(() => {
    setHasCheckedToday(false); // Reset dulu agar tidak memakai status user sebelumnya
    
    if (!userName) return;
    
    const verifyStatus = async () => {
      try {
        const data = await getAttendances();
        // Pencarian sangat ketat menggunakan lower case dan trim
        const alreadyAbsen = data.some(
          (a) => 
            a.intern.toLowerCase().trim() === userName.toLowerCase().trim() && 
            a.date.split('T')[0] === today
        );
        setHasCheckedToday(alreadyAbsen);
      } catch (e) {
        console.error("Gagal verifikasi status hari ini:", e);
      }
    };

    verifyStatus();
  }, [userName, today]);

  async function handleSubmit(status: "hadir" | "izin") {
    if (!userName) return toast.error("Silakan pilih nama peserta terlebih dahulu!");
    if (isProcessing || hasCheckedToday) return;

    setIsProcessing(true);

    // Di dalam handleSubmit pada ActionCards.tsx
try {
  await addAttendance({
    intern: userName.trim(), 
    date: today,
    status: status
  });

  toast.success(`Berhasil mencatat kehadiran: ${status}`);
  setHasCheckedToday(true);

  // 🔥 BERI JEDA 800ms (localhost terkadang butuh waktu untuk menulis ke HDD/SSD)
  setTimeout(() => {
    onSuccess(); // Ini memicu loadAttendances di App.tsx
  }, 800);

} catch (err: any) {
  toast.error(err.message || "Gagal menyimpan ke database.");
} finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card 
        onClick={() => !hasCheckedToday && handleSubmit("hadir")} 
        className={`p-6 cursor-pointer text-white shadow-lg border-none transition-all group relative overflow-hidden ${
          hasCheckedToday || isProcessing ? "bg-slate-400 cursor-not-allowed opacity-80" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-xl font-bold italic">Masuk</p>
            <p className="text-blue-100 text-sm">
              {isProcessing ? "Memproses..." : hasCheckedToday ? "Sudah Absen Hari Ini" : "Klik untuk hadir hari ini"}
            </p>
          </div>
          {isProcessing ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : (
            <LogIn className={`h-8 w-8 text-blue-100 ${!hasCheckedToday && "group-hover:translate-x-1"} transition-transform`} />
          )}
        </div>
      </Card>
      
      <Card 
        onClick={() => !hasCheckedToday && handleSubmit("izin")} 
        className={`p-6 cursor-pointer text-white shadow-lg border-none transition-all group relative overflow-hidden ${
          hasCheckedToday || isProcessing ? "bg-slate-400 cursor-not-allowed opacity-80" : "bg-orange-600 hover:bg-orange-700"
        }`}
      >
        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-xl font-bold italic">Izin</p>
            <p className="text-orange-100 text-sm">
              {isProcessing ? "Memproses..." : hasCheckedToday ? "Status Sudah Tercatat" : "Klik jika berhalangan hadir"}
            </p>
          </div>
          {isProcessing ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : (
            <CalendarClock className={`h-8 w-8 text-orange-100 ${!hasCheckedToday && "group-hover:scale-110"} transition-transform`} />
          )}
        </div>
      </Card>
    </div>
  );
}