import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/app/ui";
import { useI18n } from "@/lib/i18n";
import { classes } from "@/lib/mock-data";
import { Plus, Users, MapPin, BookOpen } from "lucide-react";

export const Route = createFileRoute("/app/classes")({
  head: () => ({ meta: [{ title: "Classes — EduCore" }] }),
  component: ClassesPage,
});

const gradients = [
  "from-chart-1 to-chart-4",
  "from-chart-2 to-chart-3",
  "from-chart-3 to-chart-5",
  "from-chart-4 to-chart-1",
  "from-chart-5 to-chart-2",
];

function ClassesPage() {
  const { t } = useI18n();
  return (
    <div>
      <PageHeader
        title={t("classes")}
        subtitle="Create classes, assign teachers, manage subjects"
        actions={
          <button className="inline-flex h-10 items-center gap-2 rounded-xl gradient-primary px-4 text-sm font-semibold text-primary-foreground shadow-soft hover:shadow-glow">
            <Plus className="h-4 w-4" /> {t("add")} class
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {classes.map((c, i) => (
          <SectionCard key={c.id} className="overflow-hidden p-0">
            <div className={`bg-gradient-to-br ${gradients[i % gradients.length]} p-5 text-primary-foreground`}>
              <p className="text-[10px] font-semibold uppercase tracking-widest opacity-80">{c.code}</p>
              <p className="mt-1 font-display text-2xl font-bold">{c.name}</p>
              <p className="mt-0.5 text-xs opacity-90 flex items-center gap-1"><BookOpen className="h-3 w-3" /> {c.subject}</p>
            </div>
            <div className="space-y-2 p-5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Teacher</span>
                <span className="font-semibold">{c.teacher}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" /> Students</span>
                <span className="font-semibold">{c.students}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> Room</span>
                <span className="font-semibold">{c.room}</span>
              </div>
              <button className="mt-2 w-full rounded-xl bg-primary/10 py-2 text-xs font-semibold text-primary hover:bg-primary/20">Open dashboard</button>
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}
