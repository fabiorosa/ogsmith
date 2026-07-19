import { mkdir, readFile, writeFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { blogPost, render, themeNames } from "../src/index.js";

const UPDATE = process.env.UPDATE_SNAPSHOTS === "1";
const snapshotDir = new URL("./__snapshots__/", import.meta.url);

async function expectSvgSnapshot(name: string, svg: string): Promise<void> {
  const file = new URL(`${name}.svg`, snapshotDir);
  if (UPDATE) {
    await mkdir(snapshotDir, { recursive: true });
    await writeFile(file, svg);
    return;
  }
  const expected = await readFile(file, "utf8");
  expect(svg).toBe(expected);
}

describe("render: blog-post", () => {
  it("produces SVG at the template's size", async () => {
    const svg = await render(blogPost, blogPost.sample);
    expect(svg).toContain("<svg");
    expect(svg).toContain(`width="1200"`);
    expect(svg).toContain(`height="630"`);
  });

  it("rejects invalid props with a useful message", async () => {
    await expect(
      render(blogPost, { ...blogPost.sample, title: "" }),
    ).rejects.toThrow(/Title is required/);
  });

  it("is deterministic: same props, same bytes", async () => {
    const a = await render(blogPost, blogPost.sample);
    const b = await render(blogPost, blogPost.sample);
    expect(a).toBe(b);
  });

  it.each(themeNames)("matches the committed snapshot for theme %s", async (theme) => {
    const svg = await render(blogPost, blogPost.sample, { theme });
    await expectSvgSnapshot(`blog-post.${theme}`, svg);
  });
});
