import { apiFetch } from "./http";

export type Intern = {
  id: number;
  name: string;
  school: string;
  status: string;
};

export type InternDetail = Intern & {
  hadir: number;
  izin: number;
  alpa: number;
  total: number;
  percentage: number;
};

export function getInterns(): Promise<Intern[]> {
  return apiFetch("/api/interns");
}

export function getInternById(id: number): Promise<InternDetail> {
  return apiFetch(`/api/interns/${id}`);
}

export function addIntern(data: { name: string; school: string }) {
  return apiFetch("/api/interns", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function deleteIntern(id: number) {
  return apiFetch(`/api/interns/${id}`, {
    method: "DELETE",
  });
}
