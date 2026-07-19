/**
 * Theme token contract.
 *
 * Templates consume tokens only; they never hardcode color values. Every
 * theme must provide the full token set, enforced by a structural test.
 */

export interface ThemeTokens {
  /** Canvas background. */
  readonly bg: string;
  /** Elevated panel/plate color used for framed compositions. */
  readonly surface: string;
  /** Hairline borders and rules. */
  readonly border: string;
  /** Primary text. */
  readonly ink: string;
  /** Secondary text (meta, labels). */
  readonly inkDim: string;
  /** The single accent. Used at most once per composition. */
  readonly accent: string;
  /** Text placed on top of the accent. */
  readonly accentInk: string;
}

export interface Theme {
  readonly name: string;
  /** Whether the composition reads as dark. Drives logo/asset choices. */
  readonly mode: "dark" | "light";
  readonly tokens: ThemeTokens;
}

export const themes = {
  graphite: {
    name: "graphite",
    mode: "dark",
    tokens: {
      bg: "#101113",
      surface: "#1a1c1f",
      border: "#2a2d31",
      ink: "#f4f5f6",
      inkDim: "#a3a9b1",
      accent: "#4cc38a",
      accentInk: "#0b2818",
    },
  },
  paper: {
    name: "paper",
    mode: "light",
    tokens: {
      bg: "#fafafa",
      surface: "#ffffff",
      border: "#e4e4e7",
      ink: "#18181b",
      inkDim: "#52525b",
      accent: "#0d7a4f",
      accentInk: "#ffffff",
    },
  },
  midnight: {
    name: "midnight",
    mode: "dark",
    tokens: {
      bg: "#0b1220",
      surface: "#131c30",
      border: "#233252",
      ink: "#eef2f9",
      inkDim: "#93a1bc",
      accent: "#6ea8fe",
      accentInk: "#0a1a33",
    },
  },
  sand: {
    name: "sand",
    mode: "light",
    tokens: {
      bg: "#faf6f0",
      surface: "#ffffff",
      border: "#e7ded2",
      ink: "#292522",
      inkDim: "#6b6259",
      accent: "#b4550a",
      accentInk: "#ffffff",
    },
  },
} as const satisfies Record<string, Theme>;

export type ThemeName = keyof typeof themes;

export const themeNames = Object.keys(themes) as readonly ThemeName[];

export function getTheme(name: ThemeName): Theme {
  return themes[name];
}
