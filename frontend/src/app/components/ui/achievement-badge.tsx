import { ReactNode } from "react";
import { Trophy, Flame, Star, Target, Award, Zap } from "lucide-react";

interface AchievementBadgeProps {
  type: "streak" | "weight" | "budget" | "complete" | "milestone" | "special";
  level?: number;
  title: string;
  description?: string;
  earned?: boolean;
  size?: "sm" | "md" | "lg";
}

export function AchievementBadge({
  type,
  level,
  title,
  description,
  earned = true,
  size = "md",
}: AchievementBadgeProps) {
  const icons: Record<string, ReactNode> = {
    streak: <Flame className={size === "sm" ? "w-5 h-5" : size === "lg" ? "w-8 h-8" : "w-6 h-6"} />,
    weight: <Target className={size === "sm" ? "w-5 h-5" : size === "lg" ? "w-8 h-8" : "w-6 h-6"} />,
    budget: <Award className={size === "sm" ? "w-5 h-5" : size === "lg" ? "w-8 h-8" : "w-6 h-6"} />,
    complete: <Trophy className={size === "sm" ? "w-5 h-5" : size === "lg" ? "w-8 h-8" : "w-6 h-6"} />,
    milestone: <Star className={size === "sm" ? "w-5 h-5" : size === "lg" ? "w-8 h-8" : "w-6 h-6"} />,
    special: <Zap className={size === "sm" ? "w-5 h-5" : size === "lg" ? "w-8 h-8" : "w-6 h-6"} />,
  };

  const colors = {
    streak: "from-orange-400 to-red-500",
    weight: "from-green-400 to-emerald-500",
    budget: "from-purple-400 to-purple-600",
    complete: "from-yellow-400 to-amber-500",
    milestone: "from-blue-400 to-cyan-500",
    special: "from-pink-400 to-rose-500",
  };

  const sizes = {
    sm: "w-16 h-16",
    md: "w-20 h-20",
    lg: "w-28 h-28",
  };

  return (
    <div className={`flex flex-col items-center gap-2 ${!earned ? "opacity-40 grayscale" : ""}`}>
      <div
        className={`relative ${sizes[size]} rounded-2xl bg-gradient-to-br ${colors[type]} flex items-center justify-center text-white shadow-lg ${
          earned ? "animate-in zoom-in" : ""
        }`}
      >
        {icons[type]}
        {level && (
          <span className="absolute bottom-1 right-1 w-6 h-6 bg-white text-xs font-bold rounded-full flex items-center justify-center text-gray-800">
            {level}
          </span>
        )}
      </div>
      <div className="text-center">
        <div className={`font-semibold ${size === "sm" ? "text-xs" : "text-sm"}`}>
          {title}
        </div>
        {description && <div className="text-xs text-muted-foreground mt-0.5">{description}</div>}
      </div>
    </div>
  );
}