import { z } from "zod";
import { defineTemplate } from "./define.js";
import { registerTemplate } from "./registry.js";
import { box, image, text } from "./ui.js";

/**
 * OG image for a product or landing page (1200x630).
 *
 * Centered composition, in contrast with blog-post's editorial left
 * alignment: optional logo, a launch chip (the single accent use), the
 * product name as the dominant element, a supporting tagline, and the
 * domain anchored at the base.
 */

const schema = z.object({
  name: z
    .string()
    .min(1, "Product name is required")
    .max(40, "Keep product names under 40 characters"),
  tagline: z.string().max(90),
  url: z.string().max(60),
  badge: z.string().max(24),
  logo: z
    .union([z.literal(""), z.string().regex(/^data:image\//, "Logo must be a data URI")])
    .default(""),
});

type Props = z.infer<typeof schema>;

export const productLaunch = registerTemplate(
  defineTemplate<Props>({
    id: "product-launch",
    name: "Product launch",
    description: "OG image for a product, landing page, or launch post.",
    size: { width: 1200, height: 630 },
    schema,
    fields: {
      name: {
        label: "Product name",
        control: "text",
        hint: "Dominates the composition.",
      },
      tagline: {
        label: "Tagline",
        control: "textarea",
        hint: "One supporting sentence. Leave empty to hide.",
      },
      url: { label: "Domain", control: "text", hint: "Shown at the base." },
      badge: {
        label: "Badge",
        control: "text",
        hint: "Launch chip, e.g. Now in beta. Leave empty to hide.",
      },
      logo: {
        label: "Logo",
        control: "image",
        hint: "Optional square logo, rendered at 72px.",
      },
    },
    sample: {
      name: "Relay",
      tagline: "Ship release notes your users actually read.",
      url: "relay.dev",
      badge: "Now in beta",
      logo: "",
    },
    render(props, theme) {
      const t = theme.tokens;
      return box(
        {
          width: "100%",
          height: "100%",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: t.bg,
          padding: "64px 80px",
          fontFamily: "Inter",
          position: "relative",
        },
        box(
          {
            flexDirection: "column",
            alignItems: "center",
            gap: 28,
          },
          ...(props.logo
            ? [
                image(
                  { width: 72, height: 72, borderRadius: 18 },
                  props.logo,
                  `${props.name} logo`,
                ),
              ]
            : []),
          ...(props.badge
            ? [
                text(
                  {
                    fontSize: 22,
                    fontWeight: 600,
                    color: t.accentInk,
                    backgroundColor: t.accent,
                    padding: "10px 24px",
                    borderRadius: 999,
                  },
                  props.badge,
                ),
              ]
            : []),
          text(
            {
              fontSize: 108,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: t.ink,
            },
            props.name,
          ),
          ...(props.tagline
            ? [
                text(
                  {
                    fontSize: 34,
                    fontWeight: 400,
                    color: t.inkDim,
                    maxWidth: 760,
                    textAlign: "center",
                    lineHeight: 1.35,
                  },
                  props.tagline,
                ),
              ]
            : []),
        ),
        // Domain anchored at the base, independent of the centered stack.
        text(
          {
            position: "absolute",
            bottom: 48,
            fontFamily: "JetBrains Mono",
            fontSize: 24,
            fontWeight: 400,
            color: t.inkDim,
            letterSpacing: "0.04em",
          },
          props.url,
        ),
      );
    },
  }),
);
