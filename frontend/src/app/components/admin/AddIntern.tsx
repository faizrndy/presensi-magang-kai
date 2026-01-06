import { useState } from "react";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { toast } from "sonner";

import { addIntern } from "../../api/intern.api";

interface AddInternProps {
  onBack: () => void;
  onSuccess?: () => void;
}

export function AddIntern({ onBack, onSuccess }: AddInternProps) {
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);

      await addIntern({ name, school });

      toast.success("Peserta berhasil ditambahkan");

      setName("");
      setSchool("");

      onSuccess?.();
      onBack();
    } catch (err: any) {
      toast.error(err.message || "Gagal menambahkan peserta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Tambah Peserta Magang
          </h2>
          <p className="text-slate-600 mt-1">
            Masukkan data peserta baru
          </p>
        </div>
      </div>

      <Card className="max-w-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label>Nama Lengkap</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div>
            <Label>Asal Sekolah / Universitas</Label>
            <Input value={school} onChange={(e) => setSchool(e.target.value)} required />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700 gap-2"
            >
              <UserPlus className="w-4 h-4" />
              {loading ? "Menyimpan..." : "Tambah Peserta"}
            </Button>

            <Button type="button" variant="outline" onClick={onBack}>
              Batal
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
