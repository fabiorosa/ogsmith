import { getTemplate, themeNames, type ThemeName } from "ogsmith";

/**
 * Shareable editor state encoded in the URL hash as base64url JSON.
 * Invalid or stale hashes fall back to the gallery instead of crashing.
 */
export interface SharedState {
  readonly templateId: string;
  readonly themeName: ThemeName;
  readonly accent: string | null;
  readonly props: Record<string, unknown>;
}

export function encodeState(state: SharedState): string {
  const json = JSON.stringify({
    t: state.templateId,
    h: state.themeName,
    a: state.accent,
    p: state.props,
  });
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

export function decodeState(hash: string): SharedState | null {
  try {
    const raw = hash.replace(/^#/, "");
    if (!raw) return null;
    const base64 = raw.replaceAll("-", "+").replaceAll("_", "/");
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
    const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (typeof parsed !== "object" || parsed === null) return null;
    const record = parsed as Record<string, unknown>;

    const templateId = record.t;
    if (typeof templateId !== "string") return null;
    const template = getTemplate(templateId); // throws on unknown id

    const themeName = record.h;
    if (
      typeof themeName !== "string" ||
      !(themeNames as readonly string[]).includes(themeName)
    ) {
      return null;
    }

    const accent =
      typeof record.a === "string" && /^#[0-9a-f]{6}$/i.test(record.a)
        ? record.a
        : null;

    // Merge shared props over the sample and validate; drop the hash if
    // the payload no longer satisfies the template's schema.
    const props = template.schema.parse({
      ...template.sample,
      ...(typeof record.p === "object" && record.p !== null ? record.p : {}),
    });

    return { templateId, themeName: themeName as ThemeName, accent, props };
  } catch {
    return null;
  }
}
