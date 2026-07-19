# ogsmith

Typed, deterministic SVG to PNG rendering engine for Open Graph images,
social cards, and release banners. Same props, same bytes, in Node, in CI,
and in the browser.

Part of the [OGsmith](https://github.com/fabiorosa/ogsmith) project, which
also ships a visual editor on top of this engine.

## Why this engine

- **Deterministic.** Fonts are bundled, templates are pure functions, and
  there is no browser in the render path. The test suite hashes PNG output
  and fails CI when a change alters a single byte unintentionally.
- **One rendering path.** Preview and export consume the same SVG string.
  There is no HTML replica that can drift from the exported file.
- **Typed end to end.** Every template carries a zod schema; invalid props
  fail with a readable message before anything renders.

## Install

```bash
npm install ogsmith
# PNG export in Node:
npm install @resvg/resvg-js
# PNG export in the browser or a worker:
npm install @resvg/resvg-wasm
```

`@resvg/resvg-js` and `@resvg/resvg-wasm` are optional peer dependencies:
install only the raster path you use. SVG rendering needs neither.

## Render an SVG

```ts
import { render, blogPost } from "ogsmith";

const svg = await render(blogPost, {
  title: "Designing a deterministic render pipeline",
  publication: "relay.dev",
  tag: "Engineering",
  author: "Dana Whitfield",
  date: "Jul 2026",
});
```

## Render a PNG (Node)

```ts
import { blogPost } from "ogsmith";
import { renderPng } from "ogsmith/raster";
import { writeFile } from "node:fs/promises";

const png = await renderPng(blogPost, blogPost.sample, { theme: "midnight" });
await writeFile("og.png", png);
```

## Render a PNG (browser or worker)

```ts
import { productLaunch } from "ogsmith";
import { initWasmRaster, renderPngWasm } from "ogsmith/raster-wasm";
import wasmUrl from "@resvg/resvg-wasm/index_bg.wasm?url";

await initWasmRaster(fetch(wasmUrl));
const png = await renderPngWasm(productLaunch, productLaunch.sample);
```

In the browser, pass fonts explicitly (fetch the files shipped under
`ogsmith/fonts/`) via the `fonts` render option; Node loads them from disk
automatically.

## Built-in templates

| ID               | Size      | Purpose                                |
| ---------------- | --------- | -------------------------------------- |
| `blog-post`      | 1200×630  | OG image for an article                |
| `product-launch` | 1200×630  | OG image for a product or landing page |
| `release-banner` | 1600×900  | Version release announcement           |
| `quote-card`     | 1080×1080 | Square statement card                  |

All templates support the four built-in themes: `graphite`, `paper`,
`midnight`, and `sand`. Every template/theme pair is verified for WCAG AA
contrast by an automated test.

## Custom templates

```ts
import { z } from "zod";
import { defineTemplate, registerTemplate, box, text, render } from "ogsmith";

const schema = z.object({ heading: z.string().min(1).max(60) });

const myCard = registerTemplate(
  defineTemplate<z.infer<typeof schema>>({
    id: "my-card",
    name: "My card",
    description: "A minimal custom card.",
    size: { width: 1200, height: 630 },
    schema,
    fields: { heading: { label: "Heading", control: "text" } },
    sample: { heading: "Hello from a custom template" },
    render: (props, theme) =>
      box(
        {
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.tokens.bg,
          fontFamily: "Inter",
        },
        text(
          { fontSize: 72, fontWeight: 800, color: theme.tokens.ink },
          props.heading,
        ),
      ),
  }),
);

const svg = await render(myCard, { heading: "Ship it" });
```

Templates must stay pure: no `Date.now()`, no randomness, no environment
reads. That is what keeps output reproducible byte for byte.

## API summary

| Export | Description |
| ------ | ----------- |
| `render(template, props, options?)` | Template to SVG string |
| `renderPng(template, props, options?)` | Template to PNG bytes (Node, `ogsmith/raster`) |
| `renderPngWasm(template, props, options?)` | Template to PNG bytes (browser, `ogsmith/raster-wasm`) |
| `initWasmRaster(source)` | One-time wasm initialization for the browser path |
| `templates` via `listTemplates()` / `getTemplate(id)` | Template registry |
| `defineTemplate` / `registerTemplate` | Custom template authoring |
| `themes`, `getTheme`, `themeNames` | Built-in theme tokens |
| `contrastRatio`, `meetsAA` | WCAG contrast utilities |
| `loadBuiltinFonts`, `createFontSet`, `builtinFontSpecs` | Font handling |

`options.theme` accepts a built-in theme name or a full custom `Theme`
object. `options.fonts` overrides the font set (required in browsers).

## Fonts and licensing

Inter and JetBrains Mono are bundled under the SIL Open Font License; the
license texts ship inside the package (`fonts/OFL-*.txt`). The engine never
loads system fonts or fetches from the network.

## License

MIT © Fabio Rosa
