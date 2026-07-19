import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";
import { blogPost, listTemplates, render, themeNames } from "../src/index.js";
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
  "product-launch.graphite":
    "38f3de77c2ccdde991a59a4b0dfadec476a580510a57e46aed2e2abb97ed0852",
  "product-launch.paper":
    "b940dc9d0af893402d613414ccc1d359b5d5566d7e257991d6309d25a6d36fb0",
  "product-launch.midnight":
    "8744941874c697b845d3138930620f7d1bd73837509e8519541966a83ed57724",
  "product-launch.sand":
    "beda9341f23b865f478d799ec331334b801173f20f403c8f51ac5d666d75ffcf",
  "release-banner.graphite":
    "b506a65d5da79424667aa02f27ee37028ebd8be7ed8ca7d9d8e021b888d631ed",
  "release-banner.paper":
    "ecf3f3d6e1eabf600755f2df6721187cdaad3b217b163e518d088eb3e3d21068",
  "release-banner.midnight":
    "43b6bd5dd75e5292bab8c7a6df0b4431a69f346d7a4724a2e287f56e2b9b08fa",
  "release-banner.sand":
    "3d521b3a2a2cc84b36107d030790893c0633df408d7c15feed2b490a0ab6ce4e",
  "quote-card.graphite":
    "14d05191f23e171bb854941fcb5a67749db06f01c15b1822644cac9ea1567f10",
  "quote-card.paper":
    "6d2061477c9395be79711558d76708f78527f057bd8f0ac851ed45c946d6f4fe",
  "quote-card.midnight":
    "126ee3a5ffde28dcf0af2c1b573cdb1b7347d875ce46d1171af88416fa43be47",
  "quote-card.sand":
    "d1800db2704981132af1c0b0097fba212334a2fee959e8aadea7cf73641ba7d7",
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

  const matrix = listTemplates().flatMap((template) =>
    themeNames.map((theme) => ({ template, theme })),
  );

  it.each(matrix)(
    "$template.id on $theme matches the committed hash",
    async ({ template, theme }) => {
      const png = await renderPng(template, template.sample, { theme });
      const key = `${template.id}.${theme}`;
      const hash = sha256(png);
      if (UPDATE) {
        console.log(`  "${key}": "${hash}",`);
        return;
      }
      expect(hash).toBe(EXPECTED_PNG_SHA256[key]);
    },
  );
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
