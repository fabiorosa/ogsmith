import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { blogPost, getTheme } from "ogsmith";

// The engine worker cannot exist in jsdom; the store talks to this mock.
const renderSvg = vi.fn(() =>
  Promise.resolve('<svg width="1200" height="630"></svg>'),
);
vi.mock("./engine/client", () => ({
  getEngine: () => ({
    ready: () => Promise.resolve(),
    renderSvg,
    exportPng: () => Promise.resolve(new ArrayBuffer(8)),
  }),
}));

import { App } from "./App";
import { useStudio } from "./store";
import { decodeState, encodeState } from "./urlState";
import { resolveTheme } from "./theme";

beforeEach(() => {
  location.hash = "";
  useStudio.setState({
    screen: "gallery",
    templateId: null,
    props: {},
    themeName: "graphite",
    accent: null,
    engineStatus: "ready",
    renderStatus: "idle",
    svg: null,
    exportStatus: "idle",
  });
  renderSvg.mockClear();
});

describe("gallery", () => {
  it("shows one card per registered template", async () => {
    render(<App />);
    expect(
      await screen.findByRole("button", { name: /blog post sample render/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Product launch")).toBeInTheDocument();
    expect(screen.getByText("Release banner")).toBeInTheDocument();
    expect(screen.getByText("Quote card")).toBeInTheDocument();
  });
});

describe("editor form generation", () => {
  it("opens a template and renders one control per schema field", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(
      await screen.findByRole("button", { name: /blog post sample render/i }),
    );

    for (const meta of Object.values(blogPost.fields)) {
      expect(screen.getByLabelText(meta.label)).toBeInTheDocument();
    }
    expect(screen.getByRole("radiogroup", { name: "Theme" })).toBeInTheDocument();
    await waitFor(() => {
      expect(renderSvg).toHaveBeenCalled();
    });
  });

  it("editing a field triggers a debounced re-render", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(
      await screen.findByRole("button", { name: /blog post sample render/i }),
    );
    const title = screen.getByLabelText("Title");
    await user.clear(title);
    await user.type(title, "Hello");
    await waitFor(() => {
      const call = renderSvg.mock.calls.at(-1) as unknown[] | undefined;
      expect(call?.[1]).toMatchObject({ title: "Hello" });
    });
  });
});

describe("shareable URL state", () => {
  it("round-trips template, theme, accent, and props", () => {
    const state = {
      templateId: "blog-post",
      themeName: "midnight" as const,
      accent: "#aabbcc",
      props: { ...blogPost.sample, title: "Round trip" },
    };
    const decoded = decodeState(`#${encodeState(state)}`);
    expect(decoded).toEqual(state);
  });

  it("returns null for garbage or stale hashes", () => {
    expect(decodeState("#not-base64!!!")).toBeNull();
    expect(decodeState("")).toBeNull();
    const unknownTemplate = encodeState({
      templateId: "does-not-exist",
      themeName: "graphite",
      accent: null,
      props: {},
    });
    expect(decodeState(`#${unknownTemplate}`)).toBeNull();
  });
});

describe("custom accent guard", () => {
  it("keeps the built-in theme untouched without a custom accent", () => {
    const { theme, accentWarning } = resolveTheme("graphite", null);
    expect(theme).toEqual(getTheme("graphite"));
    expect(accentWarning).toBeNull();
  });

  it("warns when a custom accent cannot reach AA", () => {
    // Mid-gray accent: no ink color reaches 4.5:1 on it.
    const { accentWarning } = resolveTheme("graphite", "#757575");
    expect(accentWarning).toMatch(/below AA/);
  });

  it("stays silent for a compliant accent", () => {
    const { theme, accentWarning } = resolveTheme("graphite", "#ffd166");
    expect(accentWarning).toBeNull();
    expect(theme.tokens.accent).toBe("#ffd166");
  });
});
