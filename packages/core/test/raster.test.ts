import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";
import { blogPost, render, themeNames } from "../src/index.js";
import { renderPng, svgToPng } from "../src/raster/node.js";
import {
  initWasmRaster,
  svgToPngWasm,
} from "../src/raster/wasm.js";

function sha256(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

/**
 * Committed PNG hashes: the determinism contract. If a change alters
 * render output, these fail and the change must be intentional (update
 * the hashes in the same commit, with the reason in the message).
 */
const EXPECTED_PNG_SHA256: Record<string, string> = {
  "blog-post.graphite":
    "6d0fc0f9079eca1c5e56f653071ef5e120923b417dea61785a7a22bf8c446a3d",
  "blog-post.paper":
    "1b4e2b23c50b68e70c5b748e88a4619d9789b4f71afbac5106bde11902e6d3bc",
  "blog-post.midnight":
    "421f599318ab0c5230c336f6cf4a09965b53c155c919a01211240aa7163225bd",
  "blog-post.sand":
    "3d79b0e243d9bf0e8f77ca4de7bbe21e0f8251a0cb91dee5ebd30a127ca978bc",
};

const UPDATE = process.env.UPDATE_HASHES === "1";

describe("raster: native", () => {
  it("produces a PNG at template dimensions", async () => {
    const png = await renderPng(blogPost, blogPost.sample);
    // PNG signature
    expect([...png.slice(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
    // IHDR width/height (big-endian at offsets 16/20)
    const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
    expect(view.getUint32(16)).toBe(1200);
    expect(view.getUint32(20)).toBe(630);
  });

  it("is deterministic across renders", async () => {
    const a = await renderPng(blogPost, blogPost.sample);
    const b = await renderPng(blogPost, blogPost.sample);
    expect(sha256(a)).toBe(sha256(b));
  });

  it.each(themeNames)("matches the committed hash for theme %s", async (theme) => {
    const png = await renderPng(blogPost, blogPost.sample, { theme });
    const key = `blog-post.${theme}`;
    const hash = sha256(png);
    if (UPDATE) {
      console.log(`  "${key}": "${hash}",`);
      return;
    }
    expect(hash).toBe(EXPECTED_PNG_SHA256[key]);
  });
});

describe("raster: wasm parity (the preview/export proof)", () => {
  it("wasm bytes are identical to native bytes", async () => {
    const require = createRequire(import.meta.url);
    const wasmPath = require.resolve("@resvg/resvg-wasm/index_bg.wasm");
    await initWasmRaster(await readFile(wasmPath));

    const svg = await render(blogPost, blogPost.sample);
    const native = await svgToPng(svg);
    const wasm = await svgToPngWasm(svg);
    expect(sha256(wasm)).toBe(sha256(native));
  });
});
