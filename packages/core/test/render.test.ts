import { describe, expect, it } from "vitest";
import { blogPost, render } from "../src/index.js";

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
});
