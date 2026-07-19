import { describe, expect, it } from "vitest";
import {
  AA_NORMAL,
  contrastRatio,
  hexToRgb,
  meetsAA,
} from "../src/theme/contrast.js";
import { themeNames, themes } from "../src/theme/tokens.js";

const REQUIRED_TOKENS = [
  "bg",
  "surface",
  "border",
  "ink",
  "inkDim",
  "accent",
  "accentInk",
] as const;

describe("theme structure", () => {
  it.each(themeNames)("theme %s provides the full token set", (name) => {
    const theme = themes[name];
    for (const token of REQUIRED_TOKENS) {
      const value = theme.tokens[token];
      expect(value).toMatch(/^#[0-9a-f]{6}$/);
    }
    expect(theme.name).toBe(name);
    expect(["dark", "light"]).toContain(theme.mode);
  });
});

describe("theme contrast (WCAG AA)", () => {
  it.each(themeNames)("%s: ink on bg and surface", (name) => {
    const { tokens } = themes[name];
    expect(contrastRatio(tokens.ink, tokens.bg)).toBeGreaterThanOrEqual(
      AA_NORMAL,
    );
    expect(contrastRatio(tokens.ink, tokens.surface)).toBeGreaterThanOrEqual(
      AA_NORMAL,
    );
  });

  it.each(themeNames)("%s: dim ink stays readable on bg and surface", (name) => {
    const { tokens } = themes[name];
    expect(contrastRatio(tokens.inkDim, tokens.bg)).toBeGreaterThanOrEqual(
      AA_NORMAL,
    );
    expect(contrastRatio(tokens.inkDim, tokens.surface)).toBeGreaterThanOrEqual(
      AA_NORMAL,
    );
  });

  it.each(themeNames)("%s: accent ink on accent", (name) => {
    const { tokens } = themes[name];
    expect(contrastRatio(tokens.accentInk, tokens.accent)).toBeGreaterThanOrEqual(
      AA_NORMAL,
    );
  });
});

describe("contrast utility", () => {
  it("parses hex and computes known ratios", () => {
    expect(hexToRgb("#ffffff")).toEqual([255, 255, 255]);
    expect(contrastRatio("#ffffff", "#000000")).toBeCloseTo(21, 5);
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
  });

  it("rejects malformed colors", () => {
    expect(() => hexToRgb("fff")).toThrow(/6-digit hex/);
    expect(() => hexToRgb("#12345g")).toThrow(/6-digit hex/);
  });

  it("meetsAA matches the ratio threshold", () => {
    expect(meetsAA("#ffffff", "#000000")).toBe(true);
    expect(meetsAA("#777777", "#888888")).toBe(false);
  });
});
