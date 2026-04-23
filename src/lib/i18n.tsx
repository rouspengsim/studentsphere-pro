import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "km";

type Dict = Record<string, { en: string; km: string }>;

const dict: Dict = {
  app_name: { en: "EduCore UMS", km: "ប្រព័ន្ធគ្រប់គ្រងសាលា" },
  search_placeholder: { en: "Search students, classes, payments…", km: "ស្វែងរកសិស្ស ថ្នាក់ ការទូទាត់…" },

  // Nav
  dashboard: { en: "Dashboard", km: "ផ្ទាំងគ្រប់គ្រង" },
  students: { en: "Students", km: "សិស្ស" },
  teachers: { en: "Teachers", km: "គ្រូបង្រៀន" },
  classes: { en: "Classes", km: "ថ្នាក់រៀន" },
  attendance: { en: "Attendance", km: "វត្តមាន" },
  exams: { en: "Exams & Scores", km: "ការប្រឡង" },
  timetable: { en: "Timetable", km: "កាលវិភាគ" },
  payments: { en: "Payments", km: "ការទូទាត់" },
  reports: { en: "Reports", km: "របាយការណ៍" },
  notifications: { en: "Notifications", km: "ការជូនដំណឹង" },
  roles: { en: "Roles", km: "តួនាទី" },
  certificates: { en: "Certificates", km: "សញ្ញាបត្រ" },
  settings: { en: "Settings", km: "ការកំណត់" },

  // Common
  add: { en: "Add", km: "បន្ថែម" },
  edit: { en: "Edit", km: "កែប្រែ" },
  delete: { en: "Delete", km: "លុប" },
  view: { en: "View", km: "មើល" },
  save: { en: "Save", km: "រក្សាទុក" },
  cancel: { en: "Cancel", km: "បោះបង់" },
  export: { en: "Export", km: "នាំចេញ" },
  filter: { en: "Filter", km: "តម្រង" },
  all: { en: "All", km: "ទាំងអស់" },
  total: { en: "Total", km: "សរុប" },
  active: { en: "Active", km: "សកម្ម" },
  paid: { en: "Paid", km: "បានបង់" },
  unpaid: { en: "Unpaid", km: "មិនទាន់បង់" },
  overdue: { en: "Overdue", km: "ហួសកាល" },
  present: { en: "Present", km: "មាន" },
  absent: { en: "Absent", km: "អវត្តមាន" },
  late: { en: "Late", km: "យឺត" },

  // Login
  welcome_back: { en: "Welcome back", km: "សូមស្វាគមន៍" },
  sign_in_to: { en: "Sign in to your account", km: "ចូលគណនីរបស់អ្នក" },
  email: { en: "Email", km: "អ៊ីមែល" },
  password: { en: "Password", km: "ពាក្យសម្ងាត់" },
  sign_in: { en: "Sign in", km: "ចូល" },
  continue_as: { en: "Or quick sign in as", km: "ឬចូលរហ័សជា" },
  admin: { en: "Admin", km: "អ្នកគ្រប់គ្រង" },
  teacher: { en: "Teacher", km: "គ្រូ" },
  student: { en: "Student", km: "សិស្ស" },
  sign_out: { en: "Sign out", km: "ចាកចេញ" },

  // Dashboard
  good_morning: { en: "Good morning", km: "អរុណសួស្តី" },
  total_students: { en: "Total Students", km: "សិស្សសរុប" },
  total_teachers: { en: "Total Teachers", km: "គ្រូសរុប" },
  active_classes: { en: "Active Classes", km: "ថ្នាក់សកម្ម" },
  revenue: { en: "Revenue", km: "ចំណូល" },
  attendance_today: { en: "Attendance today", km: "វត្តមានថ្ងៃនេះ" },
  recent_activity: { en: "Recent activity", km: "សកម្មភាពថ្មីៗ" },
  upcoming: { en: "Upcoming", km: "ជិតមកដល់" },
};

export function t(key: keyof typeof dict | string, lang: Lang): string {
  const entry = dict[key as keyof typeof dict];
  if (!entry) return key;
  return entry[lang];
}

type LangCtx = { lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string };
const Ctx = createContext<LangCtx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("ums.lang")) as Lang | null;
    if (saved === "en" || saved === "km") setLangState(saved);
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("ums.lang", l);
  };

  return (
    <Ctx.Provider value={{ lang, setLang, t: (k) => t(k, lang) }}>{children}</Ctx.Provider>
  );
}

export function useI18n() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useI18n must be used within I18nProvider");
  return c;
}
