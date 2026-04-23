import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StatCard, SectionCard, StatusPill, Avatar } from "@/components/app/ui";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import {
  Users, GraduationCap, School, DollarSign, Plus, ArrowUpRight,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import { students, attendanceTrend, revenueTrend, subjectsDistribution, payments, notifications } from "@/lib/mock-data";

export const Route = createFileRoute("/app/")({
  head: () => ({ meta: [{ title: "Dashboard — EduCore" }] }),
  component: Dashboard,
});

const pieColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function Dashboard() {
  const { t } = useI18n();
  const { user } = useAuth();
  const today = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  return (
    <div>
      <PageHeader
        title={
          <>
            {t("good_morning")}, <span className="text-primary">{user?.name?.split(" ")[0] ?? "Friend"}</span> 👋
          </>
        }
        subtitle={today}
        actions={
          <>
            <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-medium hover:bg-muted">
              <ArrowUpRight className="h-4 w-4" /> {t("export")}
            </button>
            <button className="inline-flex h-10 items-center gap-2 rounded-xl gradient-primary px-4 text-sm font-semibold text-primary-foreground shadow-soft hover:shadow-glow">
              <Plus className="h-4 w-4" /> {t("add")} Student
            </button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t("total_students")} value="1,284" delta="+12% this month" icon={<Users className="h-5 w-5" />} tone="primary" />
        <StatCard label={t("total_teachers")} value="86" delta="+3 new hires" icon={<GraduationCap className="h-5 w-5" />} tone="info" />
        <StatCard label={t("active_classes")} value="42" delta="+2 classes" icon={<School className="h-5 w-5" />} tone="success" />
        <StatCard label={t("revenue")} value="$24,800" delta="+18% MoM" icon={<DollarSign className="h-5 w-5" />} tone="warning" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <SectionCard title={t("revenue")} className="lg:col-span-2">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="revenue" stroke="var(--chart-1)" strokeWidth={2.5} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Subjects mix">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={subjectsDistribution} dataKey="value" nameKey="name" innerRadius={48} outerRadius={80} paddingAngle={3}>
                  {subjectsDistribution.map((_, i) => (
                    <Cell key={i} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <SectionCard title={t("attendance_today")} className="lg:col-span-2">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceTrend} barCategoryGap={20}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="present" stackId="a" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="absent" stackId="a" fill="var(--chart-4)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title={t("recent_activity")}>
          <ul className="space-y-3">
            {notifications.slice(0, 4).map((n) => (
              <li key={n.id} className="flex items-start gap-3 rounded-xl p-2 transition-colors hover:bg-muted/50">
                <span className={"mt-1 h-2 w-2 shrink-0 rounded-full " + (n.type === "danger" ? "bg-destructive" : n.type === "warning" ? "bg-warning" : n.type === "success" ? "bg-success" : "bg-info")} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-tight">{n.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{n.desc}</p>
                </div>
                <span className="shrink-0 text-[10px] text-muted-foreground">{n.time}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <SectionCard title="New students" action={<button className="text-xs font-semibold text-primary hover:underline">View all</button>}>
          <ul className="space-y-3">
            {students.slice(0, 5).map((s) => (
              <li key={s.id} className="flex items-center gap-3">
                <Avatar name={s.name} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-tight">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.grade} · {s.className}</p>
                </div>
                <StatusPill status={s.status} />
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Latest payments" action={<button className="text-xs font-semibold text-primary hover:underline">View all</button>}>
          <ul className="divide-y divide-border">
            {payments.slice(0, 5).map((p) => (
              <li key={p.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-semibold">{p.student}</p>
                  <p className="text-xs text-muted-foreground">{p.method} · {p.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">${p.amount}</p>
                  <StatusPill status={p.status} />
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
