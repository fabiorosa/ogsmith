import { z } from "zod";
import { defineTemplate } from "./define.js";
import { registerTemplate } from "./registry.js";
import { box, text } from "./ui.js";

/**
 * Release announcement banner (1600x900).
 *
 * A framed plate on the canvas background, in contrast with the other
 * templates' full-bleed compositions. Monospace version number in accent
 * (the single accent use), release title, up to three highlight lines
 * with hairline rules, repository reference at the base.
 */

const schema = z.object({
  version: z
    .string()
    .min(1, "Version is required")
    .max(16, "Keep versions short, e.g. v2.0"),
  title: z.string().min(1, "Title is required").max(60),
  highlights: z
    .string()
    .max(200)
    .describe("One highlight per line, up to three lines"),
  repo: z.string().max(60),
});

type Props = z.infer<typeof schema>;

/** Splits the highlights textarea into at most three trimmed lines. */
export function parseHighlights(value: string): readonly string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .slice(0, 3);
}

export const releaseBanner = registerTemplate(
  defineTemplate<Props>({
    id: "release-banner",
    name: "Release banner",
    description: "Announcement banner for a version release.",
    size: { width: 1600, height: 900 },
    schema,
    fields: {
      version: {
        label: "Version",
        control: "text",
        hint: "Monospace, rendered in the accent color.",
      },
      title: { label: "Release title", control: "text" },
      highlights: {
        label: "Highlights",
        control: "textarea",
        hint: "One per line. The first three are shown.",
      },
      repo: {
        label: "Repository",
        control: "text",
        hint: "e.g. github.com/acme/relay. Leave empty to hide.",
      },
    },
    sample: {
      version: "v2.0",
      title: "The multiplayer release",
      highlights:
        "Live cursors in shared changelogs\nMarkdown import from GitHub releases\n3x faster publish pipeline",
      repo: "github.com/relay-hq/relay",
    },
    render(props, theme) {
      const t = theme.tokens;
      const highlights = parseHighlights(props.highlights);
      return box(
        {
          width: "100%",
          height: "100%",
          backgroundColor: t.bg,
          padding: 56,
          fontFamily: "Inter",
        },
        box(
          {
            width: "100%",
            height: "100%",
            flexDirection: "column",
            justifyContent: "space-between",
            backgroundColor: t.surface,
            border: `2px solid ${t.border}`,
            borderRadius: 28,
            padding: "64px 72px",
          },
          box(
            { flexDirection: "column", gap: 20 },
            text(
              {
                fontFamily: "JetBrains Mono",
                fontSize: 44,
                fontWeight: 700,
                color: t.accent,
                letterSpacing: "0.02em",
              },
              props.version,
            ),
            text(
              {
                fontSize: 76,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                color: t.ink,
                maxWidth: 1200,
              },
              props.title,
            ),
          ),
          box(
            { flexDirection: "column", gap: 0 },
            ...highlights.map((line) =>
              box(
                {
                  flexDirection: "row",
                  alignItems: "center",
                  padding: "22px 0",
                  borderTop: `1px solid ${t.border}`,
                },
                text(
                  { fontSize: 30, fontWeight: 500, color: t.inkDim },
                  line,
                ),
              ),
            ),
            ...(props.repo
              ? [
                  box(
                    {
                      flexDirection: "row",
                      paddingTop: 28,
                      borderTop: `1px solid ${t.border}`,
                    },
                    text(
                      {
                        fontFamily: "JetBrains Mono",
                        fontSize: 24,
                        fontWeight: 400,
                        color: t.inkDim,
                        letterSpacing: "0.04em",
                      },
                      props.repo,
                    ),
                  ),
                ]
              : []),
          ),
        ),
      );
    },
  }),
);
