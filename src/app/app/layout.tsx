"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Database, LogOut, Menu, Moon, Sun, UserCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { tableConfigs } from "@/lib/tables";
import { appTheme } from "@/lib/theme-config";
import { useThemeMode } from "@/components/theme-provider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { mode, toggleMode } = useThemeMode();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name?: string; email?: string } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("generated_app_user");
    if (!storedUser) return;
    try {
      setCurrentUser(JSON.parse(storedUser));
    } catch {
      setCurrentUser(null);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("generated_app_token");
    localStorage.removeItem("generated_app_user");
    router.push("/login");
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ backgroundColor: appTheme.colors.primary }}>
          <Database className="h-5 w-5" />
        </div>
        <div>
          <p className="font-bold">{appTheme.appName}</p>
          <p className="text-xs text-slate-500">Admin gerado</p>
        </div>
      </div>

      <nav className="space-y-1">
        <Link onClick={() => setSidebarOpen(false)} href="/app/dashboard" className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold ${pathname.includes("/dashboard") ? "bg-slate-100 dark:bg-slate-900" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900"}`}>
          <BarChart3 className="h-4 w-4" /> Dashboard
        </Link>
        {tableConfigs.map((table) => (
          <Link key={table.name} onClick={() => setSidebarOpen(false)} href={table.route} className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold ${pathname === table.route ? "bg-slate-100 dark:bg-slate-900" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900"}`}>
            <Database className="h-4 w-4" /> {table.label}
          </Link>
        ))}
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#070a13] dark:text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950 lg:block">
        {sidebar}
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} aria-label="Fechar menu" />
          <aside className="relative h-full w-[82vw] max-w-sm border-r border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
            <button onClick={() => setSidebarOpen(false)} className="absolute right-4 top-4 rounded-xl border border-slate-200 p-2 dark:border-slate-800" aria-label="Fechar menu">
              <X className="h-4 w-4" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="rounded-xl border border-slate-200 p-2 dark:border-slate-800 lg:hidden" aria-label="Abrir menu">
              <Menu className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{appTheme.projectDescription}</p>
              <p className="truncate text-xs text-slate-500">{appTheme.appName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {currentUser && (
              <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex">
                <UserCircle className="h-4 w-4 text-slate-400" />
                <div className="min-w-0 text-right">
                  <p className="max-w-[160px] truncate text-xs font-bold">{currentUser.name || currentUser.email || "Usuario"}</p>
                  {currentUser.email && <p className="max-w-[160px] truncate text-[10px] text-slate-500">{currentUser.email}</p>}
                </div>
              </div>
            )}
            <button onClick={toggleMode} className="rounded-xl border border-slate-200 p-2 dark:border-slate-800">
              {mode === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button onClick={logout} className="rounded-xl border border-slate-200 p-2 text-red-500 dark:border-slate-800">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
