import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/app/ui";
import { useI18n } from "@/lib/i18n";
import { ShieldCheck, GraduationCap, User, Plus } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/app/roles")({
  head: () => ({ meta: [{ title: "Roles & Permissions — EduCore" }] }),
  component: RolesPage,
});

const permissions = [
  "View students", "Edit students", "View teachers", "Edit teachers",
  "Manage classes", "Mark attendance", "Enter scores", "Issue certificates",
  "Manage payments", "View reports", "Send announcements", "Manage roles",
];

const initial: Record<string, boolean[]> = {
  Admin: permissions.map(() => true),
  Teacher: [true, false, true, false, false, true, true, false, false, true, true, false],
  Student: [false, false, false, false, false, false, false, false, false, false, false, false],
};

function RolesPage() {
  const { t } = useI18n();
  const [matrix, setMatrix] = useState(initial);

  const toggle = (role: string, idx: number) => {
    setMatrix((prev) => ({
      ...prev,
      [role]: prev[role].map((v, i) => (i === idx ? !v : v)),
    }));
  };

  const roleIcon = (r: string) => r === "Admin" ? ShieldCheck : r === "Teacher" ? GraduationCap : User;

  return (
    <div>
      <PageHeader
        title={t("roles")}
        subtitle="Define what each role can do"
        actions={
          <button className="inline-flex h-10 items-center gap-2 rounded-xl gradient-primary px-4 text-sm font-semibold text-primary-foreground shadow-soft hover:shadow-glow">
            <Plus className="h-4 w-4" /> {t("add")} role
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {Object.keys(matrix).map((r) => {
          const Icon = roleIcon(r);
          const count = matrix[r].filter(Boolean).length;
          return (
            <SectionCard key={r}>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-base font-bold">{r}</p>
                  <p className="text-xs text-muted-foreground">{count} of {permissions.length} permissions</p>
                </div>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: (count / permissions.length) * 100 + "%" }} />
              </div>
            </SectionCard>
          );
        })}
      </div>

      <SectionCard className="mt-6" title="Permission matrix">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="py-3 pr-4">Permission</th>
                {Object.keys(matrix).map((r) => (
                  <th key={r} className="py-3 px-4 text-center">{r}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissions.map((p, i) => (
                <tr key={p} className="border-b border-border/60 hover:bg-muted/40">
                  <td className="py-3 pr-4 font-medium">{p}</td>
                  {Object.keys(matrix).map((r) => (
                    <td key={r} className="py-3 px-4 text-center">
                      <button
                        onClick={() => toggle(r, i)}
                        className={
                          "relative inline-flex h-5 w-9 items-center rounded-full transition-colors " +
                          (matrix[r][i] ? "bg-primary" : "bg-muted")
                        }
                      >
                        <span
                          className={
                            "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform " +
                            (matrix[r][i] ? "translate-x-4" : "translate-x-0.5")
                          }
                        />
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
