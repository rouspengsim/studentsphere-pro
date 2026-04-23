import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard, StatusPill, Avatar } from "@/components/app/ui";
import { useI18n } from "@/lib/i18n";
import { students } from "@/lib/mock-data";
import { Plus, Search, Filter, Download, MoreHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/app/students")({
  head: () => ({ meta: [{ title: "Students — EduCore" }] }),
  component: StudentsPage,
});

function StudentsPage() {
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  const filtered = useMemo(() => {
    return students.filter((s) => {
      if (filter !== "all" && s.status !== filter) return false;
      if (q && !s.name.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [q, filter]);

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
            <button className="inline-flex h-10 items-center gap-2 rounded-xl gradient-primary px-4 text-sm font-semibold text-primary-foreground shadow-soft hover:shadow-glow">
              <Plus className="h-4 w-4" /> {t("add")} {t("student")}
            </button>
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
              placeholder="Search by name…"
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

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="py-3 pr-4">Student</th>
                <th className="py-3 pr-4">Grade · Class</th>
                <th className="py-3 pr-4">Attendance</th>
                <th className="py-3 pr-4">GPA</th>
                <th className="py-3 pr-4">Fees</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 20).map((s) => (
                <tr key={s.id} className="group border-b border-border/60 transition-colors hover:bg-muted/40">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={s.name} />
                      <div>
                        <p className="font-semibold leading-tight">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <p className="font-medium">{s.grade}</p>
                    <p className="text-xs text-muted-foreground">{s.className}</p>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: s.attendance + "%" }} />
                      </div>
                      <span className="text-xs font-semibold">{s.attendance}%</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 font-semibold">{s.gpa.toFixed(2)}</td>
                  <td className="py-3 pr-4"><StatusPill status={s.feeStatus} /></td>
                  <td className="py-3 pr-4"><StatusPill status={s.status} /></td>
                  <td className="py-3 text-right">
                    <button className="rounded-lg p-2 opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <p>Showing {Math.min(20, filtered.length)} of {filtered.length}</p>
          <div className="flex gap-1">
            <button className="rounded-lg border border-border px-2.5 py-1 hover:bg-muted">Prev</button>
            <button className="rounded-lg border border-border bg-primary text-primary-foreground px-2.5 py-1">1</button>
            <button className="rounded-lg border border-border px-2.5 py-1 hover:bg-muted">2</button>
            <button className="rounded-lg border border-border px-2.5 py-1 hover:bg-muted">Next</button>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
