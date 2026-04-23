import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, Search, Globe, LogOut, ChevronDown } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Topbar() {
  const { t, lang, setLang } = useI18n();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [openProfile, setOpenProfile] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);

  const initials = user?.name?.split(" ").map((p) => p[0]).slice(0, 2).join("") ?? "U";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-surface/80 px-4 backdrop-blur lg:px-6">
      <div className="flex flex-1 items-center gap-2">
        <div className="relative flex w-full max-w-xl items-center">
          <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder={t("search_placeholder")}
            className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-16 text-sm outline-none ring-0 transition-all focus:border-primary focus:bg-surface focus:shadow-soft"
          />
          <kbd className="absolute right-2 hidden rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-block">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setLang(lang === "en" ? "km" : "en")}
          className="flex h-10 items-center gap-1.5 rounded-xl border border-border bg-surface px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
        >
          <Globe className="h-3.5 w-3.5" />
          {lang === "en" ? "EN" : "ខ្មែរ"}
        </button>

        <div className="relative">
          <button
            onClick={() => { setOpenNotif((v) => !v); setOpenProfile(false); }}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-foreground transition-colors hover:bg-muted"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive ring-2 ring-surface" />
          </button>
          {openNotif && (
            <div className="absolute right-0 top-12 w-80 rounded-2xl border border-border bg-popover p-2 shadow-card">
              <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("notifications")}</p>
              <ul className="space-y-1">
                {["Fee due reminder · 12 students", "Midterm exams start May 6", "Class 8B attendance < 80%"].map((n, i) => (
                  <li key={i} className="rounded-xl px-3 py-2 text-sm hover:bg-muted">{n}</li>
                ))}
              </ul>
              <Link to="/app/notifications" onClick={() => setOpenNotif(false)} className="mt-1 block rounded-xl bg-primary/10 px-3 py-2 text-center text-xs font-semibold text-primary hover:bg-primary/15">View all</Link>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => { setOpenProfile((v) => !v); setOpenNotif(false); }}
            className="flex h-10 items-center gap-2 rounded-xl border border-border bg-surface pl-1 pr-2.5 text-left text-sm transition-colors hover:bg-muted"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary text-xs font-bold text-primary-foreground">
              {initials}
            </span>
            <span className="hidden sm:flex flex-col leading-tight">
              <span className="text-xs font-semibold">{user?.name ?? "Guest"}</span>
              <span className="text-[10px] capitalize text-muted-foreground">{user?.role ?? "—"}</span>
            </span>
            <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", openProfile && "rotate-180")} />
          </button>
          {openProfile && (
            <div className="absolute right-0 top-12 w-56 overflow-hidden rounded-2xl border border-border bg-popover shadow-card">
              <div className="border-b border-border bg-muted/50 px-4 py-3">
                <p className="text-sm font-semibold">{user?.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <button
                onClick={() => { signOut(); setOpenProfile(false); navigate({ to: "/" }); }}
                className="flex w-full items-center gap-2 px-4 py-3 text-sm text-foreground hover:bg-muted"
              >
                <LogOut className="h-4 w-4" /> {t("sign_out")}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
