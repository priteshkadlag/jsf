import { test, expect, type Page, type Locator } from "@playwright/test";

const open = async (page: Page, section: string) => {
  await page.goto(`/admin?section=${section}`);
  await expect(page.getByRole("navigation", { name: "Admin sections" })).toBeVisible();
};

const save = async (page: Page) => {
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Saved at" })).toBeVisible();
};

/** A real mouse drag: press, move in steps (dnd-kit needs > 4px of movement), release. */
const drag = async (page: Page, from: Locator, to: Locator) => {
  // Bring it to the middle of the screen, clear of the fixed save bar at the bottom.
  await from.evaluate((el) => el.scrollIntoView({ block: "center" }));
  const a = (await from.boundingBox())!;
  const b = (await to.boundingBox())!;
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(a.x + a.width / 2 + 10, a.y + a.height / 2 + 10, { steps: 5 });
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 15 });
  await page.mouse.up();
};

const photo = (page: Page, n: number) => page.getByRole("button", { name: new RegExp(`^Photo ${n}(,| —)`) });
const photoSrc = (page: Page, n: number) => photo(page, n).locator("img").getAttribute("src");
/** The logo list is the first sortable list on the Clients screen (a partner can share a name). */
const clientHandle = (page: Page, name: string) => page.getByRole("main").getByRole("list").first().getByRole("button", { name: `Drag to reorder ${name}` });

test("site info: a phone number change shows on the contact page", async ({ page }) => {
  await open(page, "settings");
  const phone = page.getByLabel("Phone (as displayed)");
  await phone.fill("+91 90000 12345");
  await expect(page.getByRole("status")).toHaveText("Unsaved changes");
  await save(page);

  await page.goto("/contact");
  await expect(page.getByText("+91 90000 12345").first()).toBeVisible();
});

test("theme: a new background colour reaches the public site", async ({ page }) => {
  await open(page, "theme");
  const hex = page.getByRole("textbox", { name: "Page background", exact: true });
  await hex.fill("#123456");
  await save(page);

  const res = await page.goto("/");
  expect(await res!.text()).toContain("--color-ivory:#123456");
});

test("gallery: dragging a photo changes the order, and it is kept after saving", async ({ page }) => {
  await open(page, "gallery");
  const first = await photoSrc(page, 1);
  const second = await photoSrc(page, 2);
  expect(first).not.toBe(second);

  await drag(page, photo(page, 1), photo(page, 2));
  await expect.poll(() => photoSrc(page, 1)).toBe(second);
  expect(await photoSrc(page, 2)).toBe(first);
  await save(page);

  await page.reload();
  expect(await photoSrc(page, 1)).toBe(second);
  expect(await photoSrc(page, 2)).toBe(first);
});

test("gallery: ⤒ moves a photo to the start", async ({ page }) => {
  await open(page, "gallery");
  const fifth = await photoSrc(page, 5);
  await page.getByRole("listitem").filter({ has: photo(page, 5) }).getByTitle("Move to the start of the gallery").click();
  expect(await photoSrc(page, 1)).toBe(fifth);
});

test("clients: keyboard reordering (Space, arrow, Space) swaps two logos", async ({ page }) => {
  await open(page, "clients");
  const names = page.getByLabel("Client name");
  const a = await names.nth(0).inputValue();
  const b = await names.nth(1).inputValue();

  const handle = clientHandle(page, a);
  await handle.focus();
  // Wait for each step like a person would: the drag animates between key presses.
  await page.keyboard.press("Space");
  await expect(page.locator("li.ring-emerald-500")).toHaveCount(1);
  await page.keyboard.press("ArrowRight");
  await expect(page.getByText("was moved over droppable area 1")).toBeAttached();
  await page.waitForTimeout(300);
  await page.keyboard.press("Space");

  await expect(names.nth(0)).toHaveValue(b);
  await expect(names.nth(1)).toHaveValue(a);
  await save(page);
});

test("clients: dragging with the mouse handle reorders", async ({ page }) => {
  await open(page, "clients");
  const names = page.getByLabel("Client name");
  const a = await names.nth(0).inputValue();
  const c = await names.nth(2).inputValue();
  await drag(page, clientHandle(page, a), clientHandle(page, c));
  await expect(names.nth(2)).toHaveValue(a);
});

test("projects: sidebar drag-and-drop and move to top", async ({ page }) => {
  await open(page, "projects");
  await expect(page.getByRole("button", { name: /^Drag to reorder / }).first()).toBeVisible();
  const handles = page.getByRole("button", { name: /^Drag to reorder / });
  const firstName = (await handles.nth(0).getAttribute("aria-label"))!;
  const secondName = (await handles.nth(1).getAttribute("aria-label"))!;
  await drag(page, handles.nth(0), handles.nth(1));
  await expect(handles.nth(0)).toHaveAttribute("aria-label", secondName);
  await expect(handles.nth(1)).toHaveAttribute("aria-label", firstName);
});

test("media library: uploading an image adds it to the library", async ({ page }) => {
  await open(page, "media");
  // A small real PNG drawn in the browser, so the upload goes through compression like a real photo.
  const png = await page.evaluate(() => {
    const c = document.createElement("canvas");
    c.width = 320;
    c.height = 200;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#30463a";
    ctx.fillRect(0, 0, 320, 200);
    ctx.fillStyle = "#b4935a";
    ctx.fillRect(40, 40, 120, 80);
    return c.toDataURL("image/png").split(",")[1];
  });
  const upload = page.waitForResponse((r) => r.url().includes("/api/admin/media") && r.request().method() === "POST");
  await page.locator('input[type="file"]').first().setInputFiles({ name: "e2e-test.png", mimeType: "image/png", buffer: Buffer.from(png, "base64") });
  const res = await upload;
  expect(res.status()).toBe(200);
  const { url } = (await res.json()) as { url: string };
  expect(url).toContain("e2e-test");

  // The file is served back.
  const file = await page.request.get(url);
  expect(file.status()).toBe(200);
  expect(file.headers()["content-type"]).toMatch(/^image\//);
});

test("unsaved changes show a dot and can be discarded", async ({ page }) => {
  await open(page, "settings");
  const name = page.getByLabel("Tagline");
  const before = await name.inputValue();
  await name.fill("Temporary tagline");
  await expect(page.getByRole("navigation", { name: "Admin sections" }).getByLabel("Unsaved changes")).toBeVisible();

  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Discard changes" }).click();
  await expect(name).toHaveValue(before);
  await expect(page.getByRole("status")).toHaveText("All changes saved");
});

test("signed-out visitors cannot use the media API", async ({ browser }) => {
  const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } });
  const res = await ctx.request.get("/api/admin/media");
  expect(res.status()).toBe(401);
  await ctx.close();
});

test("media library: lists website photos with usage, and removes one from the site", async ({ page }) => {
  await open(page, "media");
  await page.getByRole("button", { name: /^Website photos/ }).click();
  await page.getByLabel("Search images").fill("projects/amora/03");
  const card = page.getByRole("listitem").filter({ hasText: "projects/amora/03" }).first();
  await expect(card.getByRole("button", { name: /Project: Amora/ })).toBeVisible();

  page.once("dialog", (d) => d.accept());
  await card.getByRole("button", { name: "Remove from site" }).click();
  await expect(card.getByText("Not used on the site")).toBeVisible();
  await save(page);

  // The photo is gone from the public Amora page.
  const html = await (await page.request.get("/projects/amora")).text();
  expect(html).not.toContain("projects%2Famora%2F03.webp");
  expect(html).toContain("projects%2Famora%2F02.webp");
});

test("media library: flags low-resolution photos", async ({ page }) => {
  await open(page, "media");
  await page.getByRole("button", { name: /^Low resolution, in use/ }).click();
  await expect(page.getByText("Low resolution", { exact: true }).first()).toBeVisible();
});
