import { z } from "zod";
import { defineTemplate } from "./define.js";
import { registerTemplate } from "./registry.js";
import { box, text } from "./ui.js";

/**
 * Statement card for social posts (1080x1080, square).
 *
 * Editorial and typography-only: an accent rule up top (the single accent
 * use), the statement as the dominant element vertically centered, and
 * attribution pinned to the base line. No chips, no plates; the square
 * format carries the composition.
 */

const schema = z.object({
  quote: z
    .string()
    .min(1, "The statement is required")
    .max(220, "Keep statements under 220 characters; cut copy, not font size"),
  name: z.string().min(1, "Attribution name is required").max(48),
  role: z.string().max(64),
});

type Props = z.infer<typeof schema>;

export const quoteCard = registerTemplate(
  defineTemplate<Props>({
    id: "quote-card",
    name: "Quote card",
    description: "Square statement card for social posts.",
    size: { width: 1080, height: 1080 },
    schema,
    fields: {
      quote: {
        label: "Statement",
        control: "textarea",
        hint: "The statement itself. Shorter reads stronger.",
      },
      name: { label: "Name", control: "text" },
      role: {
        label: "Role",
        control: "text",
        hint: "e.g. CTO, Acme. Leave empty to hide.",
      },
    },
    sample: {
      quote:
        "Ship small, ship weekly, and let the changelog tell the story.",
      name: "Priya Natarajan",
      role: "Founding engineer, Relay",
    },
    render(props, theme) {
      const t = theme.tokens;
      return box(
        {
          width: "100%",
          height: "100%",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: t.bg,
          padding: "88px 88px 80px",
          fontFamily: "Inter",
        },
        // Accent rule: the composition's single accent use.
        box({
          width: 96,
          height: 8,
          backgroundColor: t.accent,
          borderRadius: 4,
        }),
        text(
          {
            fontSize: 58,
            fontWeight: 600,
            lineHeight: 1.22,
            letterSpacing: "-0.015em",
            color: t.ink,
          },
          props.quote,
        ),
        box(
          { flexDirection: "column", gap: 8 },
          text({ fontSize: 30, fontWeight: 600, color: t.ink }, props.name),
          ...(props.role
            ? [
                text(
                  { fontSize: 26, fontWeight: 400, color: t.inkDim },
                  props.role,
                ),
              ]
            : []),
        ),
      );
    },
  }),
);
