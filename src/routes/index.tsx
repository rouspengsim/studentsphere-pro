import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useAuth, type Role } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { GanttChart, GraduationCap, ShieldCheck, User, ArrowRight } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in — EduCore UMS" },
      { name: "description", content: "Sign in to EduCore, the modern university management platform." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { t, lang, setLang } = useI18n();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("admin");

  const doSignIn = (r: Role) => {
    signIn(r);
    // Defer navigation so localStorage write + state commit happen first
    setTimeout(() => {
      navigate({ to: "/app" });
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    doSignIn(role);
  };

  const quickIn = (r: Role) => {
    doSignIn(r);
  };

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-background">
      {/* Left brand panel */}
      <div className="relative hidden lg:flex w-1/2 flex-col justify-between overflow-hidden gradient-primary p-12 text-primary-foreground">
        <div className="absolute inset-0 bg-grid opacity-[0.08]" />
        <div className="relative flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <GanttChart className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <p className="font-display text-lg font-bold">EduCore</p>
            <p className="text-[10px] uppercase tracking-widest opacity-80">UMS · 2026</p>
          </div>
        </div>

        <div className="relative space-y-4">
          <h1 className="font-display text-4xl font-bold leading-tight">
            The modern way to run<br /> your school.
          </h1>
          <p className="max-w-md text-sm opacity-85">
            Banking-grade UX for students, teachers, classes, attendance, exams, payments and certificates — all in one delightful platform.
          </p>
          <div className="flex flex-wrap gap-2 pt-4">
            {["Students", "Attendance", "Payments", "Exams", "Certificates"].map((c) => (
              <span key={c} className="rounded-full bg-white/15 px-3 py-1 text-xs backdrop-blur">{c}</span>
            ))}
          </div>
        </div>

        <div className="relative grid grid-cols-3 gap-3 text-xs">
          {[
            { k: "1,284", v: "Students" },
            { k: "98.4%", v: "Uptime" },
            { k: "12", v: "Modules" },
          ].map((s) => (
            <div key={s.v} className="rounded-xl bg-white/10 p-3 backdrop-blur">
              <p className="font-display text-lg font-bold">{s.k}</p>
              <p className="opacity-75">{s.v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="relative flex w-full items-center justify-center p-6 lg:w-1/2">
        <button
          onClick={() => setLang(lang === "en" ? "km" : "en")}
          className="absolute right-6 top-6 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold hover:bg-muted"
        >
          {lang === "en" ? "ខ្មែរ" : "EN"}
        </button>

        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary text-primary-foreground">
              <GanttChart className="h-5 w-5" />
            </div>
            <p className="font-display text-lg font-bold">EduCore</p>
          </div>

          <h2 className="font-display text-3xl font-bold tracking-tight">{t("welcome_back")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("sign_in_to")}</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("email")}</label>
              <input
                type="email"
                defaultValue={`${role}@educore.app`}
                className="h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm outline-none transition-all focus:border-primary focus:shadow-soft"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("password")}</label>
              <input
                type="password"
                defaultValue="••••••••"
                className="h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm outline-none transition-all focus:border-primary focus:shadow-soft"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Role</label>
              <div className="grid grid-cols-3 gap-2">
                {(["admin", "teacher", "student"] as const).map((r) => {
                  const Icon = r === "admin" ? ShieldCheck : r === "teacher" ? GraduationCap : User;
                  const active = role === r;
                  return (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setRole(r)}
                      className={
                        "flex flex-col items-center gap-1 rounded-xl border p-3 text-xs font-semibold capitalize transition-all " +
                        (active
                          ? "border-primary bg-primary/10 text-primary shadow-soft"
                          : "border-border bg-surface text-muted-foreground hover:bg-muted")
                      }
                    >
                      <Icon className="h-4 w-4" />
                      {t(r)}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl gradient-primary text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:shadow-glow"
            >
              {t("sign_in")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </form>

          <div className="mt-8">
            <p className="mb-2 text-center text-xs text-muted-foreground">{t("continue_as")}</p>
            <div className="grid grid-cols-3 gap-2">
              {(["admin", "teacher", "student"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => quickIn(r)}
                  className="rounded-xl border border-border bg-surface px-3 py-2 text-xs font-medium capitalize hover:bg-muted"
                >
                  {t(r)}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            By continuing you agree to our <Link to="/" className="text-primary hover:underline">Terms</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
