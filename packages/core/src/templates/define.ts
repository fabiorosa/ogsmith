import type { z } from "zod";
import type { Theme } from "../theme/tokens.js";

/**
 * Element tree contract.
 *
 * Templates return plain objects shaped like React elements (type, props,
 * children) restricted to the flexbox CSS subset satori supports. No React
 * runtime is involved; the engine hands the tree straight to satori.
 */
export interface ElementNode {
  readonly type: string;
  readonly props: {
    readonly style?: Readonly<Record<string, string | number>>;
    readonly children?: readonly (ElementNode | string)[] | ElementNode | string;
    readonly [key: string]: unknown;
  };
}

/** Control vocabulary the studio knows how to render. */
export type ControlKind = "text" | "textarea" | "select" | "color" | "image";

/**
 * Per-field UI metadata carried inside the zod schema's description.
 * The studio generates its editor form from this, so templates plug in
 * with zero studio changes.
 */
export interface FieldMeta {
  readonly label: string;
  readonly control: ControlKind;
  /** Options for `select` controls. */
  readonly options?: readonly string[];
  /** Placeholder/help shown in the studio. */
  readonly hint?: string;
}

export interface TemplateSize {
  readonly width: number;
  readonly height: number;
}

export interface Template<TProps extends Record<string, unknown>> {
  /** Registry key, kebab-case. */
  readonly id: string;
  /** Human name shown in the studio gallery. */
  readonly name: string;
  /** One-line purpose, shown in the gallery. */
  readonly description: string;
  readonly size: TemplateSize;
  /** Validated input contract; also drives the studio form. */
  readonly schema: z.ZodType<TProps>;
  /** Field order and UI metadata for the studio. */
  readonly fields: Readonly<Record<keyof TProps & string, FieldMeta>>;
  /** Realistic sample props used by the gallery and by snapshot tests. */
  readonly sample: TProps;
  /** Pure render function. No time, randomness, or environment reads. */
  render(props: TProps, theme: Theme): ElementNode;
}

/**
 * Identity helper that pins the generic so `render`, `fields`, and
 * `sample` all check against the schema's inferred props type.
 */
export function defineTemplate<TProps extends Record<string, unknown>>(
  template: Template<TProps>,
): Template<TProps> {
  return template;
}

/**
 * A template with its generic erased for registry storage. Rendering
 * validates props at runtime through the schema, so the erasure is safe.
 */
export type AnyTemplate = Template<Record<string, unknown>>;
