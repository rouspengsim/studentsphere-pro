import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard, StatCard } from "@/components/app/ui";
import { useI18n } from "@/lib/i18n";
import { Download, FileBarChart, Users, Wallet, CalendarCheck } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, Legend } from "recharts";
import { revenueTrend, attendanceTrend, subjectsDistribution } from "@/lib/mock-data";

export const Route = createFileRoute("/app/reports")({
  head: () => ({ meta: [{ title: "Reports — EduCore" }] }),
  component: ReportsPage,
});

const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function ReportsPage() {
  const { t } = useI18n();
  return (
    <div>
      <PageHeader
        title={t("reports")}
        subtitle="Insights across attendance, scores and finance"
        actions={
          <>
            <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-medium hover:bg-muted">
              <Download className="h-4 w-4" /> PDF
            </button>
            <button className="inline-flex h-10 items-center gap-2 rounded-xl gradient-primary px-4 text-sm font-semibold text-primary-foreground shadow-soft hover:shadow-glow">
              <Download className="h-4 w-4" /> Excel
            </button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Avg attendance" value="93.4%" icon={<CalendarCheck className="h-5 w-5" />} tone="success" />
        <StatCard label="Avg score" value="78.2" icon={<FileBarChart className="h-5 w-5" />} tone="info" />
        <StatCard label="Active users" value="1,156" icon={<Users className="h-5 w-5" />} tone="primary" />
        <StatCard label="Collected" value="$24,800" icon={<Wallet className="h-5 w-5" />} tone="warning" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <SectionCard title="Revenue trend">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueTrend}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                <Line type="monotone" dataKey="revenue" stroke="var(--chart-1)" strokeWidth={3} dot={{ r: 4, fill: "var(--chart-1)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Attendance breakdown">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceTrend}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="present" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="absent" fill="var(--chart-4)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Subjects distribution" className="lg:col-span-2">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={subjectsDistribution} dataKey="value" nameKey="name" outerRadius={110} label>
                  {subjectsDistribution.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
