import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard, StatCard, StatusPill } from "@/components/app/ui";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { Plus, Loader2, X, DollarSign, Wallet, AlertTriangle } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/app/payments")({
  head: () => ({ meta: [{ title: "Payments — EduCore" }] }),
  component: PaymentsPage,
});

type PaymentRow = { id: string; invoice_number: string; amount: number; due_date: string | null; paid_date: string | null; status: "pending" | "paid" | "overdue" | "cancelled"; method: string | null; description: string | null; students: { full_name: string } | null; };

function PaymentsPage() {
  const { t } = useI18n();
  const { primaryRole } = useAuth();
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const isAdmin = primaryRole === "admin";

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("payments").select("id,invoice_number,amount,due_date,paid_date,status,method,description,students(full_name)").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as PaymentRow[];
    },
  });

  const stats = useMemo(() => {
    const paid = payments.filter((p) => p.status === "paid").reduce((s, p) => s + Number(p.amount), 0);
    const pending = payments.filter((p) => p.status === "pending").reduce((s, p) => s + Number(p.amount), 0);
    const overdue = payments.filter((p) => p.status === "overdue").reduce((s, p) => s + Number(p.amount), 0);
    return { paid, pending, overdue };
  }, [payments]);

  const markPaid = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("payments").update({ status: "paid", paid_date: new Date().toISOString().slice(0, 10) }).eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["payments"] }); qc.invalidateQueries({ queryKey: ["dashboard-stats"] }); qc.invalidateQueries({ queryKey: ["dashboard-recent-payments"] }); toast.success("Marked paid"); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader title={t("payments")} subtitle="Invoices, dues and revenue tracking" actions={isAdmin && (
        <button onClick={() => setShowAdd(true)} className="inline-flex h-10 items-center gap-2 rounded-xl gradient-primary px-4 text-sm font-semibold text-primary-foreground shadow-soft hover:shadow-glow"><Plus className="h-4 w-4" /> Create invoice</button>
      )} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Paid" value={`$${stats.paid.toLocaleString()}`} icon={<DollarSign className="h-5 w-5" />} tone="success" />
        <StatCard label="Pending" value={`$${stats.pending.toLocaleString()}`} icon={<Wallet className="h-5 w-5" />} tone="warning" />
        <StatCard label="Overdue" value={`$${stats.overdue.toLocaleString()}`} icon={<AlertTriangle className="h-5 w-5" />} tone="info" />
      </div>
      <SectionCard className="mt-6">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        ) : payments.length === 0 ? (
          <div className="py-12 text-center"><p className="text-sm text-muted-foreground">No payments yet.</p>{isAdmin && (<button onClick={() => setShowAdd(true)} className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"><Plus className="h-3.5 w-3.5" /> Create first invoice</button>)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"><th className="py-3 pr-4">Invoice</th><th className="py-3 pr-4">Student</th><th className="py-3 pr-4">Amount</th><th className="py-3 pr-4">Due</th><th className="py-3 pr-4">Status</th><th className="py-3" /></tr></thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-border/60 hover:bg-muted/40">
                    <td className="py-3 pr-4 font-mono text-xs">{p.invoice_number}</td>
                    <td className="py-3 pr-4 font-medium">{p.students?.full_name ?? "—"}</td>
                    <td className="py-3 pr-4 font-semibold">${Number(p.amount).toFixed(2)}</td>
                    <td className="py-3 pr-4 text-xs text-muted-foreground">{p.due_date ?? "—"}</td>
                    <td className="py-3 pr-4"><StatusPill status={p.status} /></td>
                    <td className="py-3 text-right">{isAdmin && p.status !== "paid" && (<button onClick={() => markPaid.mutate(p.id)} className="rounded-lg bg-success/10 px-2.5 py-1 text-xs font-semibold text-success hover:bg-success/20">Mark paid</button>)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
      {showAdd && <AddPayment onClose={() => setShowAdd(false)} />}
    </div>
  );
}

function AddPayment({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [f, setF] = useState({ student_id: "", amount: 0, due_date: "", description: "" });
  const { data: students = [] } = useQuery({ queryKey: ["students-min"], queryFn: async () => { const { data } = await supabase.from("students").select("id,full_name,student_code").order("full_name"); return data ?? []; } });
  const mut = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("payments").insert({ student_id: f.student_id, invoice_number: `INV-${Date.now().toString().slice(-7)}`, amount: Number(f.amount), due_date: f.due_date || null, description: f.description || null, status: "pending" });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["payments"] }); qc.invalidateQueries({ queryKey: ["dashboard-stats"] }); toast.success("Invoice created"); onClose(); },
    onError: (e) => toast.error(e.message),
  });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-card" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between"><h3 className="font-display text-lg font-bold">Create invoice</h3><button onClick={onClose} className="rounded-lg p-1 hover:bg-muted"><X className="h-4 w-4" /></button></div>
        <form onSubmit={(e) => { e.preventDefault(); if (!f.student_id || !f.amount) return toast.error("Student & amount required"); mut.mutate(); }} className="space-y-3">
          <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Student *</label><select value={f.student_id} onChange={(e) => setF({ ...f, student_id: e.target.value })} className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-primary"><option value="">— Select —</option>{students.map((s) => <option key={s.id} value={s.id}>{s.full_name} ({s.student_code})</option>)}</select></div>
          <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amount (USD) *</label><input type="number" step="0.01" value={f.amount} onChange={(e) => setF({ ...f, amount: Number(e.target.value) })} className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-primary" /></div>
          <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Due date</label><input type="date" value={f.due_date} onChange={(e) => setF({ ...f, due_date: e.target.value })} className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-primary" /></div>
          <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</label><textarea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} rows={2} className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary" /></div>
          <button type="submit" disabled={mut.isPending} className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl gradient-primary text-sm font-semibold text-primary-foreground shadow-soft disabled:opacity-60">{mut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create invoice"}</button>
        </form>
      </div>
    </div>
  );
}
