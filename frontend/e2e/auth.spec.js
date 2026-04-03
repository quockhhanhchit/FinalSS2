import { test, expect } from "@playwright/test";

test("shows an error when register form is submitted with weak data", async ({ page }) => {
  await page.goto("/register");

  await page.getByLabel("Full name").fill("A");
  await page.getByLabel("Email address").fill("bad-email");
  await page.getByLabel("Password").fill("123");
  await page.getByLabel("Confirm password").fill("321");
  await page.getByRole("button", { name: "Sign up" }).click();

  await expect(page.getByText(/Enter a valid email address|Passwords do not match|Password must/i)).toBeVisible();
});
