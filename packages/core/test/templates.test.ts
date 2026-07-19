import { mkdir, readFile, writeFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { parseHighlights } from "../src/templates/release-banner.js";
import {
  contrastRatio,
  AA_LARGE,
  AA_NORMAL,
  listTemplates,
  productLaunch,
  render,
  themeNames,
  themes,
} from "../src/index.js";

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

const matrix = listTemplates().flatMap((template) =>
  themeNames.map((theme) => ({ template, theme })),
);

describe("template matrix: snapshots", () => {
  it.each(matrix)(
    "$template.id on $theme matches the committed snapshot",
    async ({ template, theme }) => {
      const svg = await render(template, template.sample, { theme });
      await expectSvgSnapshot(`${template.id}.${theme}`, svg);
    },
  );
});

describe("template matrix: contract", () => {
  it.each(listTemplates())("$id: sample passes its own schema", (template) => {
    expect(() => template.schema.parse(template.sample)).not.toThrow();
  });

  it.each(listTemplates())("$id: every field has UI metadata", (template) => {
    for (const key of Object.keys(template.sample)) {
      const meta = template.fields[key];
      expect(meta, `missing field meta for ${template.id}.${key}`).toBeDefined();
      expect(meta?.label.length).toBeGreaterThan(0);
    }
  });
});

describe("template matrix: theme contrast in use", () => {
  // Templates draw ink/inkDim on bg and surface, and accentInk on accent.
  // The theme test suite covers tokens; this asserts the pairs templates
  // actually rely on, so a future template cannot silently use a low
  // contrast combination.
  it.each(themeNames)("%s keeps every used pair at AA", (name) => {
    const t = themes[name].tokens;
    expect(contrastRatio(t.ink, t.bg)).toBeGreaterThanOrEqual(AA_NORMAL);
    expect(contrastRatio(t.ink, t.surface)).toBeGreaterThanOrEqual(AA_NORMAL);
    expect(contrastRatio(t.inkDim, t.bg)).toBeGreaterThanOrEqual(AA_NORMAL);
    expect(contrastRatio(t.inkDim, t.surface)).toBeGreaterThanOrEqual(AA_NORMAL);
    expect(contrastRatio(t.accentInk, t.accent)).toBeGreaterThanOrEqual(AA_NORMAL);
    // Accent as display text on both grounds (release-banner version).
    expect(contrastRatio(t.accent, t.bg)).toBeGreaterThanOrEqual(AA_LARGE);
    expect(contrastRatio(t.accent, t.surface)).toBeGreaterThanOrEqual(AA_LARGE);
  });
});

describe("template validation specifics", () => {
  it("product-launch rejects a non data URI logo", () => {
    expect(() =>
      productLaunch.schema.parse({
        ...productLaunch.sample,
        logo: "https://example.com/logo.png",
      }),
    ).toThrow(/data URI/);
  });

  it("product-launch accepts an empty logo", () => {
    expect(() =>
      productLaunch.schema.parse({ ...productLaunch.sample, logo: "" }),
    ).not.toThrow();
  });

  it("product-launch renders an embedded data URI logo", async () => {
    // 1x1 opaque PNG.
    const logo =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNiYGBgAAAABgADNjd8qAAAAABJRU5ErkJggg==";
    const svg = await render(productLaunch, { ...productLaunch.sample, logo });
    expect(svg).toContain("<image");
    expect(svg).toContain("data:image/png;base64");
  });

  it("release-banner keeps at most three highlights", () => {
    expect(parseHighlights("one\ntwo\nthree\nfour\nfive")).toEqual([
      "one",
      "two",
      "three",
    ]);
    expect(parseHighlights("  spaced  \n\n\nkept")).toEqual(["spaced", "kept"]);
    expect(parseHighlights("")).toEqual([]);
  });
});
