import { useEffect, useState } from "react";
import { Languages } from "lucide-react";

const STORAGE_KEY = "budgetfit-language";
const LANGUAGES = [
  { value: "en", shortLabel: "EN", label: "English" },
  { value: "vi", shortLabel: "VI", label: "Tiếng Việt" },
];

function getInitialLanguage() {
  const savedLanguage = window.localStorage.getItem(STORAGE_KEY);

  if (savedLanguage === "vi" || savedLanguage === "en") {
    return savedLanguage;
  }

  return "en";
}

export function LanguageToggle() {
  const [language, setLanguage] = useState(getInitialLanguage);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
    window.dispatchEvent(
      new CustomEvent("budgetfit:language-change", {
        detail: { language },
      }),
    );
  }, [language]);

  return (
    <div className="fixed bottom-5 right-5 z-[100] rounded-2xl border border-border bg-card/95 p-2 shadow-xl backdrop-blur">
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 px-2 text-sm font-medium text-muted-foreground">
          <Languages className="w-4 h-4" />
          Language
        </div>
        <div className="flex rounded-xl bg-secondary p-1">
          {LANGUAGES.map((item) => {
            const isActive = language === item.value;

            return (
              <button
                key={item.value}
                type="button"
                aria-pressed={isActive}
                aria-label={`Switch language to ${item.label}`}
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
