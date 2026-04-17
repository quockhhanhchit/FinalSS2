import { Languages } from "lucide-react";
import { useLanguage } from "../LanguageContext";

const LANGUAGES = [
  { value: "vi", shortLabel: "VI", label: "Tiếng Việt" },
  { value: "en", shortLabel: "EN", label: "English" },
];

export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="fixed bottom-5 right-5 z-[100] rounded-2xl border border-border bg-card/95 p-2 shadow-xl backdrop-blur">
      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-2 px-2 text-sm font-medium text-muted-foreground sm:flex">
          <Languages className="h-4 w-4" />
          {t("Ngôn ngữ")}
        </div>
        <div className="flex rounded-xl bg-secondary p-1" data-no-translate>
          {LANGUAGES.map((item) => {
            const isActive = language === item.value;

            return (
              <button
                key={item.value}
                type="button"
                aria-pressed={isActive}
                aria-label={`${t("Ngôn ngữ")}: ${item.label}`}
                onClick={() => setLanguage(item.value)}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title={item.label}
              >
                {item.shortLabel}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
