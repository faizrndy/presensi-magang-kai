import { Calendar, Clock } from 'lucide-react';
import { Card } from './ui/card';
import { Separator } from './ui/separator';
import { useEffect, useState } from 'react';

type Holiday = {
  tanggal: string;
  keterangan: string;
};

export function WorkSchedule() {
  const [holidayText, setHolidayText] = useState<string | null>(null);

  useEffect(() => {
    const checkHoliday = async () => {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const day = today.getDay(); // 0 = Minggu, 6 = Sabtu

      // Weekend
      if (day === 0 || day === 6) {
        setHolidayText('Weekend');
        return;
      }

      try {
        const res = await fetch('https://dayoffapi.vercel.app/api');
        const data: Holiday[] = await res.json();

        const todayHoliday = data.find(
          (h) => h.tanggal === todayStr
        );

        if (todayHoliday) {
          setHolidayText(todayHoliday.keterangan);
        } else {
          setHolidayText(null);
        }
      } catch (error) {
        console.error('Gagal ambil data libur', error);
      }
    };

    checkHoliday();
  }, []);

  return (
    <Card className="p-6 bg-gradient-to-br from-indigo-600 to-blue-700 border-0 text-white">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5" />
        <h2 className="font-semibold text-lg">Jadwal Kerja</h2>
      </div>

      <div className="space-y-4">
        <span className="text-blue-100">Senin - Jumat</span>

        <Separator className="bg-white/20" />

        {!holidayText && (
          <>
            {/* Shift 1 */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div className="flex-1 flex justify-between">
                <span className="text-sm text-blue-100">Shift 1</span>
                <span className="font-semibold">07:30 - 13:30</span>
              </div>
            </div>

            {/* Shift 2 */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div className="flex-1 flex justify-between">
                <span className="text-sm text-blue-100">Shift 2</span>
                <span className="font-semibold">12:30 - 18:30</span>
              </div>
            </div>

            {/* Piket */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div className="flex-1 flex justify-between">
                <span className="text-sm text-blue-100">Piket</span>
                <span className="font-semibold">08:00 - 16:00</span>
              </div>
            </div>
          </>
        )}

        <Separator className="bg-white/20" />

        <div className="flex items-center gap-2 p-3 rounded-lg bg-white/10">
          <Clock className="w-4 h-4 text-blue-200" />
          <span className="text-sm text-blue-100">
            Hari Libur:{' '}
            <span className="font-semibold text-white">
              {holidayText ?? 'Tidak ada'}
            </span>
          </span>
        </div>
      </div>
    </Card>
  );
}
