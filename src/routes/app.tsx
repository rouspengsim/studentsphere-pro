import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Sidebar, MobileNav } from "@/components/app/sidebar";
import { Topbar } from "@/components/app/topbar";

export const Route = createFileRoute("/app")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("ums.user");
      if (!raw) {
        throw redirect({ to: "/" });
      }
    }
  },
  component: AppLayout,
});

function AppLayout() {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 px-4 py-6 pb-24 lg:px-8 lg:pb-8">
          <Outlet />
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
