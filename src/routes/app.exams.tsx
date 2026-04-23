import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/app/ui";
import { useI18n } from "@/lib/i18n";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/app/exams")({
  head: () => ({ meta: [{ title: "Exams & Scores — EduCore" }] }),
  component: ExamsPage,
});

function ExamsPage() {
  const { t } = useI18n();
  const { data: exams = [], isLoading } = useQuery({
    queryKey: ["exams"],
    queryFn: async () => {
      const { data } = await supabase.from("exams").select("id,name,exam_type,exam_date,max_score,classes(name,subject_code)").order("exam_date", { ascending: false });
      return (data ?? []) as unknown as Array<{ id: string; name: string; exam_type: string; exam_date: string | null; max_score: number; classes: { name: string; subject_code: string } | null }>;
    },
  });

  return (
    <div>
      <PageHeader title={t("exams")} subtitle="All scheduled exams across classes" />
      <SectionCard>
        {isLoading ? (
          <div className="flex h-40 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        ) : exams.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">No exams scheduled yet. Create classes first, then add exams from the database.</p>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"><th className="py-3 pr-4">Exam</th><th className="py-3 pr-4">Class</th><th className="py-3 pr-4">Type</th><th className="py-3 pr-4">Date</th><th className="py-3">Max</th></tr></thead>
            <tbody>
              {exams.map((e) => (
                <tr key={e.id} className="border-b border-border/60">
                  <td className="py-3 pr-4 font-semibold">{e.name}</td>
                  <td className="py-3 pr-4">{e.classes?.name ?? "—"}</td>
                  <td className="py-3 pr-4 capitalize">{e.exam_type}</td>
                  <td className="py-3 pr-4 text-xs text-muted-foreground">{e.exam_date ?? "—"}</td>
                  <td className="py-3">{e.max_score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </SectionCard>
    </div>
  );
}
