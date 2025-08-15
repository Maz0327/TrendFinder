import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      className={`frost-card frost-hover px-4 py-2.5 flex items-center gap-2 text-ink ${className}`}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun size={16} className="text-ink" /> : <Moon size={16} className="text-ink" />}
      <span className="text-sm font-medium text-ink">{theme === "dark" ? "Light" : "Dark"}</span>
    </button>
  );
}