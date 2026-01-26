import { Mail, MessageCircle, X } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useState } from "react";

type PopupType = "chat" | "email" | null;

export function ContactCard() {
  const [activePopup, setActivePopup] = useState<PopupType>(null);

  const phone = "08112224215";
  const email = "winaris91@gmail.com";

  return (
    <>
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-slate-200">
        <h2 className="font-semibold text-lg text-slate-900 mb-4">
          Kontak Pembimbing
        </h2>

        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <Avatar className="w-14 h-14 border-2 border-slate-200">
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=PakAgus" />
              <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                PA
              </AvatarFallback>
            </Avatar>

            <div>
              <h3 className="font-semibold text-slate-900">
                Pak Winaris Ahmad Darmawan
              </h3>
              <p className="text-sm text-slate-600">
                Assistant Manager IT Support 2
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setActivePopup("email")}
            >
              <Mail className="w-4 h-4" />
              Email
            </Button>

            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setActivePopup("chat")}
            >
              <MessageCircle className="w-4 h-4" />
              Chat
            </Button>
          </div>
        </div>
      </Card>

      {/* ================= EMAIL POPUP ================= */}
      {activePopup === "email" && (
        <Popup onClose={() => setActivePopup(null)}>
          <h3 className="text-lg font-bold mb-3">Email Pembimbing : </h3>
           <h3 className="text-lg font-semibold mb-2">Pak Winaris Ahmad Darmawan  </h3>
          <p className="text-slate-700 mb-4">{email}</p>

          <Button
            className="w-full gap-2"
            onClick={() =>
              (window.location.href = `mailto:${email}`)
            }
          >
            <Mail className="w-4 h-4" />
            Kirim Email
          </Button>
        </Popup>
      )}

      {/* ================= CHAT POPUP ================= */}
      {activePopup === "chat" && (
        <Popup onClose={() => setActivePopup(null)}>
          <h3 className="text-lg font-bold mb-2">WhatsApp Pembimbing : </h3>
          <h3 className="text-lg font-semibold mb-2">Pak Winaris Ahmad Darmawan  </h3>
          <p className="text-slate-700 mb-4">{phone}</p>

          <Button
            className="w-full gap-2 bg-green-600 hover:bg-green-700"
            onClick={() =>
              window.open(
                `https://wa.me/62${phone.slice(1)}`,
                "_blank"
              )
            }
          >
            <MessageCircle className="w-4 h-4" />
            Chat WhatsApp
          </Button>
        </Popup>
      )}
    </>
  );
}

/* ================= REUSABLE POPUP ================= */
function Popup({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-full max-w-sm rounded-xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-500 hover:text-slate-700"
        >
          <X />
        </button>
        {children}
      </div>
    </div>
  );
}
