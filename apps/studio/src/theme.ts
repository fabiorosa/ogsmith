import {
  AA_LARGE,
  contrastRatio,
  getTheme,
  meetsAA,
  themeNames,
  type Theme,
  type ThemeName,
} from "ogsmith";

export { themeNames };
export type { Theme, ThemeName };

/**
 * Resolves the effective render theme: a built-in theme, optionally with a
 * custom accent. The accent ink flips to whichever of the base theme's
 * dark/light inks clears AA on the new accent, and the accent itself must
 * clear AA_LARGE against the canvas so display text stays readable; the
 * caller surfaces `accentWarning` instead of silently shipping low
 * contrast.
 */
export interface EffectiveTheme {
  readonly theme: Theme;
  readonly accentWarning: string | null;
}

export function resolveTheme(
  name: ThemeName,
  customAccent: string | null,
): EffectiveTheme {
  const base = getTheme(name);
  if (!customAccent) return { theme: base, accentWarning: null };

  const accentInk = meetsAA("#0b0c0e", customAccent)
    ? "#0b0c0e"
    : "#f7f8f9";
  const warnings: string[] = [];
  if (!meetsAA(accentInk, customAccent)) {
    warnings.push("text on the accent falls below AA");
  }
  if (contrastRatio(customAccent, base.tokens.bg) < AA_LARGE) {
    warnings.push("accent on the background falls below AA for large text");
  }

  return {
    theme: {
      ...base,
      tokens: { ...base.tokens, accent: customAccent, accentInk },
    },
    accentWarning: warnings.length > 0 ? warnings.join("; ") : null,
  };
}
