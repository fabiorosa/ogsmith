// Public API of the ogsmith rendering engine.

export const VERSION = "0.1.0";

// Themes
export {
  themes,
  themeNames,
  getTheme,
  type Theme,
  type ThemeName,
  type ThemeTokens,
} from "./theme/tokens.js";
export {
  contrastRatio,
  meetsAA,
  relativeLuminance,
  AA_NORMAL,
  AA_LARGE,
} from "./theme/contrast.js";

// Fonts
export {
  builtinFontSpecs,
  createFontSet,
  loadBuiltinFonts,
  type FontSpec,
  type LoadedFont,
} from "./engine/fonts.js";

// Templates
export {
  defineTemplate,
  type Template,
  type AnyTemplate,
  type ElementNode,
  type FieldMeta,
  type ControlKind,
  type TemplateSize,
} from "./templates/define.js";
export {
  registerTemplate,
  getTemplate,
  listTemplates,
} from "./templates/registry.js";
export { box, text, image } from "./templates/ui.js";

// Built-in templates (importing registers them)
export { blogPost } from "./templates/blog-post.js";

// Rendering
export { render, type RenderOptions } from "./engine/render.js";
