import { create } from "zustand";
import { getTemplate, listTemplates, type ThemeName } from "ogsmith";
import { getEngine } from "./engine/client";
import { resolveTheme } from "./theme";
import { decodeState, encodeState } from "./urlState";

/**
 * Single editor store. Renders are debounced (~120 ms) and stale results
 * are discarded by sequence number, so the preview always reflects the
 * latest input.
 */

export type EngineStatus = "booting" | "ready" | "error";
export type RenderStatus = "idle" | "rendering" | "error";
export type ExportStatus = "idle" | "working" | "done" | "error";

interface StudioState {
  screen: "gallery" | "editor";
  templateId: string | null;
  props: Record<string, unknown>;
  themeName: ThemeName;
  accent: string | null;
  accentWarning: string | null;

  engineStatus: EngineStatus;
  engineError: string | null;
  renderStatus: RenderStatus;
  renderError: string | null;
  svg: string | null;
  exportStatus: ExportStatus;
  exportError: string | null;

  boot: () => void;
  openGallery: () => void;
  openTemplate: (templateId: string) => void;
  setProp: (key: string, value: unknown) => void;
  setTheme: (name: ThemeName) => void;
  setAccent: (accent: string | null) => void;
  exportPng: () => Promise<void>;
  copySvg: () => Promise<boolean>;
}

const RENDER_DEBOUNCE_MS = 120;

let debounceTimer: ReturnType<typeof setTimeout> | undefined;
let renderSeq = 0;

function syncHash(state: Pick<StudioState, "templateId" | "themeName" | "accent" | "props">): void {
  if (!state.templateId) {
    history.replaceState(null, "", location.pathname + location.search);
    return;
  }
  const hash = encodeState({
    templateId: state.templateId,
    themeName: state.themeName,
    accent: state.accent,
    props: state.props,
  });
  history.replaceState(null, "", `#${hash}`);
}

export const useStudio = create<StudioState>((set, get) => {
  function scheduleRender(): void {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      void runRender();
    }, RENDER_DEBOUNCE_MS);
  }

  async function runRender(): Promise<void> {
    const { templateId, props, themeName, accent } = get();
    if (!templateId) return;
    const seq = ++renderSeq;
    set({ renderStatus: "rendering" });
    try {
      const { theme, accentWarning } = resolveTheme(themeName, accent);
      const svg = await getEngine().renderSvg(templateId, props, theme);
      if (seq !== renderSeq) return; // stale
      set({ svg, renderStatus: "idle", renderError: null, accentWarning });
    } catch (error) {
      if (seq !== renderSeq) return;
      set({
        renderStatus: "error",
        renderError: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return {
    screen: "gallery",
    templateId: null,
    props: {},
    themeName: "graphite",
    accent: null,
    accentWarning: null,
    engineStatus: "booting",
    engineError: null,
    renderStatus: "idle",
    renderError: null,
    svg: null,
    exportStatus: "idle",
    exportError: null,

    boot() {
      getEngine()
        .ready()
        .then(() => {
          set({ engineStatus: "ready" });
        })
        .catch((error: unknown) => {
          set({
            engineStatus: "error",
            engineError:
              error instanceof Error ? error.message : String(error),
          });
        });

      const shared = decodeState(location.hash);
      if (shared) {
        set({
          screen: "editor",
          templateId: shared.templateId,
          props: shared.props,
          themeName: shared.themeName,
          accent: shared.accent,
        });
        scheduleRender();
      } else if (location.hash) {
        // Invalid share link: land on the gallery, clean the URL.
        history.replaceState(null, "", location.pathname + location.search);
      }
    },

    openGallery() {
      set({ screen: "gallery", templateId: null, svg: null });
      syncHash({ templateId: null, themeName: get().themeName, accent: null, props: {} });
    },

    openTemplate(templateId) {
      const template = getTemplate(templateId);
      set({
        screen: "editor",
        templateId,
        props: { ...template.sample },
        svg: null,
        renderStatus: "idle",
        renderError: null,
        exportStatus: "idle",
      });
      syncHash({ ...get(), templateId, props: template.sample });
      scheduleRender();
    },

    setProp(key, value) {
      set((state) => ({ props: { ...state.props, [key]: value } }));
      syncHash(get());
      scheduleRender();
    },

    setTheme(name) {
      set({ themeName: name });
      syncHash(get());
      scheduleRender();
    },

    setAccent(accent) {
      set({ accent });
      syncHash(get());
      scheduleRender();
    },

    async exportPng() {
      const { templateId, props, themeName, accent } = get();
      if (!templateId) return;
      set({ exportStatus: "working", exportError: null });
      try {
        const { theme } = resolveTheme(themeName, accent);
        const png = await getEngine().exportPng(templateId, props, theme);
        const blob = new Blob([png], { type: "image/png" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${templateId}.png`;
        link.click();
        URL.revokeObjectURL(url);
        set({ exportStatus: "done" });
        setTimeout(() => {
          if (get().exportStatus === "done") set({ exportStatus: "idle" });
        }, 1600);
      } catch (error) {
        set({
          exportStatus: "error",
          exportError: error instanceof Error ? error.message : String(error),
        });
      }
    },

    async copySvg() {
      const { svg } = get();
      if (!svg) return false;
      try {
        await navigator.clipboard.writeText(svg);
        return true;
      } catch {
        return false;
      }
    },
  };
});

export const allTemplates = listTemplates();
