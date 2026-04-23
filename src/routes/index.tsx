import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { GanttChart, ArrowRight, Mail, Lock, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
  const { user, loading, refresh } = useAuth();
  const navigate = useNavigate();
  const router = useRouter();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  // If already signed in, go to /app
  useEffect(() => {
    if (!loading && user) {
      navigate({ to: "/app" });
    }
  }, [loading, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/app`,
            data: { full_name: fullName || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Account created! Signing you in…");
        // Auto-confirm enabled — session should be live
        await refresh();
        await router.invalidate();
        navigate({ to: "/app" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        await refresh();
        await router.invalidate();
        navigate({ to: "/app" });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const signInGoogle = async () => {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}/app`,
      });
      if (result.error) throw result.error;
      if (!result.redirected) {
        await refresh();
        await router.invalidate();
        navigate({ to: "/app" });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google sign-in failed";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
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
            { k: "12", v: "Modules" },
            { k: "Real-time", v: "Database" },
            { k: "Secure", v: "RLS auth" },
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

          <h2 className="font-display text-3xl font-bold tracking-tight">
            {mode === "signin" ? t("welcome_back") : "Create your account"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signin" ? t("sign_in_to") : "First account becomes admin automatically."}
          </p>

          <div className="mt-6 inline-flex rounded-xl border border-border bg-surface p-1">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={
                "rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors " +
                (mode === "signin" ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground hover:text-foreground")
              }
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={
                "rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors " +
                (mode === "signup" ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground hover:text-foreground")
              }
            >
              Sign up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm outline-none transition-all focus:border-primary focus:shadow-soft"
                />
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("email")}</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="h-11 w-full rounded-xl border border-border bg-surface pl-9 pr-3.5 text-sm outline-none transition-all focus:border-primary focus:shadow-soft"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("password")}</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  className="h-11 w-full rounded-xl border border-border bg-surface pl-9 pr-3.5 text-sm outline-none transition-all focus:border-primary focus:shadow-soft"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl gradient-primary text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:shadow-glow disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{mode === "signin" ? t("sign_in") : "Create account"}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></>}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <button
            onClick={signInGoogle}
            disabled={busy}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-60"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            {mode === "signin" ? "New here? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="font-semibold text-primary hover:underline"
            >
              {mode === "signin" ? "Create an account" : "Sign in instead"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
