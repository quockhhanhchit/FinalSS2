import { RouterProvider } from "react-router";
import { router } from "./routes";
import { LanguageToggle } from "./components/LanguageToggle";
import { LanguageProvider } from "./LanguageContext";

export function App() {
  return (
    <LanguageProvider>
      <RouterProvider router={router} />
      <LanguageToggle />
    </LanguageProvider>
  );
}
