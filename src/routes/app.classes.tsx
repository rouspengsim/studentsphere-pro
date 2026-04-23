import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/app/ui";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { Plus, Loader2, X, Trash2, School, User } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/app/classes")({
  head: () => ({ meta: [{ title: "Classes — EduCore" }] }),
  component: ClassesPage,
});

type ClassRow = { id: string; name: string; subject_code: string; room: string | null; capacity: number; semester: string | null; teacher_id: string | null; teachers: { full_name: string } | null; };

function ClassesPage() {
  const { t } = useI18n();
  const { primaryRole } = useAuth();
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const isAdmin = primaryRole === "admin";

  const { data: classes = [], isLoading } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("classes").select("id,name,subject_code,room,capacity,semester,teacher_id,teachers(full_name)").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as ClassRow[];
    },
  });

  const { data: enrollCounts = {} } = useQuery({
    queryKey: ["class-enrollment-counts"],
    queryFn: async () => {
      const { data } = await supabase.from("enrollments").select("class_id");
      const counts: Record<string, number> = {};
      (data ?? []).forEach((r) => { counts[r.class_id] = (counts[r.class_id] ?? 0) + 1; });
      return counts;
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("classes").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["classes"] }); qc.invalidateQueries({ queryKey: ["dashboard-stats"] }); toast.success("Class deleted"); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader title={t("classes")} subtitle="Subjects, rooms, and assigned teachers" actions={isAdmin && (
        <button onClick={() => setShowAdd(true)} className="inline-flex h-10 items-center gap-2 rounded-xl gradient-primary px-4 text-sm font-semibold text-primary-foreground shadow-soft hover:shadow-glow"><Plus className="h-4 w-4" /> {t("add")} class</button>
      )} />
      {isLoading ? (
        <div className="flex h-40 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
      ) : classes.length === 0 ? (
        <SectionCard><div className="py-10 text-center"><p className="text-sm text-muted-foreground">No classes yet.</p>{isAdmin && (<button onClick={() => setShowAdd(true)} className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"><Plus className="h-3.5 w-3.5" /> Create first class</button>)}</div></SectionCard>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((c) => {
            const count = enrollCounts[c.id] ?? 0;
            const pct = Math.min(100, Math.round((count / Math.max(1, c.capacity)) * 100));
            return (
              <div key={c.id} className="group rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:shadow-card">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><School className="h-5 w-5" /></div><div><p className="font-semibold leading-tight">{c.name}</p><p className="text-xs text-muted-foreground">{c.subject_code}{c.room ? ` · ${c.room}` : ""}</p></div></div>
                  {isAdmin && (<button onClick={() => { if (confirm(`Delete ${c.name}?`)) del.mutate(c.id); }} className="rounded-lg p-1.5 text-destructive opacity-0 hover:bg-destructive/10 group-hover:opacity-100"><Trash2 className="h-3.5 w-3.5" /></button>)}
                </div>
                <div className="mt-4 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1.5"><User className="h-3 w-3" /> {c.teachers?.full_name ?? "Unassigned"}</p>
                  {c.semester && <p className="mt-1">Semester: {c.semester}</p>}
                </div>
                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"><span>Enrolled</span><span>{count} / {c.capacity}</span></div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} /></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {showAdd && <AddClass onClose={() => setShowAdd(false)} />}
    </div>
  );
}

function AddClass({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [f, setF] = useState({ name: "", subject_code: "", room: "", capacity: 40, semester: "", teacher_id: "" });
  const { data: teachers = [] } = useQuery({ queryKey: ["teachers-min"], queryFn: async () => { const { data } = await supabase.from("teachers").select("id,full_name").order("full_name"); return data ?? []; } });
  const mut = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("classes").insert({ name: f.name, subject_code: f.subject_code, room: f.room || null, capacity: Number(f.capacity), semester: f.semester || null, teacher_id: f.teacher_id || null });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["classes"] }); qc.invalidateQueries({ queryKey: ["dashboard-stats"] }); qc.invalidateQueries({ queryKey: ["dashboard-subjects"] }); toast.success("Class created"); onClose(); },
    onError: (e) => toast.error(e.message),
  });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-card" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between"><h3 className="font-display text-lg font-bold">Create class</h3><button onClick={onClose} className="rounded-lg p-1 hover:bg-muted"><X className="h-4 w-4" /></button></div>
        <form onSubmit={(e) => { e.preventDefault(); if (!f.name || !f.subject_code) return toast.error("Name & subject code required"); mut.mutate(); }} className="space-y-3">
          <Field label="Class name *"><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-primary" /></Field>
          <Field label="Subject code *"><input value={f.subject_code} onChange={(e) => setF({ ...f, subject_code: e.target.value })} className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-primary" /></Field>
          <Field label="Room"><input value={f.room} onChange={(e) => setF({ ...f, room: e.target.value })} className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-primary" /></Field>
          <Field label="Capacity"><input type="number" value={f.capacity} onChange={(e) => setF({ ...f, capacity: Number(e.target.value) })} className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-primary" /></Field>
          <Field label="Semester"><input value={f.semester} onChange={(e) => setF({ ...f, semester: e.target.value })} placeholder="e.g. Spring 2026" className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-primary" /></Field>
          <Field label="Teacher"><select value={f.teacher_id} onChange={(e) => setF({ ...f, teacher_id: e.target.value })} className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-primary"><option value="">— Unassigned —</option>{teachers.map((tc) => <option key={tc.id} value={tc.id}>{tc.full_name}</option>)}</select></Field>
          <button type="submit" disabled={mut.isPending} className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl gradient-primary text-sm font-semibold text-primary-foreground shadow-soft disabled:opacity-60">{mut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save class"}</button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (<div><label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>{children}</div>);
}
