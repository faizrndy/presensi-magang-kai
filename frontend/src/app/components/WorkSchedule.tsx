import { Calendar, Clock } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

export function WorkSchedule() {
  return (
    <Card className="p-6 bg-gradient-to-br from-indigo-600 to-blue-700 border-0 text-white">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5" />
        <h2 className="font-semibold text-lg">Jadwal Kerja</h2>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-blue-100">Senin - Jumat</span>
        </div>

        <Separator className="bg-white/20" />

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-100">Jam Masuk</span>
                <span className="font-semibold">08:00 WIB</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-100">Jam Pulang</span>
                <span className="font-semibold">17:00 WIB</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="bg-white/20" />

        <div className="flex items-center gap-2 p-3 rounded-lg bg-white/10 backdrop-blur-sm">
          <Clock className="w-4 h-4 text-blue-200" />
          <span className="text-sm text-blue-100">
            Hari Libur: <span className="font-semibold text-white">2 Okt (Batik)</span>
          </span>
        </div>
      </div>
    </Card>
  );
}
