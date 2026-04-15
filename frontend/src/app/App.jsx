import { RouterProvider } from "react-router";
import { router } from "./routes";
import { LanguageToggle } from "./components/LanguageToggle";

export function App() {
  return (
    <>
      <RouterProvider router={router} />
      <LanguageToggle />
    </>
  );
}
