import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/app/ui";
import { useI18n } from "@/lib/i18n";
import { timetable } from "@/lib/mock-data";
import { Plus, MapPin } from "lucide-react";

export const Route = createFileRoute("/app/timetable")({
  head: () => ({ meta: [{ title: "Timetable — EduCore" }] }),
  component: TimetablePage,
});

const hours = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"];
const subjectColors: Record<string, string> = {
  Math: "bg-chart-1/20 border-chart-1 text-chart-1",
  English: "bg-chart-2/20 border-chart-2 text-chart-2",
  Khmer: "bg-chart-3/20 border-chart-3 text-chart-3",
  Physics: "bg-chart-4/20 border-chart-4 text-chart-4",
  Biology: "bg-chart-5/20 border-chart-5 text-chart-5",
  Art: "bg-chart-3/20 border-chart-3 text-chart-3",
  History: "bg-chart-2/20 border-chart-2 text-chart-2",
  Chemistry: "bg-chart-1/20 border-chart-1 text-chart-1",
  PE: "bg-chart-5/20 border-chart-5 text-chart-5",
};

function TimetablePage() {
  const { t } = useI18n();

  return (
    <div>
      <PageHeader
        title={t("timetable")}
        subtitle="Week of April 21 — April 25"
        actions={
          <button className="inline-flex h-10 items-center gap-2 rounded-xl gradient-primary px-4 text-sm font-semibold text-primary-foreground shadow-soft hover:shadow-glow">
            <Plus className="h-4 w-4" /> Add slot
          </button>
        }
      />

      <SectionCard>
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-[80px_repeat(5,1fr)] gap-2">
              <div />
              {timetable.map((d) => (
                <div key={d.day} className="rounded-xl bg-muted/50 py-2 text-center">
                  <p className="font-display text-sm font-bold">{d.day}</p>
                </div>
              ))}

              {hours.map((h) => (
                <div key={h} className="contents">
                  <div className="flex items-start justify-end pr-2 pt-2 text-xs font-medium text-muted-foreground">{h}</div>
                  {timetable.map((d) => {
                    const slot = d.slots.find((s) => s.time === h);
                    return (
                      <div key={d.day + h} className="min-h-[64px] rounded-xl border border-dashed border-border/60 p-1.5">
                        {slot && (
                          <div className={"h-full rounded-lg border p-2 " + (subjectColors[slot.subject] ?? "bg-muted border-border text-foreground")}>
                            <p className="text-xs font-bold leading-tight">{slot.subject}</p>
                            <p className="mt-0.5 flex items-center gap-1 text-[10px] opacity-80">
                              <MapPin className="h-2.5 w-2.5" /> {slot.room}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
