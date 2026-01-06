import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

import { getInterns, deleteIntern, Intern } from "../../api/intern.api";

interface InternListProps {
  onAddIntern?: () => void;
  onSelectIntern: (id: number) => void;
}

export function InternList({ onAddIntern, onSelectIntern }: InternListProps) {
  const [interns, setInterns] = useState<Intern[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const data = await getInterns();
    setInterns(data);
  }

  async function handleDelete(id: number) {
    const ok = confirm("Yakin ingin menghapus peserta magang?");
    if (!ok) return;

    await deleteIntern(id);
    loadData();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Peserta Magang</h2>
        <Button onClick={onAddIntern} className="bg-orange-600">
          + Tambah Peserta
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Sekolah</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {interns.map((intern) => (
              <TableRow key={intern.id}>
                <TableCell
                  className="font-medium text-blue-600 cursor-pointer hover:underline"
                  onClick={() => onSelectIntern(intern.id)}
                >
                  {intern.name}
                </TableCell>
                <TableCell>{intern.school}</TableCell>
                <TableCell>
                  <Badge className="bg-green-100 text-green-700">
                    {intern.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(intern.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {interns.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6">
                  Tidak ada peserta magang
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
