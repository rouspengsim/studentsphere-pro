import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "admin" | "teacher" | "student";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
};

const demoUsers: Record<Role, User> = {
  admin: { id: "u-admin", name: "Sokha Vong", email: "admin@educore.app", role: "admin" },
  teacher: { id: "u-teacher", name: "Dara Pich", email: "teacher@educore.app", role: "teacher" },
  student: { id: "u-student", name: "Lina Sok", email: "lina@educore.app", role: "student" },
};

type AuthCtx = {
  user: User | null;
  signIn: (role: Role) => void;
  signOut: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("ums.user") : null;
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        // ignore
      }
    }
  }, []);

  const signIn = (role: Role) => {
    const u = demoUsers[role];
    setUser(u);
    if (typeof window !== "undefined") localStorage.setItem("ums.user", JSON.stringify(u));
  };
  const signOut = () => {
    setUser(null);
    if (typeof window !== "undefined") localStorage.removeItem("ums.user");
  };

  return <Ctx.Provider value={{ user, signIn, signOut }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
