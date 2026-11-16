import { test, expect } from "@playwright/test";

const PAGES = ["/", "/about", "/products", "/projects", "/gallery", "/clients", "/craftsmanship", "/contact", "/blog"];

for (const path of PAGES) {
  test(`public page ${path} loads without errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const res = await page.goto(path);
    expect(res!.status()).toBe(200);
    await expect(page.locator("h1").first()).toBeAttached();
    await expect(page).toHaveTitle(/.+/);
    expect(errors).toEqual([]);
  });
}

test("a project page opens from the projects list", async ({ page }) => {
  await page.goto("/projects");
  const href = await page.locator('a[href^="/projects/"]').first().getAttribute("href");
  const res = await page.goto(href!);
  expect(res!.status()).toBe(200);
});

/*
 * Unknown project / blog addresses. With Cache Components the page shell streams at once, so a
 * browser or Googlebot can get status 200 on the first visit — Next.js then adds a noindex tag and
 * shows the not-found page (see "The HTTP contract" in the Next.js streaming guide). Crawlers that
 * need full HTML up front (Bing, link previews) wait for the metadata and get a real 404.
 */
const stamp = Date.now();
for (const section of ["projects", "blog"]) {
  test(`unknown /${section}/ address: not-found page with noindex`, async ({ request }) => {
    const res = await request.get(`/${section}/missing-${stamp}`);
    expect([200, 404]).toContain(res.status());
    const html = await res.text();
    expect(html).toContain('<meta name="robots" content="noindex"/>');
  });

  test(`unknown /${section}/ address: real 404 for Bing`, async ({ request }) => {
    const res = await request.get(`/${section}/missing-bing-${stamp}`, { headers: { "user-agent": "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)" } });
    expect(res.status()).toBe(404);
  });
}

test("an unknown top-level address returns 404", async ({ request }) => {
  expect((await request.get(`/no-such-page-${stamp}`)).status()).toBe(404);
});
