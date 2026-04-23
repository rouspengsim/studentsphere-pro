import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard, Avatar } from "@/components/app/ui";
import { useI18n } from "@/lib/i18n";
import { teachers } from "@/lib/mock-data";
import { Plus, BookOpen, Users, Star } from "lucide-react";

export const Route = createFileRoute("/app/teachers")({
  head: () => ({ meta: [{ title: "Teachers — EduCore" }] }),
  component: TeachersPage,
});

function TeachersPage() {
  const { t } = useI18n();
  return (
    <div>
      <PageHeader
        title={t("teachers")}
        subtitle="Profiles, schedules and class assignments"
        actions={
          <button className="inline-flex h-10 items-center gap-2 rounded-xl gradient-primary px-4 text-sm font-semibold text-primary-foreground shadow-soft hover:shadow-glow">
            <Plus className="h-4 w-4" /> {t("add")} {t("teacher")}
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {teachers.map((teacher) => (
          <SectionCard key={teacher.id} className="transition-all hover:shadow-card hover:-translate-y-0.5">
            <div className="flex items-start gap-3">
              <Avatar name={teacher.name} className="h-12 w-12 text-sm" />
              <div className="min-w-0 flex-1">
                <p className="font-display text-base font-bold leading-tight">{teacher.name}</p>
                <p className="text-xs text-muted-foreground">{teacher.email}</p>
                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                  <BookOpen className="h-3 w-3" /> {teacher.subject}
                </span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4 text-center">
              <div>
                <p className="font-display text-base font-bold">{teacher.classes}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Classes</p>
              </div>
              <div>
                <p className="font-display text-base font-bold">{teacher.experience}y</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Experience</p>
              </div>
              <div>
                <p className="flex items-center justify-center gap-0.5 font-display text-base font-bold">
                  <Star className="h-3.5 w-3.5 fill-warning text-warning" /> 4.{(teacher.experience % 9) + 1}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Rating</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button className="flex-1 rounded-xl bg-primary/10 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/20">View profile</button>
              <button className="rounded-xl border border-border px-3 py-2 text-xs hover:bg-muted">
                <Users className="h-3.5 w-3.5" />
              </button>
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}
