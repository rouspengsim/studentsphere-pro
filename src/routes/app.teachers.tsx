import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard, Avatar } from "@/components/app/ui";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { Plus, Loader2, Trash2, X, Mail, Phone, BookOpen } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/app/teachers")({
  head: () => ({ meta: [{ title: "Teachers — EduCore" }] }),
  component: TeachersPage,
});

type TeacherRow = { id: string; staff_code: string; full_name: string; email: string | null; phone: string | null; department: string | null; specialization: string | null; };

function TeachersPage() {
  const { t } = useI18n();
  const { primaryRole } = useAuth();
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const isAdmin = primaryRole === "admin";

  const { data: teachers = [], isLoading } = useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("teachers").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as TeacherRow[];
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("teachers").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["teachers"] }); toast.success("Removed"); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader title={t("teachers")} subtitle="Faculty profiles and assigned classes" actions={isAdmin && (
        <button onClick={() => setShowAdd(true)} className="inline-flex h-10 items-center gap-2 rounded-xl gradient-primary px-4 text-sm font-semibold text-primary-foreground shadow-soft hover:shadow-glow"><Plus className="h-4 w-4" /> {t("add")} {t("teacher")}</button>
      )} />
      {isLoading ? (
        <div className="flex h-40 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
      ) : teachers.length === 0 ? (
        <SectionCard><div className="py-10 text-center"><p className="text-sm text-muted-foreground">No teachers yet.</p>{isAdmin && (<button onClick={() => setShowAdd(true)} className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"><Plus className="h-3.5 w-3.5" /> Add first teacher</button>)}</div></SectionCard>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teachers.map((tc) => (
            <div key={tc.id} className="group rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:shadow-card">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3"><Avatar name={tc.full_name} className="h-12 w-12 text-sm" /><div><p className="font-semibold leading-tight">{tc.full_name}</p><p className="text-xs text-muted-foreground">{tc.staff_code}</p></div></div>
                {isAdmin && (<button onClick={() => { if (confirm("Remove teacher?")) del.mutate(tc.id); }} className="rounded-lg p-1.5 text-destructive opacity-0 hover:bg-destructive/10 group-hover:opacity-100"><Trash2 className="h-3.5 w-3.5" /></button>)}
              </div>
              <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                {tc.department && <p className="flex items-center gap-1.5"><BookOpen className="h-3 w-3" /> {tc.department}{tc.specialization ? ` · ${tc.specialization}` : ""}</p>}
                {tc.email && <p className="flex items-center gap-1.5 truncate"><Mail className="h-3 w-3" /> {tc.email}</p>}
                {tc.phone && <p className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {tc.phone}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
      {showAdd && <AddTeacher onClose={() => setShowAdd(false)} />}
    </div>
  );
}

function AddTeacher({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [f, setF] = useState({ full_name: "", staff_code: "", email: "", phone: "", department: "", specialization: "" });
  const mut = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("teachers").insert({ full_name: f.full_name, staff_code: f.staff_code || `STAFF-${Date.now().toString().slice(-5)}`, email: f.email || null, phone: f.phone || null, department: f.department || null, specialization: f.specialization || null });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["teachers"] }); qc.invalidateQueries({ queryKey: ["dashboard-stats"] }); toast.success("Teacher added"); onClose(); },
    onError: (e) => toast.error(e.message),
  });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-card" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between"><h3 className="font-display text-lg font-bold">Add teacher</h3><button onClick={onClose} className="rounded-lg p-1 hover:bg-muted"><X className="h-4 w-4" /></button></div>
        <form onSubmit={(e) => { e.preventDefault(); if (!f.full_name) return toast.error("Name required"); mut.mutate(); }} className="space-y-3">
          {([["Full name *", "full_name"],["Staff code", "staff_code"],["Email", "email"],["Phone", "phone"],["Department", "department"],["Specialization", "specialization"]] as const).map(([label, key]) => (
            <div key={key}>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
              <input value={f[key]} onChange={(e) => setF({ ...f, [key]: e.target.value })} className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-primary" />
            </div>
          ))}
          <button type="submit" disabled={mut.isPending} className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl gradient-primary text-sm font-semibold text-primary-foreground shadow-soft disabled:opacity-60">{mut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save teacher"}</button>
        </form>
      </div>
    </div>
  );
}
