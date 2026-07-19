import type { Template } from "../templates/define.js";
import type { RenderOptions } from "../engine/render.js";
import { render } from "../engine/render.js";
import { RESVG_OPTIONS } from "./options.js";

/**
 * SVG to PNG rasterization for browsers and web workers via resvg-wasm.
 * The caller initializes the wasm module once (it needs the .wasm asset
 * URL, which only the bundler knows) and then rasterizes freely.
 *
 * The parity test in CI asserts this path produces byte-identical PNGs
 * to the native path in `raster/node.ts`.
 */

let initialized = false;

export async function initWasmRaster(
  wasmSource: BufferSource | Response | Promise<Response>,
): Promise<void> {
  if (initialized) return;
  const { initWasm } = await import("@resvg/resvg-wasm");
  await initWasm(wasmSource);
  initialized = true;
}

export async function svgToPngWasm(svg: string): Promise<Uint8Array> {
  if (!initialized) {
    throw new Error(
      "Call initWasmRaster(wasmSource) once before rasterizing. " +
        "Pass the @resvg/resvg-wasm .wasm asset (URL fetch or bytes).",
    );
  }
  const { Resvg } = await import("@resvg/resvg-wasm");
  const resvg = new Resvg(svg, RESVG_OPTIONS);
  return resvg.render().asPng();
}

/** Renders a template straight to PNG bytes (browser/worker). */
export async function renderPngWasm<TProps extends Record<string, unknown>>(
  template: Template<TProps>,
  props: TProps,
  options: RenderOptions = {},
): Promise<Uint8Array> {
  const svg = await render(template, props, options);
  return svgToPngWasm(svg);
}
