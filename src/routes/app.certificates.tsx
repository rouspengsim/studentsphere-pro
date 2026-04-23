import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard, StatusPill } from "@/components/app/ui";
import { useI18n } from "@/lib/i18n";
import { certificates, students } from "@/lib/mock-data";
import { Award, Download, QrCode, Sparkles, Plus, Eye } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/app/certificates")({
  head: () => ({ meta: [{ title: "Certificates — EduCore" }] }),
  component: CertificatesPage,
});

function CertificatesPage() {
  const { t } = useI18n();
  const [type, setType] = useState<"Completion" | "Graduation" | "Award">("Completion");
  const [name, setName] = useState(students[0].name);
  const [course, setCourse] = useState("Mathematics 10");
  const [date, setDate] = useState("April 23, 2026");

  const code = `EDU-${(2026000 + name.length + course.length).toString()}`;

  return (
    <div>
      <PageHeader
        title={t("certificates")}
        subtitle="Design, issue and verify certificates"
        actions={
          <>
            <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-medium hover:bg-muted">
              <Download className="h-4 w-4" /> Bulk export
            </button>
            <button className="inline-flex h-10 items-center gap-2 rounded-xl gradient-primary px-4 text-sm font-semibold text-primary-foreground shadow-soft hover:shadow-glow">
              <Plus className="h-4 w-4" /> Generate
            </button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Preview */}
        <SectionCard className="lg:col-span-3 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Live preview</p>
          <div className="relative aspect-[1.414/1] overflow-hidden rounded-2xl border-4 border-double border-primary/30 bg-gradient-to-br from-primary-soft via-surface to-accent/30 p-8">
            <div className="absolute inset-0 bg-grid opacity-30" />
            <div className="relative flex h-full flex-col items-center justify-center text-center">
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="h-5 w-5" />
                <p className="font-display text-xs uppercase tracking-[0.3em] font-bold">EduCore Academy</p>
                <Sparkles className="h-5 w-5" />
              </div>
              <p className="mt-3 text-xs uppercase tracking-widest text-muted-foreground">Certificate of {type}</p>
              <p className="mt-4 text-xs text-muted-foreground">This is to certify that</p>
              <p className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">{name}</p>
              <p className="mt-3 max-w-md text-sm text-muted-foreground">
                has successfully completed the course <span className="font-semibold text-foreground">{course}</span> with distinction.
              </p>
              <p className="mt-4 text-xs text-muted-foreground">Issued on {date}</p>

              <div className="mt-6 flex w-full items-end justify-between">
                <div className="text-left text-xs">
                  <p className="border-b border-foreground pb-1 font-display font-bold">Sokha Vong</p>
                  <p className="mt-1 text-muted-foreground">Director</p>
                </div>
                <div className="flex flex-col items-center text-[10px] text-muted-foreground">
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-foreground text-background">
                    <QrCode className="h-8 w-8" />
                  </div>
                  <p className="mt-1 font-mono">{code}</p>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Settings */}
        <SectionCard className="lg:col-span-2" title="Settings">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</label>
              <div className="grid grid-cols-3 gap-2">
                {(["Completion", "Graduation", "Award"] as const).map((tp) => (
                  <button
                    key={tp}
                    onClick={() => setType(tp)}
                    className={
                      "rounded-xl border px-3 py-2 text-xs font-semibold transition-all " +
                      (type === tp ? "border-primary bg-primary/10 text-primary" : "border-border bg-surface text-muted-foreground hover:bg-muted")
                    }
                  >
                    {tp}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Student</label>
              <select
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              >
                {students.slice(0, 12).map((s) => <option key={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Course</label>
              <input
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</label>
              <input
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <button className="flex h-11 w-full items-center justify-center gap-2 rounded-xl gradient-primary text-sm font-semibold text-primary-foreground shadow-soft hover:shadow-glow">
              <Award className="h-4 w-4" /> Generate certificate
            </button>
          </div>
        </SectionCard>
      </div>

      <SectionCard className="mt-6" title="Issued certificates" action={<button className="text-xs font-semibold text-primary hover:underline">View all</button>}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="py-3 pr-4">Code</th>
                <th className="py-3 pr-4">Student</th>
                <th className="py-3 pr-4">Type</th>
                <th className="py-3 pr-4">Course</th>
                <th className="py-3 pr-4">Issued</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3" />
              </tr>
            </thead>
            <tbody>
              {certificates.map((c) => (
                <tr key={c.id} className="group border-b border-border/60 hover:bg-muted/40">
                  <td className="py-3 pr-4 font-mono text-xs">{c.code}</td>
                  <td className="py-3 pr-4 font-medium">{c.student}</td>
                  <td className="py-3 pr-4">{c.type}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{c.course}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{c.issuedAt}</td>
                  <td className="py-3 pr-4"><StatusPill status="active" /></td>
                  <td className="py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"><Eye className="h-4 w-4" /></button>
                      <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"><Download className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
