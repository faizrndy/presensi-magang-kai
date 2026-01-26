import { Bell, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="flex items-center justify-between h-16 px-6">
        
        {/* LOGO */}
        <div className="flex items-center gap-3">
          <img
            src="/kai.png"
            alt="KAI"
            className="h-10 w-auto object-contain"
          />
          <div>
            <h1 className="font-bold text-lg">Dashboard Admin</h1>
            <p className="text-xs text-slate-500">Portal Magang KAI</p>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5 text-slate-600" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
              2
            </Badge>
          </Button>

          <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
            <Avatar className="h-9 w-9">
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              <p className="text-sm font-medium">Admin KAI</p>
              <p className="text-xs text-slate-500">Administrator</p>
            </div>
          </div>

          <Button variant="ghost" size="icon">
            <LogOut className="w-5 h-5 text-slate-600" />
          </Button>
        </div>
      </div>
    </header>
  );
}
