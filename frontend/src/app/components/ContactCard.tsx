import { Mail, MessageCircle, User } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

export function ContactCard() {
  return (
    <Card className="p-6 bg-white/80 backdrop-blur-sm border-slate-200">
      <h2 className="font-semibold text-lg text-slate-900 mb-4">Kontak Pembimbing</h2>

      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <Avatar className="w-14 h-14 border-2 border-slate-200">
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=PakAgus" />
            <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              PA
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900">Pak Winaris Ahmad Darmawan</h3>
            <p className="text-sm text-slate-600">Assistant Manager IT Support 2</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="gap-2">
            <Mail className="w-4 h-4" />
            Email
          </Button>
          <Button variant="outline" className="gap-2">
            <MessageCircle className="w-4 h-4" />
            Chat
          </Button>
        </div>
      </div>
    </Card>
  );
}
