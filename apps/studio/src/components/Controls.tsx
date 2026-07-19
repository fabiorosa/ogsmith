import { getTemplate, themeNames, themes, type ThemeName } from "ogsmith";
import type { ChangeEvent } from "react";
import { useStudio } from "../store";
import { WarningIcon } from "./icons";

const inputClass =
  "w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-dim/60 transition focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent";

function SectionTitle({ children }: { readonly children: string }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-dim">
      {children}
    </h2>
  );
}

function LogoField({
  value,
  onChange,
}: {
  readonly value: string;
  readonly onChange: (next: string) => void;
}) {
  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onChange(reader.result);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex items-center gap-3">
      {value ? (
        <img
          src={value}
          alt="Uploaded logo preview"
          className="h-10 w-10 rounded-lg border border-border object-cover"
        />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-dashed border-border text-[10px] text-ink-dim">
          none
        </div>
      )}
      <label className="cursor-pointer rounded-lg border border-border px-3 py-2 text-sm text-ink transition hover:bg-surface-2">
        {value ? "Replace" : "Upload"}
        <input
          type="file"
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          className="sr-only"
          onChange={handleFile}
        />
      </label>
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange("");
          }}
          className="text-sm text-ink-dim transition hover:text-ink"
        >
          Remove
        </button>
      )}
    </div>
  );
}

export function Controls() {
  const templateId = useStudio((s) => s.templateId);
  const props = useStudio((s) => s.props);
  const themeName = useStudio((s) => s.themeName);
  const accent = useStudio((s) => s.accent);
  const accentWarning = useStudio((s) => s.accentWarning);
  const setProp = useStudio((s) => s.setProp);
  const setTheme = useStudio((s) => s.setTheme);
  const setAccent = useStudio((s) => s.setAccent);

  if (!templateId) return null;
  const template = getTemplate(templateId);

  return (
    <aside className="flex w-full flex-col gap-8 overflow-y-auto border-border bg-surface p-6 max-[900px]:border-t min-[901px]:w-80 min-[901px]:shrink-0 min-[901px]:border-r">
      <section className="flex flex-col gap-4">
        <SectionTitle>Content</SectionTitle>
        {Object.entries(template.fields).map(([key, meta]) => {
          const value = props[key];
          const stringValue = typeof value === "string" ? value : "";
          return (
            <div key={key} className="flex flex-col gap-1.5">
              <label
                htmlFor={`field-${key}`}
                className="text-sm font-medium text-ink"
              >
                {meta.label}
              </label>
              {meta.control === "textarea" ? (
                <textarea
                  id={`field-${key}`}
                  value={stringValue}
                  rows={3}
                  onChange={(e) => {
                    setProp(key, e.target.value);
                  }}
                  className={`${inputClass} resize-none`}
                />
              ) : meta.control === "select" ? (
                <select
                  id={`field-${key}`}
                  value={stringValue}
                  onChange={(e) => {
                    setProp(key, e.target.value);
                  }}
                  className={inputClass}
                >
                  {(meta.options ?? []).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : meta.control === "image" ? (
                <LogoField
                  value={stringValue}
                  onChange={(next) => {
                    setProp(key, next);
                  }}
                />
              ) : (
                <input
                  id={`field-${key}`}
                  type="text"
                  value={stringValue}
                  onChange={(e) => {
                    setProp(key, e.target.value);
                  }}
                  className={inputClass}
                />
              )}
              {meta.hint && (
                <p className="text-xs leading-relaxed text-ink-dim">
                  {meta.hint}
                </p>
              )}
            </div>
          );
        })}
      </section>

      <section className="flex flex-col gap-4">
        <SectionTitle>Theme</SectionTitle>
        <div
          role="radiogroup"
          aria-label="Theme"
          className="grid grid-cols-2 gap-2"
        >
          {themeNames.map((name: ThemeName) => {
            const t = themes[name].tokens;
            const active = themeName === name;
            return (
              <button
                key={name}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => {
                  setTheme(name);
                }}
                className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm capitalize transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[0.98] ${
                  active
                    ? "border-accent text-ink"
                    : "border-border text-ink-dim hover:bg-surface-2 hover:text-ink"
                }`}
              >
                <span
                  aria-hidden
                  className="h-5 w-5 rounded-full border"
                  style={{ backgroundColor: t.bg, borderColor: t.border }}
                />
                {name}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="accent-color" className="text-sm font-medium text-ink">
            Accent
          </label>
          <div className="flex items-center gap-3">
            <input
              id="accent-color"
              type="color"
              value={accent ?? themes[themeName].tokens.accent}
              onChange={(e) => {
                setAccent(e.target.value);
              }}
              className="h-9 w-14 cursor-pointer rounded-lg border border-border bg-surface-2 p-1"
            />
            {accent && (
              <button
                type="button"
                onClick={() => {
                  setAccent(null);
                }}
                className="text-sm text-ink-dim transition hover:text-ink"
              >
                Reset to theme accent
              </button>
            )}
          </div>
          {accentWarning && (
            <p
              role="status"
              className="flex items-start gap-2 text-xs leading-relaxed text-danger"
            >
              <WarningIcon className="mt-0.5 shrink-0" />
              {accentWarning}
            </p>
          )}
        </div>
      </section>
    </aside>
  );
}
