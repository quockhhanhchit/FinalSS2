import { RouterProvider } from "react-router";
import { router } from "./routes";
import { LanguageToggle } from "./components/LanguageToggle";
import { ThemeProvider } from "./ThemeContext";

export function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
      <LanguageToggle />
    </ThemeProvider>
  );
}
