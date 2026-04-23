import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard, StatCard, Avatar, StatusPill } from "@/components/app/ui";
import { useI18n } from "@/lib/i18n";
import { students } from "@/lib/mock-data";
import { CheckCircle2, XCircle, Clock, Download } from "lucide-react";
import { useState } from "react";

type Status = "present" | "absent" | "late";

export const Route = createFileRoute("/app/attendance")({
  head: () => ({ meta: [{ title: "Attendance — EduCore" }] }),
  component: AttendancePage,
});

function AttendancePage() {
  const { t } = useI18n();
  const [statuses, setStatuses] = useState<Record<string, Status>>(() => {
    const m: Record<string, Status> = {};
    students.slice(0, 18).forEach((s, i) => {
      m[s.id] = (["present", "present", "present", "late", "absent", "present"] as Status[])[i % 6];
    });
    return m;
  });

  const list = students.slice(0, 18);
  const present = list.filter((s) => statuses[s.id] === "present").length;
  const absent = list.filter((s) => statuses[s.id] === "absent").length;
  const late = list.filter((s) => statuses[s.id] === "late").length;

  const set = (id: string, s: Status) => setStatuses((prev) => ({ ...prev, [id]: s }));

  return (
    <div>
      <PageHeader
        title={t("attendance")}
        subtitle="Class 10A · Mon, April 23 · 08:00"
        actions={
          <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-medium hover:bg-muted">
            <Download className="h-4 w-4" /> {t("export")}
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={t("present")} value={present} icon={<CheckCircle2 className="h-5 w-5" />} tone="success" />
        <StatCard label={t("absent")} value={absent} icon={<XCircle className="h-5 w-5" />} tone="warning" />
        <StatCard label={t("late")} value={late} icon={<Clock className="h-5 w-5" />} tone="info" />
      </div>

      <SectionCard className="mt-6" title="Mark attendance" action={
        <div className="flex gap-1 text-xs">
          <button className="rounded-lg bg-success/10 px-3 py-1.5 font-semibold text-success">Mark all present</button>
        </div>
      }>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s) => {
            const st = statuses[s.id];
            return (
              <div key={s.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
                <Avatar name={s.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{s.name}</p>
                  <StatusPill status={st} />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => set(s.id, "present")} className={"flex h-8 w-8 items-center justify-center rounded-lg transition-colors " + (st === "present" ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground hover:bg-success/20")}>
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => set(s.id, "late")} className={"flex h-8 w-8 items-center justify-center rounded-lg transition-colors " + (st === "late" ? "bg-warning text-warning-foreground" : "bg-muted text-muted-foreground hover:bg-warning/20")}>
                    <Clock className="h-4 w-4" />
                  </button>
                  <button onClick={() => set(s.id, "absent")} className={"flex h-8 w-8 items-center justify-center rounded-lg transition-colors " + (st === "absent" ? "bg-destructive text-destructive-foreground" : "bg-muted text-muted-foreground hover:bg-destructive/20")}>
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}
