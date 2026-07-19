/// <reference lib="webworker" />
/**
 * Render worker. Hosts the ogsmith engine off the main thread so typing
 * never blocks the UI. There is exactly one rendering path (ADR-002):
 * this worker returns the engine's SVG for preview, and rasterizes that
 * same SVG for PNG export.
 */
import {
  builtinFontSpecs,
  createFontSet,
  getTemplate,
  render,
  type LoadedFont,
} from "ogsmith";
import { initWasmRaster, svgToPngWasm } from "ogsmith/raster-wasm";
import wasmUrl from "@resvg/resvg-wasm/index_bg.wasm?url";
import interRegular from "ogsmith/fonts/Inter-Regular.ttf?url";
import interMedium from "ogsmith/fonts/Inter-Medium.ttf?url";
import interSemiBold from "ogsmith/fonts/Inter-SemiBold.ttf?url";
import interExtraBold from "ogsmith/fonts/Inter-ExtraBold.ttf?url";
import monoRegular from "ogsmith/fonts/JetBrainsMono-Regular.ttf?url";
import monoBold from "ogsmith/fonts/JetBrainsMono-Bold.ttf?url";
import type { Theme } from "ogsmith";

const FONT_URLS: Record<string, string> = {
  "Inter-Regular.ttf": interRegular,
  "Inter-Medium.ttf": interMedium,
  "Inter-SemiBold.ttf": interSemiBold,
  "Inter-ExtraBold.ttf": interExtraBold,
  "JetBrainsMono-Regular.ttf": monoRegular,
  "JetBrainsMono-Bold.ttf": monoBold,
};

export interface RenderRequest {
  readonly id: number;
  readonly kind: "render" | "export-png";
  readonly templateId: string;
  readonly props: Record<string, unknown>;
  readonly theme: Theme;
}

export type WorkerResponse =
  | { readonly id: number; readonly ok: true; readonly svg: string }
  | { readonly id: number; readonly ok: true; readonly png: ArrayBuffer }
  | { readonly id: number; readonly ok: false; readonly error: string }
  | { readonly id: -1; readonly ok: true; readonly ready: true };

let fonts: readonly LoadedFont[] | undefined;

async function boot(): Promise<void> {
  const bytes = new Map<string, ArrayBuffer>();
  await Promise.all(
    builtinFontSpecs.map(async (spec) => {
      const url = FONT_URLS[spec.file];
      if (!url) throw new Error(`No asset URL for font ${spec.file}`);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch font ${spec.file}`);
      bytes.set(spec.file, await res.arrayBuffer());
    }),
  );
  fonts = createFontSet(bytes);
  await initWasmRaster(fetch(wasmUrl));
}

const ready = boot();

self.onmessage = (event: MessageEvent<RenderRequest>) => {
  void (async () => {
    const { id, kind, templateId, props, theme } = event.data;
    try {
      await ready;
      if (!fonts) throw new Error("Fonts failed to initialize");
      const template = getTemplate(templateId);
      const svg = await render(template, props, { theme, fonts });
      if (kind === "render") {
        self.postMessage({ id, ok: true, svg } satisfies WorkerResponse);
        return;
      }
      const png = await svgToPngWasm(svg);
      const buffer = png.buffer.slice(
        png.byteOffset,
        png.byteOffset + png.byteLength,
      ) as ArrayBuffer;
      self.postMessage({ id, ok: true, png: buffer } satisfies WorkerResponse, {
        transfer: [buffer],
      });
    } catch (error) {
      self.postMessage({
        id,
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      } satisfies WorkerResponse);
    }
  })();
};

void ready.then(() => {
  self.postMessage({ id: -1, ok: true, ready: true } satisfies WorkerResponse);
});
