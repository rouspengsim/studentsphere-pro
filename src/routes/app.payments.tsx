import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard, StatCard, StatusPill, Avatar } from "@/components/app/ui";
import { useI18n } from "@/lib/i18n";
import { payments } from "@/lib/mock-data";
import { DollarSign, Receipt, AlertTriangle, Plus, Download } from "lucide-react";

export const Route = createFileRoute("/app/payments")({
  head: () => ({ meta: [{ title: "Payments — EduCore" }] }),
  component: PaymentsPage,
});

function PaymentsPage() {
  const { t } = useI18n();
  const total = payments.reduce((s, p) => s + p.amount, 0);
  const overdue = payments.filter((p) => p.status === "overdue").length;
  const paid = payments.filter((p) => p.status === "paid").length;

  return (
    <div>
      <PageHeader
        title={t("payments")}
        subtitle="Track invoices, fees, and payment history"
        actions={
          <>
            <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-medium hover:bg-muted">
              <Download className="h-4 w-4" /> {t("export")}
            </button>
            <button className="inline-flex h-10 items-center gap-2 rounded-xl gradient-primary px-4 text-sm font-semibold text-primary-foreground shadow-soft hover:shadow-glow">
              <Plus className="h-4 w-4" /> New invoice
            </button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={t("total")} value={`$${total.toLocaleString()}`} icon={<DollarSign className="h-5 w-5" />} tone="primary" />
        <StatCard label={t("paid")} value={paid} icon={<Receipt className="h-5 w-5" />} tone="success" />
        <StatCard label={t("overdue")} value={overdue} icon={<AlertTriangle className="h-5 w-5" />} tone="warning" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {payments.slice(0, 6).map((p) => (
          <SectionCard key={p.id} className="relative overflow-hidden">
            <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-primary/5 blur-2xl" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar name={p.student} />
                <div>
                  <p className="font-semibold leading-tight">{p.student}</p>
                  <p className="text-xs text-muted-foreground">{p.method}</p>
                </div>
              </div>
              <StatusPill status={p.status} />
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Amount</p>
                <p className="font-display text-2xl font-bold">${p.amount}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Date</p>
                <p className="text-xs font-semibold">{p.date}</p>
              </div>
            </div>
          </SectionCard>
        ))}
      </div>

      <SectionCard className="mt-6" title="Payment timeline">
        <ul className="relative space-y-4 border-l-2 border-border pl-6">
          {payments.slice(0, 8).map((p) => (
            <li key={p.id} className="relative">
              <span className={"absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-card " + (p.status === "paid" ? "bg-success" : p.status === "overdue" ? "bg-destructive" : "bg-warning")} />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{p.student} <span className="font-normal text-muted-foreground">paid via {p.method}</span></p>
                  <p className="text-xs text-muted-foreground">{p.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display text-base font-bold">${p.amount}</span>
                  <StatusPill status={p.status} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
