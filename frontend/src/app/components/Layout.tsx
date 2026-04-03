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
} from "lucide-react";
import { ToastContainer } from "./ui/toast";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { clearAuthSession, getAuthSession } from "../lib/auth";
import { apiPost } from "../lib/api";

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const session = getAuthSession();

  const navigation = [
    { name: "Dashboard", href: "/app", icon: LayoutDashboard },
    { name: "Plan", href: "/app/plan", icon: Calendar },
    { name: "Tracking", href: "/app/tracking", icon: TrendingUp },
    { name: "Rewards", href: "/app/rewards", icon: Trophy },
    { name: "Settings", href: "/app/settings", icon: Settings },
  ];

  const isActive = (href) => {
    if (href === "/app") {
      return location.pathname === "/app";
    }
    return location.pathname.startsWith(href);
  };

  const userName = session?.user?.fullName || session?.name || "BudgetFit User";
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
      <nav className="bg-card border-b border-border sticky top-0 z-40 backdrop-blur-lg bg-card/80">
        <div className="max-w-[1440px] mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link to="/app" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#22c55e] via-[#34d399] to-[#8b5cf6] rounded-xl flex items-center justify-center shadow-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold bg-gradient-to-r from-[#16a34a] via-[#10b981] to-[#8b5cf6] bg-clip-text text-transparent">
                    BudgetFit
                  </span>
                  <div className="text-xs text-muted-foreground -mt-0.5">
                    Health & Budget Planner
                  </div>
                </div>
              </Link>

              <div className="flex gap-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`px-4 py-2.5 rounded-xl flex items-center gap-2 font-medium transition-all ${
                        active
                          ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-secondary transition-colors outline-none">
                    <div className="w-9 h-9 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center text-white font-semibold shadow-md">
                      {userInitials}
                    </div>
                    <span className="text-sm font-medium">{userName}</span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={handleOpenSettings}
                    className="cursor-pointer"
                  >
                    <UserCircle className="w-4 h-4" />
                    Settings
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-[1440px] mx-auto px-8 py-8">
        <Outlet />
      </main>

      <ToastContainer />
    </div>
  );
}
