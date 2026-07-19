import type { Theme } from "ogsmith";
import type { RenderRequest, WorkerResponse } from "./worker";

/**
 * Typed promise interface over the render worker. One worker instance per
 * app; requests are matched to responses by id. `renderSvg` calls for the
 * same purpose should be debounced by the caller (the store does this).
 */

type Pending =
  | { readonly kind: "render"; resolve(svg: string): void; reject(e: Error): void }
  | { readonly kind: "export-png"; resolve(png: ArrayBuffer): void; reject(e: Error): void };

export class EngineClient {
  private readonly worker: Worker;
  private readonly pending = new Map<number, Pending>();
  private nextId = 1;
  private readonly readyPromise: Promise<void>;

  constructor() {
    this.worker = new Worker(new URL("./worker.ts", import.meta.url), {
      type: "module",
    });
    let markReady: () => void;
    this.readyPromise = new Promise((resolve) => {
      markReady = resolve;
    });
    this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const data = event.data;
      if (data.id === -1) {
        markReady();
        return;
      }
      const entry = this.pending.get(data.id);
      if (!entry) return;
      this.pending.delete(data.id);
      if (!data.ok) {
        entry.reject(new Error(data.error));
      } else if (entry.kind === "render" && "svg" in data) {
        entry.resolve(data.svg);
      } else if (entry.kind === "export-png" && "png" in data) {
        entry.resolve(data.png);
      } else {
        entry.reject(new Error("Mismatched worker response"));
      }
    };
  }

  /** Resolves once fonts and the wasm raster are loaded. */
  ready(): Promise<void> {
    return this.readyPromise;
  }

  renderSvg(
    templateId: string,
    props: Record<string, unknown>,
    theme: Theme,
  ): Promise<string> {
    return this.request("render", templateId, props, theme) as Promise<string>;
  }

  exportPng(
    templateId: string,
    props: Record<string, unknown>,
    theme: Theme,
  ): Promise<ArrayBuffer> {
    return this.request(
      "export-png",
      templateId,
      props,
      theme,
    ) as Promise<ArrayBuffer>;
  }

  private request(
    kind: RenderRequest["kind"],
    templateId: string,
    props: Record<string, unknown>,
    theme: Theme,
  ): Promise<string | ArrayBuffer> {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { kind, resolve, reject });
      const message: RenderRequest = { id, kind, templateId, props, theme };
      this.worker.postMessage(message);
    });
  }
}

let singleton: EngineClient | undefined;

export function getEngine(): EngineClient {
  singleton ??= new EngineClient();
  return singleton;
}
