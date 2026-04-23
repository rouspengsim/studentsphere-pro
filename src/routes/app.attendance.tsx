import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard, StatCard } from "@/components/app/ui";
import { useI18n } from "@/lib/i18n";
import { CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Status = "present" | "absent" | "late";

export const Route = createFileRoute("/app/attendance")({
  head: () => ({ meta: [{ title: "Attendance — EduCore" }] }),
  component: AttendancePage,
});

function AttendancePage() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [classId, setClassId] = useState("");

  const { data: classes = [] } = useQuery({
    queryKey: ["classes-min"],
    queryFn: async () => {
      const { data } = await supabase.from("classes").select("id,name").order("name");
      return data ?? [];
    },
  });

  const { data: enrolled = [], isLoading } = useQuery({
    queryKey: ["enrolled-students", classId],
    enabled: !!classId,
    queryFn: async () => {
      const { data } = await supabase.from("enrollments").select("student_id,students(id,full_name,student_code)").eq("class_id", classId);
      return (data ?? []) as unknown as Array<{ student_id: string; students: { id: string; full_name: string; student_code: string } }>;
    },
  });

  const { data: existing = [] } = useQuery({
    queryKey: ["attendance-day", classId, date],
    enabled: !!classId,
    queryFn: async () => {
      const { data } = await supabase.from("attendance").select("student_id,status").eq("class_id", classId).eq("date", date);
      return data ?? [];
    },
  });

  const statusFor = (sid: string): Status => {
    const r = existing.find((e) => e.student_id === sid);
    return (r?.status as Status) ?? "present";
  };

  const setStatus = useMutation({
    mutationFn: async ({ sid, status }: { sid: string; status: Status }) => {
      const { error } = await supabase.from("attendance").upsert({ student_id: sid, class_id: classId, date, status }, { onConflict: "student_id,class_id,date" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attendance-day", classId, date] }),
    onError: (e) => toast.error(e.message),
  });

  const counts = { present: 0, absent: 0, late: 0 };
  enrolled.forEach((e) => { counts[statusFor(e.student_id)] += 1; });

  return (
    <div>
      <PageHeader title={t("attendance")} subtitle="Pick a class and date, tap to toggle status" />
      <div className="mb-4 flex flex-wrap gap-2">
        <select value={classId} onChange={(e) => setClassId(e.target.value)} className="h-10 rounded-xl border border-border bg-surface px-3 text-sm">
          <option value="">— Select class —</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-10 rounded-xl border border-border bg-surface px-3 text-sm" />
      </div>

      {!classId ? (
        <SectionCard><p className="py-8 text-center text-sm text-muted-foreground">Select a class to start.</p></SectionCard>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Present" value={counts.present} icon={<CheckCircle2 className="h-5 w-5" />} tone="success" />
            <StatCard label="Absent" value={counts.absent} icon={<XCircle className="h-5 w-5" />} tone="warning" />
            <StatCard label="Late" value={counts.late} icon={<Clock className="h-5 w-5" />} tone="info" />
          </div>
          <SectionCard className="mt-6">
            {isLoading ? (
              <div className="flex h-40 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
            ) : enrolled.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No students enrolled in this class.</p>
            ) : (
              <ul className="divide-y divide-border">
                {enrolled.map((e) => {
                  const st = statusFor(e.student_id);
                  return (
                    <li key={e.student_id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-semibold">{e.students.full_name}</p>
                        <p className="text-xs text-muted-foreground">{e.students.student_code}</p>
                      </div>
                      <div className="flex gap-1.5">
                        {(["present", "absent", "late"] as Status[]).map((s) => (
                          <button
                            key={s}
                            onClick={() => setStatus.mutate({ sid: e.student_id, status: s })}
                            className={
                              "rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors " +
                              (st === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")
                            }
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </SectionCard>
        </>
      )}
    </div>
  );
}
