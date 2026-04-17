import { Link, Outlet, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Calendar,
  TrendingUp,
  Trophy,
  Settings,
  Activity,
  ChevronDown,
  LogOut,
  UserCircle,
  Menu,
} from "lucide-react";
import { ToastContainer } from "./ui/toast";
import { ThemeToggleBtn } from "./ThemeToggleBtn";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { clearAuthSession, getAuthSession } from "../lib/auth";
import { apiPost } from "../lib/api";
import { RouteTransition } from "./RouteTransition";
import { useLanguage } from "../LanguageContext";

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const session = getAuthSession();
  const { t } = useLanguage();

  const navigation = [
    { name: t("Tổng quan"), href: "/app", icon: LayoutDashboard },
    { name: t("Kế hoạch"), href: "/app/plan", icon: Calendar },
    { name: t("Theo dõi"), href: "/app/tracking", icon: TrendingUp },
    { name: t("Phần thưởng"), href: "/app/rewards", icon: Trophy },
    { name: t("Cài đặt"), href: "/app/settings", icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === "/app") {
      return location.pathname === "/app";
    }

    return location.pathname.startsWith(href);
  };

  const userName =
    session?.user?.fullName || session?.name || t("Người dùng BudgetFit");
  const userInitials = userName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogout = async () => {
    try {
      await apiPost("/api/auth/logout", {});
    } catch {
      // Client-side logout should still proceed if the server token is already invalid.
    } finally {
      clearAuthSession();
      navigate("/");
    }
  };

  const handleOpenSettings = () => {
    navigate("/app/settings");
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-lg">
        <div className="mx-auto max-w-[1440px] px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4 lg:gap-8">
              <Link to="/app" className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#22c55e] via-[#34d399] to-[#8b5cf6] shadow-lg">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div className="min-w-0">
                  <span className="bg-gradient-to-r from-[#16a34a] via-[#10b981] to-[#8b5cf6] bg-clip-text text-lg font-bold text-transparent sm:text-xl">
                    BudgetFit
                  </span>
                  <div className="-mt-0.5 hidden text-xs text-muted-foreground sm:block">
                    {t("Sức khỏe và ngân sách")}
                  </div>
                </div>
              </Link>

              <div className="hidden gap-1 lg:flex">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-medium transition-all ${
                        active
                          ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-4">
              <ThemeToggleBtn />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-foreground shadow-sm transition-colors hover:bg-secondary outline-none lg:hidden">
                    <Menu className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56">
                  {navigation.map((item) => {
                    const Icon = item.icon;

                    return (
                      <DropdownMenuItem
                        key={item.href}
                        onClick={() => navigate(item.href)}
                        className="cursor-pointer"
                      >
                        <Icon className="h-4 w-4" />
                        {item.name}
                      </DropdownMenuItem>
                    );
                  })}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleOpenSettings}
                    className="cursor-pointer"
                  >
                    <UserCircle className="h-4 w-4" />
                    {t("Cài đặt")}
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                    {t("Đăng xuất")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hidden items-center gap-2 rounded-xl px-3 py-2 outline-none transition-colors hover:bg-secondary sm:flex">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 text-white shadow-md">
                      {userInitials}
                    </div>
                    <span className="max-w-[160px] truncate text-sm font-medium">
                      {userName}
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={handleOpenSettings}
                    className="cursor-pointer"
                  >
                    <UserCircle className="h-4 w-4" />
                    {t("Cài đặt")}
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                    {t("Đăng xuất")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-[1440px] overflow-x-hidden px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        <RouteTransition mode="shell">
          <Outlet />
        </RouteTransition>
      </main>

      <ToastContainer />
    </div>
  );
}
