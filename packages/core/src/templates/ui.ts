import type { ElementNode } from "./define.js";

/**
 * Tiny element helpers for building satori trees without JSX or React.
 * Kept deliberately small; templates should read as layout, not framework.
 */

type Style = Readonly<Record<string, string | number>>;
type Child = ElementNode | string;

export function box(style: Style, ...children: readonly Child[]): ElementNode {
  const first = children[0];
  return {
    type: "div",
    props: {
      style: { display: "flex", ...style },
      children: children.length === 1 && first !== undefined ? first : children,
    },
  };
}

export function text(style: Style, content: string): ElementNode {
  return {
    type: "div",
    props: {
      style: { display: "flex", ...style },
      children: content,
    },
  };
}

export function image(style: Style, src: string, alt: string): ElementNode {
  return {
    type: "img",
    props: { style, src, alt },
  };
}
