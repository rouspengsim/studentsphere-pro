import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard, Avatar } from "@/components/app/ui";
import { useI18n } from "@/lib/i18n";
import { students } from "@/lib/mock-data";
import { Plus, Save } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/app/exams")({
  head: () => ({ meta: [{ title: "Exams & Scores — EduCore" }] }),
  component: ExamsPage,
});

const subjects = ["Math", "English", "Khmer", "Physics", "Biology"];

function gradeFor(avg: number) {
  if (avg >= 90) return { g: "A+", c: "text-success" };
  if (avg >= 80) return { g: "A", c: "text-success" };
  if (avg >= 70) return { g: "B", c: "text-info" };
  if (avg >= 60) return { g: "C", c: "text-warning" };
  return { g: "D", c: "text-destructive" };
}

function ExamsPage() {
  const { t } = useI18n();
  const [scores, setScores] = useState<Record<string, number[]>>(() => {
    const m: Record<string, number[]> = {};
    students.slice(0, 14).forEach((s, i) => {
      m[s.id] = subjects.map((_, j) => 55 + ((i * 13 + j * 7) % 45));
    });
    return m;
  });

  const list = students.slice(0, 14);

  return (
    <div>
      <PageHeader
        title={t("exams")}
        subtitle="Midterm · April 2026 · Class 10A"
        actions={
          <>
            <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-medium hover:bg-muted">
              <Plus className="h-4 w-4" /> New exam
            </button>
            <button className="inline-flex h-10 items-center gap-2 rounded-xl gradient-primary px-4 text-sm font-semibold text-primary-foreground shadow-soft hover:shadow-glow">
              <Save className="h-4 w-4" /> {t("save")}
            </button>
          </>
        }
      />

      <SectionCard>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="py-3 pr-4 sticky left-0 bg-card">Student</th>
                {subjects.map((s) => (
                  <th key={s} className="py-3 px-2 text-center">{s}</th>
                ))}
                <th className="py-3 px-2 text-center">Avg</th>
                <th className="py-3 px-2 text-center">Grade</th>
              </tr>
            </thead>
            <tbody>
              {list.map((s, i) => {
                const row = scores[s.id];
                const avg = row.reduce((a, b) => a + b, 0) / row.length;
                const grade = gradeFor(avg);
                return (
                  <tr key={s.id} className="border-b border-border/60 hover:bg-muted/40">
                    <td className="py-2 pr-4 sticky left-0 bg-card">
                      <div className="flex items-center gap-2">
                        <Avatar name={s.name} className="h-8 w-8 text-[10px]" />
                        <span className="font-medium">{s.name}</span>
                      </div>
                    </td>
                    {subjects.map((_, j) => (
                      <td key={j} className="py-2 px-1 text-center">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={row[j]}
                          onChange={(e) => {
                            const v = Math.max(0, Math.min(100, Number(e.target.value)));
                            setScores((prev) => {
                              const next = { ...prev };
                              const arr = [...next[s.id]];
                              arr[j] = v;
                              next[s.id] = arr;
                              return next;
                            });
                          }}
                          className="h-9 w-14 rounded-lg border border-transparent bg-muted/50 text-center text-sm font-semibold outline-none focus:border-primary focus:bg-surface"
                        />
                      </td>
                    ))}
                    <td className="py-2 px-2 text-center font-semibold">{avg.toFixed(1)}</td>
                    <td className={"py-2 px-2 text-center font-bold " + grade.c}>{grade.g}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
