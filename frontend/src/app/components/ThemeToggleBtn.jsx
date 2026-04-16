import { Moon, Sun } from "lucide-react";
import { useTheme } from "../ThemeContext";

export function ThemeToggleBtn() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
      title={isDark ? "Chế độ sáng" : "Chế độ tối"}
      className="group relative inline-flex h-10 w-[78px] items-center rounded-full border border-border bg-secondary/80 p-1 shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md dark:bg-slate-900/90"
    >
      <span
        className={`absolute left-1 top-1 h-8 w-8 rounded-full bg-gradient-to-br shadow-lg transition-transform duration-300 ${
          isDark
            ? "translate-x-9 from-indigo-500 to-violet-500"
            : "translate-x-0 from-amber-300 to-orange-400"
        }`}
      />

      <span className="relative z-10 grid w-8 place-items-center">
        <Sun
          className={`h-4 w-4 transition-all duration-300 ${
            isDark ? "scale-75 text-slate-500" : "scale-100 text-white"
          }`}
        />
      </span>

      <span className="relative z-10 grid w-8 place-items-center">
        <Moon
          className={`h-4 w-4 transition-all duration-300 ${
            isDark ? "scale-100 text-white" : "scale-75 text-slate-400"
          }`}
        />
      </span>
    </button>
  );
}
