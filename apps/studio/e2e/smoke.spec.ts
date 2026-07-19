import { expect, test } from "@playwright/test";

/**
 * The one end-to-end proof: open the studio, edit content, export a PNG,
 * and confirm the downloaded file is a real PNG at template dimensions.
 */
test("edit a template and export a PNG", async ({ page }) => {
  await page.goto("/");

  // Gallery shows real sample renders.
  await page.getByRole("button", { name: /blog post sample render/i }).click();

  // Edit the title; the live preview re-renders.
  const title = page.getByLabel("Title");
  await title.fill("Parity by construction");
  await expect(page.getByAltText("Blog post preview")).toBeVisible();

  // Export and inspect the download.
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export PNG" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("blog-post.png");

  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(chunk as Buffer);
  const png = Buffer.concat(chunks);

  // PNG signature and IHDR dimensions (1200x630).
  expect([...png.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
  expect(png.readUInt32BE(16)).toBe(1200);
  expect(png.readUInt32BE(20)).toBe(630);
});
