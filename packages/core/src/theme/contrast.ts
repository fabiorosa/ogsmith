/**
 * WCAG 2.x relative luminance and contrast ratio.
 * Used by tests to guarantee AA contrast for every template/theme pair,
 * and by the studio to guard custom accent colors.
 */

export function hexToRgb(hex: string): readonly [number, number, number] {
  const value = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(value)) {
    throw new Error(`Expected a 6-digit hex color, got "${hex}"`);
  }
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
}

function channelLuminance(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return (
    0.2126 * channelLuminance(r) +
    0.7152 * channelLuminance(g) +
    0.0722 * channelLuminance(b)
  );
}

/** Contrast ratio between two colors, from 1 to 21. */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [lighter, darker] = la >= lb ? [la, lb] : [lb, la];
  return (lighter + 0.05) / (darker + 0.05);
}

/** WCAG AA for normal text. */
export const AA_NORMAL = 4.5;
/** WCAG AA for large text (18pt+/14pt bold, which covers display titles). */
export const AA_LARGE = 3;

export function meetsAA(
  foreground: string,
  background: string,
  level: number = AA_NORMAL,
): boolean {
  return contrastRatio(foreground, background) >= level;
}
