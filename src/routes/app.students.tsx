import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard, StatusPill, Avatar } from "@/components/app/ui";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { Plus, Search, Filter, Download, Trash2, X, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/app/students")({
  head: () => ({ meta: [{ title: "Students — EduCore" }] }),
  component: StudentsPage,
});

type StudentRow = {
  id: string;
  student_code: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  enrollment_year: number;
  status: "active" | "inactive" | "graduated" | "suspended";
  created_at: string;
};

function StudentsPage() {
  const { t } = useI18n();
  const { primaryRole } = useAuth();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [showAdd, setShowAdd] = useState(false);

  const isAdmin = primaryRole === "admin";

  const { data: students = [], isLoading } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as StudentRow[];
    },
  });

  const filtered = useMemo(() => {
    return students.filter((s) => {
      if (filter !== "all" && s.status !== filter) return false;
      if (q && !s.full_name.toLowerCase().includes(q.toLowerCase()) && !s.student_code.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [students, q, filter]);

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("students").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      toast.success("Student deleted");
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader
        title={t("students")}
        subtitle="Manage enrollment, profiles, and history"
        actions={
          <>
            <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-medium hover:bg-muted">
              <Download className="h-4 w-4" /> {t("export")}
            </button>
            {isAdmin && (
              <button onClick={() => setShowAdd(true)} className="inline-flex h-10 items-center gap-2 rounded-xl gradient-primary px-4 text-sm font-semibold text-primary-foreground shadow-soft hover:shadow-glow">
                <Plus className="h-4 w-4" /> {t("add")} {t("student")}
              </button>
            )}
          </>
        }
      />

      <SectionCard>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name or code…"
              className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="flex rounded-xl border border-border bg-surface p-1">
            {(["all", "active", "inactive"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={
                  "rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors " +
                  (filter === f ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground hover:text-foreground")
                }
              >
                {f}
              </button>
            ))}
          </div>
          <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-sm hover:bg-muted">
            <Filter className="h-4 w-4" /> {t("filter")}
          </button>
        </div>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">No students yet.</p>
            {isAdmin && (
              <button onClick={() => setShowAdd(true)} className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
                <Plus className="h-3.5 w-3.5" /> Add your first student
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="py-3 pr-4">Student</th>
                  <th className="py-3 pr-4">Code</th>
                  <th className="py-3 pr-4">Email</th>
                  <th className="py-3 pr-4">Year</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="group border-b border-border/60 transition-colors hover:bg-muted/40">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={s.full_name} />
                        <div>
                          <p className="font-semibold leading-tight">{s.full_name}</p>
                          <p className="text-xs text-muted-foreground">{s.phone ?? "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs">{s.student_code}</td>
                    <td className="py-3 pr-4 text-xs">{s.email ?? "—"}</td>
                    <td className="py-3 pr-4">{s.enrollment_year}</td>
                    <td className="py-3 pr-4"><StatusPill status={s.status} /></td>
                    <td className="py-3 text-right">
                      {isAdmin && (
                        <button
                          onClick={() => {
                            if (confirm(`Delete ${s.full_name}?`)) deleteMut.mutate(s.id);
                          }}
                          className="rounded-lg p-2 text-destructive opacity-0 transition-opacity hover:bg-destructive/10 group-hover:opacity-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 text-xs text-muted-foreground">Showing {filtered.length} of {students.length}</div>
      </SectionCard>

      {showAdd && <AddStudentModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}

function AddStudentModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    full_name: "",
    student_code: "",
    email: "",
    phone: "",
    enrollment_year: new Date().getFullYear(),
  });

  const mut = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("students").insert({
        full_name: form.full_name,
        student_code: form.student_code || `STU-${Date.now().toString().slice(-6)}`,
        email: form.email || null,
        phone: form.phone || null,
        enrollment_year: Number(form.enrollment_year),
        status: "active",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      qc.invalidateQueries({ queryKey: ["dashboard-recent-students"] });
      toast.success("Student added");
      onClose();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-card" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold">Add student</h3>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.full_name) return toast.error("Full name is required");
            mut.mutate();
          }}
          className="space-y-3"
        >
          <Input label="Full name *" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} />
          <Input label="Student code" placeholder="auto if empty" value={form.student_code} onChange={(v) => setForm({ ...form, student_code: v })} />
          <Input label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          <Input label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          <Input label="Enrollment year" type="number" value={String(form.enrollment_year)} onChange={(v) => setForm({ ...form, enrollment_year: Number(v) })} />
          <button
            type="submit"
            disabled={mut.isPending}
            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl gradient-primary text-sm font-semibold text-primary-foreground shadow-soft hover:shadow-glow disabled:opacity-60"
          >
            {mut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save student"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
      />
    </div>
  );
}
