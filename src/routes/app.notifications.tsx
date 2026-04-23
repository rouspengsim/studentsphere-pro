import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard, Avatar } from "@/components/app/ui";
import { useI18n } from "@/lib/i18n";
import { notifications } from "@/lib/mock-data";
import { Bell, Send, Megaphone, Plus } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/app/notifications")({
  head: () => ({ meta: [{ title: "Notifications — EduCore" }] }),
  component: NotificationsPage,
});

const messages = [
  { from: "Sokha Vong", role: "Admin", text: "Reminder: midterm grades due Friday.", time: "9:12 AM", mine: false },
  { from: "Me", role: "Teacher", text: "Got it, I'll submit tonight.", time: "9:14 AM", mine: true },
  { from: "Sokha Vong", role: "Admin", text: "Thanks Dara!", time: "9:15 AM", mine: false },
];

function NotificationsPage() {
  const { t } = useI18n();
  const [chat, setChat] = useState(messages);
  const [text, setText] = useState("");

  const send = () => {
    if (!text.trim()) return;
    setChat((c) => [...c, { from: "Me", role: "Teacher", text, time: "now", mine: true }]);
    setText("");
  };

  const dotColor = (type: string) =>
    type === "danger" ? "bg-destructive" : type === "warning" ? "bg-warning" : type === "success" ? "bg-success" : "bg-info";

  return (
    <div>
      <PageHeader
        title={t("notifications")}
        subtitle="Announcements, alerts and messaging"
        actions={
          <button className="inline-flex h-10 items-center gap-2 rounded-xl gradient-primary px-4 text-sm font-semibold text-primary-foreground shadow-soft hover:shadow-glow">
            <Plus className="h-4 w-4" /> Announcement
          </button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title={
          <span className="flex items-center gap-2"><Bell className="h-4 w-4" /> Alerts</span>
        }>
          <ul className="space-y-3">
            {notifications.map((n) => (
              <li key={n.id} className="flex items-start gap-3 rounded-xl border border-border/60 p-3">
                <span className={"mt-1 h-2 w-2 shrink-0 rounded-full " + dotColor(n.type)} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-tight">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.desc}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">{n.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title={<span className="flex items-center gap-2"><Megaphone className="h-4 w-4" /> Announcements</span>}>
          <ul className="space-y-3">
            {[
              { t: "Sports day rescheduled", d: "Now on May 11 at the main field.", date: "Today" },
              { t: "New library hours", d: "Open until 8 PM weekdays.", date: "Yesterday" },
              { t: "Parent-teacher meeting", d: "Saturday 9 AM in the auditorium.", date: "2d ago" },
            ].map((a, i) => (
              <li key={i} className="rounded-xl bg-primary-soft p-4">
                <p className="text-sm font-semibold text-primary">{a.t}</p>
                <p className="mt-0.5 text-xs text-foreground/80">{a.d}</p>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">{a.date}</p>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Messaging" className="flex flex-col">
          <div className="flex-1 space-y-3 overflow-y-auto">
            {chat.map((m, i) => (
              <div key={i} className={"flex gap-2 " + (m.mine ? "flex-row-reverse" : "")}>
                {!m.mine && <Avatar name={m.from} className="h-7 w-7 text-[10px]" />}
                <div className={"max-w-[80%] rounded-2xl px-3 py-2 text-sm " + (m.mine ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm")}>
                  <p>{m.text}</p>
                  <p className={"mt-0.5 text-[10px] " + (m.mine ? "text-primary-foreground/70" : "text-muted-foreground")}>{m.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2 border-t border-border pt-3">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type a message…"
              className="h-10 flex-1 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            />
            <button onClick={send} className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary text-primary-foreground hover:shadow-glow">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
