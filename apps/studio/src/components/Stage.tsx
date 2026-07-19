import { getTemplate } from "ogsmith";
import { useMemo, useState } from "react";
import { useStudio } from "../store";

type Zoom = "fit" | 0.25 | 0.5 | 1;

/**
 * The canvas stage: the studio's signature element. The rendered SVG
 * floats on a dot-grid backdrop; a soft accent glow under the canvas
 * appears only while a render is in flight (honest motion, no spinner).
 */
export function Stage() {
  const templateId = useStudio((s) => s.templateId);
  const svg = useStudio((s) => s.svg);
  const engineStatus = useStudio((s) => s.engineStatus);
  const engineError = useStudio((s) => s.engineError);
  const renderStatus = useStudio((s) => s.renderStatus);
  const renderError = useStudio((s) => s.renderError);
  const [zoom, setZoom] = useState<Zoom>("fit");

  const blobUrl = useMemo(() => {
    if (!svg) return null;
    return URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  }, [svg]);

  if (!templateId) return null;
  const template = getTemplate(templateId);
  const { width, height } = template.size;

  const sizeStyle =
    zoom === "fit"
      ? { width: "100%", maxWidth: width / 2, aspectRatio: `${width} / ${height}` }
      : { width: width * zoom, height: height * zoom };

  return (
    <section
      aria-label="Canvas"
      className="relative flex min-h-0 flex-1 flex-col items-center justify-center gap-6 overflow-auto bg-bg p-10 [background-image:radial-gradient(circle,#1d2024_1px,transparent_1px)] [background-size:24px_24px]"
    >
      {engineStatus === "error" && engineError ? (
        <ErrorPanel title="The render engine failed to load" detail={engineError} />
      ) : renderStatus === "error" && renderError ? (
        <ErrorPanel title="Render failed" detail={renderError} />
      ) : engineStatus === "booting" && !svg ? (
        <div
          className="flex items-center justify-center rounded-xl border border-border bg-surface"
          style={sizeStyle}
        >
          <p className="text-sm text-ink-dim">Loading render engine…</p>
        </div>
      ) : blobUrl ? (
        <div className="relative" style={sizeStyle}>
          {renderStatus === "rendering" && (
            <div
              aria-hidden
              className="absolute -inset-4 rounded-2xl bg-accent/15 blur-2xl"
            />
          )}
          <img
            src={blobUrl}
            alt={`${template.name} preview`}
            className="relative h-full w-full rounded-md shadow-2xl shadow-black/40"
          />
        </div>
      ) : null}

      <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-1">
        {(["fit", 0.25, 0.5, 1] as const).map((level) => (
          <button
            key={String(level)}
            type="button"
            onClick={() => {
              setZoom(level);
            }}
            aria-pressed={zoom === level}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[0.98] ${
              zoom === level
                ? "bg-surface-2 text-ink"
                : "text-ink-dim hover:text-ink"
            }`}
          >
            {level === "fit" ? "Fit" : `${String(level * 100)}%`}
          </button>
        ))}
        <span className="ml-2 mr-1 font-mono text-xs text-ink-dim">
          {width}×{height}
        </span>
      </div>
    </section>
  );
}

function ErrorPanel({
  title,
  detail,
}: {
  readonly title: string;
  readonly detail: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div
      role="alert"
      className="flex max-w-md flex-col gap-3 rounded-xl border border-danger/40 bg-surface p-6"
    >
      <p className="text-sm font-semibold text-ink">{title}</p>
      <p className="break-words font-mono text-xs leading-relaxed text-ink-dim">
        {detail}
      </p>
      <button
        type="button"
        onClick={() => {
          void navigator.clipboard.writeText(detail).then(() => {
            setCopied(true);
            setTimeout(() => {
              setCopied(false);
            }, 1600);
          });
        }}
        className="self-start rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-ink transition hover:bg-surface-2 active:scale-[0.98]"
      >
        {copied ? "Copied" : "Copy details"}
      </button>
    </div>
  );
}
