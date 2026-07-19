import { getTheme } from "ogsmith";
import { useEffect, useState } from "react";
import { getEngine } from "../engine/client";
import { allTemplates, useStudio } from "../store";

/**
 * Template gallery. Every card shows a real engine render of that
 * template's sample content; card aspect ratios are the template's true
 * ratios, so the grid is deliberately non-uniform.
 */

const previewCache = new Map<string, string>();

function usePreview(templateId: string): string | null {
  const [url, setUrl] = useState<string | null>(
    previewCache.get(templateId) ?? null,
  );

  useEffect(() => {
    if (previewCache.has(templateId)) return;
    let cancelled = false;
    const template = allTemplates.find((t) => t.id === templateId);
    if (!template) return;
    void getEngine()
      .renderSvg(templateId, template.sample, getTheme("graphite"))
      .then((svg) => {
        if (cancelled) return;
        const blobUrl = URL.createObjectURL(
          new Blob([svg], { type: "image/svg+xml" }),
        );
        previewCache.set(templateId, blobUrl);
        setUrl(blobUrl);
      })
      .catch(() => {
        // The editor surfaces engine errors; cards stay in skeleton state.
      });
    return () => {
      cancelled = true;
    };
  }, [templateId]);

  return url;
}

function TemplateCard({ templateId }: { readonly templateId: string }) {
  const openTemplate = useStudio((s) => s.openTemplate);
  const template = allTemplates.find((t) => t.id === templateId);
  const preview = usePreview(templateId);
  if (!template) return null;

  return (
    <button
      type="button"
      onClick={() => {
        openTemplate(templateId);
      }}
      className="group flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 text-left transition hover:border-ink-dim/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[0.99]"
    >
      <div
        className="w-full overflow-hidden rounded-lg border border-border"
        style={{
          aspectRatio: `${template.size.width} / ${template.size.height}`,
        }}
      >
        {preview ? (
          <img
            src={preview}
            alt={`${template.name} sample render`}
            className="h-full w-full transition group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-surface-2">
            <span className="text-xs text-ink-dim">Rendering sample…</span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[15px] font-semibold text-ink">
          {template.name}
        </span>
        <span className="text-sm leading-relaxed text-ink-dim">
          {template.description}
        </span>
        <span className="mt-1 font-mono text-xs text-ink-dim/70">
          {template.size.width}×{template.size.height}
        </span>
      </div>
    </button>
  );
}

export function Gallery() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-10 overflow-y-auto px-8 py-14">
      <div className="flex max-w-xl flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight text-ink">
          Pick a template
        </h1>
        <p className="text-[15px] leading-relaxed text-ink-dim">
          Every preview below is a real render from the engine. What you see
          in the editor is exactly what ships in the PNG.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 min-[700px]:grid-cols-2">
        {allTemplates.map((template) => (
          <TemplateCard key={template.id} templateId={template.id} />
        ))}
      </div>
    </section>
  );
}
