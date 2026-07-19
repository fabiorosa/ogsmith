import { describe, expect, it } from "vitest";
import {
  builtinFontSpecs,
  createFontSet,
  loadBuiltinFonts,
} from "../src/engine/fonts.js";

describe("bundled fonts", () => {
  it("loads every builtin font from disk with non-empty bytes", async () => {
    const fonts = await loadBuiltinFonts();
    expect(fonts).toHaveLength(builtinFontSpecs.length);
    for (const font of fonts) {
      expect(font.data.byteLength).toBeGreaterThan(10_000);
    }
  });

  it("caches bytes across loads (same buffers, no re-read)", async () => {
    const first = await loadBuiltinFonts();
    const second = await loadBuiltinFonts();
    expect(second).toBe(first);
  });

  it("rejects an incomplete byte map", () => {
    const bytes = new Map<string, ArrayBuffer>([
      ["Inter-Regular.ttf", new ArrayBuffer(8)],
    ]);
    expect(() => createFontSet(bytes)).toThrow(/Missing font data/);
  });
});
