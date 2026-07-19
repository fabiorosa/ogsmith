# OGsmith Studio interface specification

## Design direction

Dark premium tool shell. The studio is a craftsman's bench: the canvas is
the hero, the chrome recedes. Restrained neutrals, generous spacing,
hierarchy through scale and weight, zero decorative effects.

### Tokens

| Token        | Value                | Role                            |
| ------------ | -------------------- | ------------------------------- |
| `bg`         | `#0e0f11`            | app background                  |
| `surface`    | `#16181b`            | panels, cards                   |
| `surface-2`  | `#1d2024`            | inputs, hover states            |
| `border`     | `#26292e`            | 1px hairlines                   |
| `ink`        | `#f2f3f5`            | primary text                    |
| `ink-dim`    | `#9aa0a8`            | secondary text                  |
| `accent`     | `#4cc38a`            | the single accent (calm green)  |
| `accent-ink` | `#0b2818`            | text on accent                  |
| `danger`     | `#e5484d`            | destructive/error only          |

- Accent is **green, not amber**: a deliberate contrast with CaseLane's
  amber so the two portfolio pieces read as siblings, not clones.
  Saturation under 80%.
- One gray family (cool). Never mix warm grays into the shell.
- Shadows tinted to background hue, never pure black.

### Typography

- UI: Inter (400/500/600). Body minimum 14px. Numeric/code: JetBrains Mono.
- Hierarchy by size and weight only. No colored labels, no badges as
  decoration.

### Signature element

The **live canvas stage**: the rendered SVG floats centered on a subtle
dot-grid stage with a real-scale toolbar (25/50/100% zoom plus dimension
readout). A soft accent-tinted glow appears under the canvas only while a
render is in flight. Motion with a function: it communicates "the engine is
working" and replaces any spinner.

## Layout

```
┌────────────────────────────────────────────────────────────┐
│ topbar: wordmark · template name · [Export PNG] [Copy SVG] │
├───────────────┬────────────────────────────────────────────┤
│ controls      │                                            │
│ (320px)       │            canvas stage                    │
│               │        (rendered SVG, centered,            │
│ template      │         dot-grid backdrop, zoom)           │
│ switcher      │                                            │
│ ───────────   │                                            │
│ content       │                                            │
│ fields        │                                            │
│ ───────────   │                                            │
│ theme         │                                            │
│ + accent      │                                            │
└───────────────┴────────────────────────────────────────────┘
```

- Controls panel is scrollable; canvas stage is fixed. Under 900px the panel
  becomes a bottom sheet; the canvas stays visible while editing.
- Spacing is generous: panel sections separated by 32px, fields by 16px.
  If a control feels cramped, the container grows. Content never shrinks.

## Screens and states

1. **Gallery (landing).** Grid of template cards. Each card shows a real
   render of that template with realistic sample content (never lorem ipsum,
   never "John Doe"). Cards vary in aspect ratio (real template ratios),
   deliberately not an identical-card grid.
2. **Editor.** Layout above. States:
   - Loading: engine/wasm boot shows a skeleton stage with dimension
     placeholder and the honest label "Loading render engine…" (it is
     actually loading).
   - Rendering: glow under canvas (see signature element). No fake progress.
   - Error: inline panel on the stage with the actual engine message and a
     "Copy details" action. Never `alert()`, never bare "Oops".
   - Empty field: template renders with that field's designed fallback.
     The canvas never shows raw placeholder tokens.
3. **Export.** Button states: idle, then working (label "Rendering PNG…",
   disabled), then success (brief check, then reset). Failure shows an
   inline error under the button with the real reason.

## Interaction rules

- All controls keyboard-operable; visible focus ring (accent, 2px offset).
- Hover/active states on every interactive element (`active:scale-[0.98]`).
- Debounced live render (~120 ms). Typing never janks.
- No emoji anywhere in the UI. Purposeful inline SVG icons only, chosen
  per-use, not a full generic icon set dump.

## Template art direction (the renders themselves)

Templates are the product's face. Each one:

- One dominant element (title), everything else supports it.
- Theme-driven: template consumes tokens only, never hardcodes color.
- Accent used once per composition.
- Typography does the work: scale contrast of at least 2.5× between title
  and meta.
- Contrast AA-verified per theme by automated test.
- Sample content is realistic product copy (for example, a release banner
  for a fictional "Relay 2.0" CLI), never filler text and never fake
  metrics.
