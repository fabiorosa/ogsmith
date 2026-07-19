/**
 * Shared resvg options, pinned so the native (Node) and wasm (browser)
 * raster paths produce identical bytes. The parity test in CI asserts
 * hash equality between the two paths; never let their options drift.
 */
export const RESVG_OPTIONS = {
  // Fonts live inside the SVG as satori outputs embedded glyph paths,
  // so resvg never resolves fonts on its own.
  font: {
    loadSystemFonts: false as const,
  },
  // satori emits explicit width/height; render at natural size.
} as const;
