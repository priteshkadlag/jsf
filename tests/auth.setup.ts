import { test as setup, expect } from "@playwright/test";
import { E2E_PASSWORD } from "../playwright.config";

setup("a wrong password is refused, the right one signs in", async ({ page }) => {
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Sign in to the admin" })).toBeVisible();

  await page.getByLabel("Password").fill("not-the-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("alert")).toBeVisible();

  await page.getByLabel("Password").fill(E2E_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("navigation", { name: "Admin sections" })).toBeVisible();

  await page.context().storageState({ path: "tests/.auth/admin.json" });
});
