import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/app/ui";
import { useI18n } from "@/lib/i18n";
import { MapPin, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/app/timetable")({
  head: () => ({ meta: [{ title: "Timetable — EduCore" }] }),
  component: TimetablePage,
});

const days = ["mon", "tue", "wed", "thu", "fri", "sat"] as const;

function TimetablePage() {
  const { t } = useI18n();
  const { data: slots = [], isLoading } = useQuery({
    queryKey: ["timetable"],
    queryFn: async () => {
      const { data } = await supabase.from("timetable_slots").select("id,day,start_time,end_time,room,classes(name,subject_code)").order("start_time");
      return (data ?? []) as unknown as Array<{ id: string; day: string; start_time: string; end_time: string; room: string | null; classes: { name: string; subject_code: string } | null }>;
    },
  });

  return (
    <div>
      <PageHeader title={t("timetable")} subtitle="Weekly schedule across all classes" />
      <SectionCard>
        {isLoading ? (
          <div className="flex h-40 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        ) : slots.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">No timetable slots yet.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
            {days.map((d) => (
              <div key={d} className="rounded-xl border border-border bg-surface p-3">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">{d}</p>
                <ul className="space-y-2">
                  {slots.filter((s) => s.day === d).map((s) => (
                    <li key={s.id} className="rounded-lg bg-primary/10 p-2 text-xs">
                      <p className="font-semibold text-primary">{s.classes?.name ?? "—"}</p>
                      <p className="text-[10px] text-muted-foreground">{s.start_time.slice(0, 5)}–{s.end_time.slice(0, 5)}</p>
                      {s.room && <p className="flex items-center gap-1 text-[10px] text-muted-foreground"><MapPin className="h-2.5 w-2.5" /> {s.room}</p>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
