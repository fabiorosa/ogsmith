/**
 * Bundled font handling.
 *
 * Determinism rule ADR-006: the engine only ever renders with the font
 * binaries committed to this package. No system fonts, no network fetches.
 *
 * Node loads the files from disk. Browser/worker consumers fetch the same
 * files (shipped with the package) and hand the bytes to `createFontSet`.
 */

export interface FontSpec {
  /** Family name as referenced by templates. */
  readonly family: "Inter" | "JetBrains Mono";
  readonly weight: 400 | 500 | 600 | 700 | 800;
  /** File name inside the package `fonts/` directory. */
  readonly file: string;
}

export interface LoadedFont extends FontSpec {
  readonly data: ArrayBuffer;
}

/** Every font the built-in templates are allowed to use. */
export const builtinFontSpecs: readonly FontSpec[] = [
  { family: "Inter", weight: 400, file: "Inter-Regular.ttf" },
  { family: "Inter", weight: 500, file: "Inter-Medium.ttf" },
  { family: "Inter", weight: 600, file: "Inter-SemiBold.ttf" },
  { family: "Inter", weight: 800, file: "Inter-ExtraBold.ttf" },
  { family: "JetBrains Mono", weight: 400, file: "JetBrainsMono-Regular.ttf" },
  { family: "JetBrains Mono", weight: 700, file: "JetBrainsMono-Bold.ttf" },
];

/**
 * Pairs raw bytes with their specs, validating that every spec received
 * data. Order and content are the contract satori renders with.
 */
export function createFontSet(
  bytes: ReadonlyMap<string, ArrayBuffer>,
): readonly LoadedFont[] {
  return builtinFontSpecs.map((spec) => {
    const data = bytes.get(spec.file);
    if (!data || data.byteLength === 0) {
      throw new Error(
        `Missing font data for ${spec.file}. ` +
          `Provide bytes for every entry in builtinFontSpecs.`,
      );
    }
    return { ...spec, data };
  });
}

let nodeFontCache: readonly LoadedFont[] | undefined;

/**
 * Loads the bundled fonts from disk (Node only). Bytes are read once per
 * process and cached; renders reuse the same buffers.
 */
export async function loadBuiltinFonts(): Promise<readonly LoadedFont[]> {
  if (nodeFontCache) return nodeFontCache;

  const { readFile } = await import("node:fs/promises");
  const dir = new URL("../../fonts/", import.meta.url);

  const bytes = new Map<string, ArrayBuffer>();
  for (const spec of builtinFontSpecs) {
    const buf = await readFile(new URL(spec.file, dir));
    bytes.set(
      spec.file,
      buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
    );
  }

  nodeFontCache = createFontSet(bytes);
  return nodeFontCache;
}
