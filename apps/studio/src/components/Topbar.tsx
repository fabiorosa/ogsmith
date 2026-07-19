import { getTemplate } from "ogsmith";
import { useStudio } from "../store";
import { BackIcon, CheckIcon, CopyIcon, DownloadIcon } from "./icons";
import { useState } from "react";

export function Topbar() {
  const screen = useStudio((s) => s.screen);
  const templateId = useStudio((s) => s.templateId);
  const exportStatus = useStudio((s) => s.exportStatus);
  const exportError = useStudio((s) => s.exportError);
  const svg = useStudio((s) => s.svg);
  const openGallery = useStudio((s) => s.openGallery);
  const exportPng = useStudio((s) => s.exportPng);
  const copySvg = useStudio((s) => s.copySvg);
  const [copied, setCopied] = useState(false);

  const template = templateId ? getTemplate(templateId) : null;

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-bg px-6">
      <div className="flex items-center gap-4">
        {screen === "editor" && (
          <button
            type="button"
            onClick={openGallery}
            aria-label="Back to templates"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-dim transition hover:bg-surface-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[0.98]"
          >
            <BackIcon />
          </button>
        )}
        <span className="text-[15px] font-semibold tracking-tight text-ink">
          OGsmith
        </span>
        {template && (
          <>
            <span className="text-ink-dim" aria-hidden>
              /
            </span>
            <span className="text-sm text-ink-dim">{template.name}</span>
          </>
        )}
      </div>

      {screen === "editor" && (
        <div className="flex items-center gap-3">
          {exportStatus === "error" && exportError && (
            <span className="text-sm text-danger" role="alert">
              {exportError}
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              void copySvg().then((ok) => {
                if (ok) {
                  setCopied(true);
                  setTimeout(() => {
                    setCopied(false);
                  }, 1600);
                }
              });
            }}
            disabled={!svg}
            className="flex h-9 items-center gap-2 rounded-lg border border-border px-4 text-sm font-medium text-ink transition hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
            {copied ? "Copied" : "Copy SVG"}
          </button>
          <button
            type="button"
            onClick={() => void exportPng()}
            disabled={exportStatus === "working" || !svg}
            className="flex h-9 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-accent-ink transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
          >
            {exportStatus === "done" ? <CheckIcon /> : <DownloadIcon />}
            {exportStatus === "working"
              ? "Rendering PNG…"
              : exportStatus === "done"
                ? "Saved"
                : "Export PNG"}
          </button>
        </div>
      )}
    </header>
  );
}
