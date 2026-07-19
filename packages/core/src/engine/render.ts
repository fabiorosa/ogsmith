import satori from "satori";
import type { LoadedFont } from "./fonts.js";
import { loadBuiltinFonts } from "./fonts.js";
import type { Template } from "../templates/define.js";
import type { Theme, ThemeName } from "../theme/tokens.js";
import { getTheme, themes } from "../theme/tokens.js";

export interface RenderOptions {
  /** Built-in theme name or a full custom theme. Default: graphite. */
  readonly theme?: ThemeName | Theme;
  /**
   * Font set to render with. Defaults to the bundled fonts loaded from
   * disk (Node). Browser consumers must pass fonts explicitly, fetched
   * from the package's `fonts/` directory.
   */
  readonly fonts?: readonly LoadedFont[];
}

function resolveTheme(theme: RenderOptions["theme"]): Theme {
  if (!theme) return themes.graphite;
  if (typeof theme === "string") return getTheme(theme);
  return theme;
}

/**
 * Renders a template to SVG. This is the single rendering path: the studio
 * preview shows this exact string and PNG export rasterizes it (ADR-002).
 */
export async function render<TProps extends Record<string, unknown>>(
  template: Template<TProps>,
  props: TProps,
  options: RenderOptions = {},
): Promise<string> {
  const parsed = template.schema.parse(props);
  const theme = resolveTheme(options.theme);
  const fonts = options.fonts ?? (await loadBuiltinFonts());

  const tree = template.render(parsed, theme);

  return satori(tree as Parameters<typeof satori>[0], {
    width: template.size.width,
    height: template.size.height,
    fonts: fonts.map((font) => ({
      name: font.family,
      data: font.data,
      weight: font.weight,
      style: "normal",
    })),
  });
}
