import { z } from "zod";
import { defineTemplate } from "./define.js";
import { registerTemplate } from "./registry.js";
import { box, text } from "./ui.js";

/**
 * OG image for an article (1200x630).
 *
 * Composition: publication and tag up top, a dominant title in the middle,
 * author meta at the base. The tag chip is the composition's single accent
 * use. Title scale is 4x the meta scale so the hierarchy reads in one
 * second at feed size.
 */

const schema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(90, "Keep titles under 90 characters so they stay legible"),
  publication: z.string().min(1).max(40),
  tag: z.string().max(24),
  author: z.string().min(1).max(48),
  date: z.string().max(32),
});

type Props = z.infer<typeof schema>;

export const blogPost = registerTemplate(
  defineTemplate<Props>({
    id: "blog-post",
    name: "Blog post",
    description: "OG image for an article or changelog entry.",
    size: { width: 1200, height: 630 },
    schema,
    fields: {
      title: {
        label: "Title",
        control: "textarea",
        hint: "The article headline. Dominates the composition.",
      },
      publication: {
        label: "Publication",
        control: "text",
        hint: "Site or blog name, shown top left.",
      },
      tag: {
        label: "Tag",
        control: "text",
        hint: "Category chip. Leave empty to hide.",
      },
      author: { label: "Author", control: "text" },
      date: { label: "Date", control: "text", hint: "Free-form, e.g. Jul 2026." },
    },
    sample: {
      title: "Designing a deterministic render pipeline",
      publication: "relay.dev",
      tag: "Engineering",
      author: "Dana Whitfield",
      date: "Jul 2026",
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
          padding: "64px 72px",
          fontFamily: "Inter",
        },
        // Top row: publication + optional tag chip.
        box(
          {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          },
          text(
            {
              fontFamily: "JetBrains Mono",
              fontSize: 26,
              fontWeight: 400,
              color: t.inkDim,
              letterSpacing: "0.02em",
            },
            props.publication,
          ),
          ...(props.tag
            ? [
                text(
                  {
                    fontSize: 22,
                    fontWeight: 600,
                    color: t.accentInk,
                    backgroundColor: t.accent,
                    padding: "10px 22px",
                    borderRadius: 999,
                  },
                  props.tag,
                ),
              ]
            : []),
        ),
        // Title: the dominant element.
        text(
          {
            fontSize: 88,
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
            color: t.ink,
            maxWidth: 1000,
          },
          props.title,
        ),
        // Base meta row.
        box(
          {
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
          },
          text(
            { fontSize: 26, fontWeight: 500, color: t.ink },
            props.author,
          ),
          text({ fontSize: 26, fontWeight: 400, color: t.inkDim }, "·"),
          text({ fontSize: 26, fontWeight: 400, color: t.inkDim }, props.date),
        ),
      );
    },
  }),
);
