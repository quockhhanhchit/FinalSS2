import { RouterProvider } from "react-router";
import { router } from "./routes";
import { LanguageToggle } from "./components/LanguageToggle";
import { ThemeProvider } from "./ThemeContext";
import { LanguageProvider } from "./LanguageContext";

export function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <RouterProvider router={router} />
        <LanguageToggle />
      </ThemeProvider>
    </LanguageProvider>
  );
}
