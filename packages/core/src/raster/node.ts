import type { Template } from "../templates/define.js";
import type { RenderOptions } from "../engine/render.js";
import { render } from "../engine/render.js";
import { RESVG_OPTIONS } from "./options.js";

/**
 * SVG to PNG rasterization for Node using the native resvg binding.
 * `@resvg/resvg-js` is an optional peer dependency; it is imported lazily
 * so browser bundles and SVG-only consumers never pay for it.
 */
export async function svgToPng(svg: string): Promise<Uint8Array> {
  const { Resvg } = await import("@resvg/resvg-js");
  const resvg = new Resvg(svg, RESVG_OPTIONS);
  return resvg.render().asPng();
}

/** Renders a template straight to PNG bytes (Node). */
export async function renderPng<TProps extends Record<string, unknown>>(
  template: Template<TProps>,
  props: TProps,
  options: RenderOptions = {},
): Promise<Uint8Array> {
  const svg = await render(template, props, options);
  return svgToPng(svg);
}
