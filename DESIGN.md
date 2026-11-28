# Design reference

How the UI of this template is built and how it looks. Two layers:

- **Part 1, Contract**: how the system works. Stays in every project forked
  from this template, whatever the palette.
- **Part 2, Identity**: the current look (colors, font, radii, feel). **Replace
  per project.**

`src/main.css` is the source of truth for every token value. This document
explains them; if the two disagree, `main.css` wins.

# Part 1: Contract

## Principles

1. **Semantic tokens only.** Use roles (`bg-surface`, `text-foreground-muted`,
   `bg-primary`), never raw palette colors, hex values or arbitrary values
   (`w-[13px]`, `text-[#333]`). Re-theming then touches `main.css` alone.
2. **Primitives before layout classes.** Compose pages from `Container`,
   `Stack`, `Section`, `PageHeader`... Reach for raw flex/spacing classes only
   when no primitive fits.
3. **Borders separate, shadows float.** Cards and sections are separated by
   1px borders; `shadow-raised` and `shadow-overlay` are reserved for elements
   that float above the page.
4. **One accent, used sparingly.** `primary` marks the main action, focus and
   the active item. Everything else is neutral (`subtle`, outline, ghost).
5. **Meaning is never color alone.** Status colors come with text or an icon,
   and every page has one `h1`, a tab title and a keyboard-visible focus.

## Tokens

### Color roles

Defined per theme as `--theme-*` variables (dark in `:root, :root.dark`, light
in `:root.light`) and exposed as `--color-*` utilities (`bg-*`, `text-*`,
`border-*`).

| Group      | Tokens                                                                                        |
| ---------- | --------------------------------------------------------------------------------------------- |
| Background | `background`, `background-muted`, `background-elevated`, `background-inverse`                 |
| Surface    | `surface` (cards, sections)                                                                   |
| Foreground | `foreground`, `foreground-muted`, `foreground-subtle`, `foreground-inverse`                   |
| Border     | `border` (hairlines), `border-strong`, `border-control` (form controls, outline)              |
| Other      | `ring` (focus outline), `scrim` (behind dialogs)                                              |
| Brand      | `primary`                                                                                     |
| Neutral    | `subtle` (secondary buttons, active nav item, hover fills), with `-foreground/-hover/-active` |
| Semantic   | `info`, `success`, `warning`, `danger`                                                        |

Brand and semantic colors share one structure of six tokens: base,
`-foreground` (text on the base), `-hover`, `-active`, `-subtle` (tinted
background) and `-subtle-foreground` (text on the tint). `subtle` has no
`-subtle` pair.

### Chart palette

`chart-1` to `chart-5` (`--theme-chart-*`) is a **categorical** palette for
data series. It is separate from `info/success/warning/danger` because those
carry meaning: a green series would read as "good". Each value keeps at least
3:1 against `background` and `surface` in both themes. See `/charts`.

### Type, radius, elevation

| Token                     | Use                                                      |
| ------------------------- | -------------------------------------------------------- |
| `font-sans`               | Inter Variable, self-hosted via `@fontsource-variable`   |
| `text-2xs` ... `text-4xl` | 10, 12, 14, 16, 18, 20, 24, 30, 36px (with line heights) |
| `rounded-control`         | 6px: buttons, fields, nav links, small icon buttons      |
| `rounded-surface`         | 8px: cards, alerts, overlays, tables                     |
| `shadow-raised`           | Small floating elements                                  |
| `shadow-overlay`          | Popovers, menus, dialogs, toasts                         |

### Focus

One global `:focus-visible` outline (2px, offset 2px) built from `ring`.
Composite controls use the `focus-outline` utility
(`focus-within:focus-outline`, `peer-focus-visible:focus-outline`), never
`ring-*`.

### Motion

Dialogs zoom in and out in 150ms (`animate-dialog-zoom-in/out`); color
transitions on controls are 200ms. `prefers-reduced-motion: reduce` collapses
all animations and transitions globally in `main.css`, including third-party
ones; do not add per-component overrides.

## Layout primitives and page patterns

| Primitive           | Use                                                                                     |
| ------------------- | --------------------------------------------------------------------------------------- |
| `Container`         | Page width: `narrow` (max-w-md), `default` (max-w-3xl), `wide` (max-w-7xl)              |
| `Stack` / `Inline`  | Vertical / wrapping horizontal flow with `gap` (`none`, `xs` to `xl`)                   |
| `Heading` / `Text`  | Typography; heading level and visual size are set separately                            |
| `PageHeader`        | The page `h1`, description, optional back link and actions                              |
| `Section`           | Titled group; `surface` makes it a bordered card; `tone="danger"` gives a danger border |
| `SettingRow`        | One setting: label and description left, control right, stacked on mobile               |
| `Divider`           | Hairline, optionally labelled                                                           |
| `EmptyState`        | Dashed-border placeholder with icon, text and an optional action                        |
| `InlineError`       | Field or section error: danger text with an icon, `role="alert"`                        |
| `DescriptionList`   | Label/value pairs, divided by hairlines                                                 |
| `Navbar`, `NavLink` | Top bar (collapses below `md`); the current page is `aria-current="page"`               |
| `SkipLink`          | First focusable element, jumps to the main content                                      |
| `AuthLayout`        | Sign-in and recovery pages (`@modules/auth`); renders the `h1` and sets the tab title   |

Page conventions:

- **Page shell**: `Container` > `Stack gap="lg" className="py-6"` >
  `PageHeader`. `<main>` adds no padding. Do not copy wrapper classes such as
  `mx-auto flex w-full flex-col gap-4 sm:max-w-sm` into routes.
- **Tab title**: `usePageTitle(t("..."))` renders "Page | App".
- **Forms and settings**: group related controls in `Section surface`; one
  setting per `SettingRow`. Buttons keep their own width (`self-end`), not
  `w-full`.
- **Form errors**: `Alert` (auth pages) or `InlineError`; after a failed
  submit, `useFocusFirstInvalid` focuses the first invalid field.
- **Danger zone**: destructive actions live in their own
  `Section surface tone="danger"` with a compact `color="danger"` button and a
  confirm `Dialog` whose Cancel is `variant="outline"`.
- **Lists over a forward-only cursor** ("Load more"): filter toolbar card,
  total, results (`Table` from `md`, cards below), `keepPreviousData` so rows
  dim while filters change, `EmptyState` with "Clear filters", and a button
  with "Showing X of Y". Reference: `UsersList`, `AuditLogsList`.
- **Buttons**: `solid` for the main action (one per view), `outline` for the
  secondary, `ghost` for tertiary. Outline and ghost are neutral; `color`
  applies to solid buttons only.

## Accessibility

- **Contrast**: text at least 4.5:1 against its background; controls (borders,
  icons that carry meaning) and chart marks at least 3:1. Check both themes.
- **Focus**: always visible (global outline); never remove it.
- **Targets**: at least 24px for links and small buttons; 44px (`size-11`) for
  icon buttons where the layout allows. Icon-only buttons need `aria-label`
  and an `aria-hidden` icon.
- **Motion**: reduced motion is honored globally (see Motion).
- **Structure**: one `h1` per page, a page title per route, a `SkipLink` in
  the shell.
- **Errors**: `role="alert"` (`Alert`, `InlineError`); never bare red text.
- **Forms**: real `label`s, `aria-*` wiring, first invalid field focused.

## Charts

`@lib/charts` provides `LineChart` and `PieChart`.

- Color series with `className="text-chart-N"`; the chart reads it through
  `currentColor`. Use the `color` prop (hex) on `PieChart` slices only when the
  color comes from data.
- Do not use `success`, `danger` and the like for series; they imply meaning.
- Always give a text alternative. `/charts` hides the chart with
  `aria-hidden` and renders an `sr-only` table with the same data.
- Known limitation: the lib has no built-in accessible name or table, so the
  caller must provide one.

## Do and don't

| Don't                                          | Do                                                      |
| ---------------------------------------------- | ------------------------------------------------------- |
| `p-[13px]`, `text-[#333]`, `bg-neutral-900`    | Semantic tokens: `p-3`, `text-foreground`, `bg-surface` |
| `focus:ring-2 ring-blue-500`                   | Global outline, or `focus-within:focus-outline`         |
| `<Button className="w-full">`                  | Let the button keep its width, `self-end` in forms      |
| `<p className="text-red-500">Invalid</p>`      | `<InlineError>` or `Alert` (`role="alert"`)             |
| `text-success` / `text-danger` for chart lines | `text-chart-1` ... `text-chart-5`                       |
| Copy `mx-auto max-w-sm ...` into a route       | `Container` (and `AuthLayout` for auth pages)           |
| `shadow-*` on a card to separate it            | A 1px `border` (`Section surface`)                      |
| Several `solid` primary buttons in one view    | One `solid`, the others `outline` or `ghost`            |
| `error.message` in the UI                      | `useApiErrorMessage(error)`                             |

## Content and i18n

- All copy lives in `public/locales/<lang>/`; `src/lib` components take text
  as props and carry no copy. Run `pnpm i18n` after adding keys.
- Tone: plain, short, action-oriented, sentence case ("Save changes", "Delete
  account"). Say what happened and what to do next; no blame, no jargon.
- API errors are shown with `useApiErrorMessage(error)` (the `errors`
  namespace), not `error.message`.

# Part 2: Identity (replace per project)

Everything below describes the template's current defaults. A fork should
rewrite this part to match its own brand; Part 1 keeps applying.

## The feel

Utilitarian and quiet, like a work tool (Linear, Vercel, GitHub).

- **Dark by default**, near-black (`neutral-950` background, `neutral-900`
  surfaces) with a mirrored light theme (white and `neutral-100`).
- **Neutral grays with no tint**; hierarchy comes from the
  `foreground`/`foreground-muted`/`foreground-subtle` steps.
- **A single saturated blue accent** (`primary`, blue-600), used only for the
  main action, focus and the active item.
- **Hairline 1px borders** instead of shadows for separation; shadows only for
  floating elements.
- **Small radii**: 6px controls, 8px surfaces.
- **Flat solid buttons**, with outline as the secondary action.
- **Inter Variable**: semibold, tight headings and 14px (`text-sm`) body in
  dense areas.
- **Left-aligned page headers** inside width-limited containers.

## Current defaults

| Setting       | Value                                                     |
| ------------- | --------------------------------------------------------- |
| Font          | Inter Variable (`@fontsource-variable/inter`)             |
| Primary       | blue-600 (hover blue-700, active blue-800), both themes   |
| Ring          | blue-400 (dark), blue-500 (light)                         |
| Radii         | `rounded-control` 0.375rem, `rounded-surface` 0.5rem      |
| Default theme | Dark; follows `prefers-color-scheme` or the stored choice |
| Chart palette | blue, orange, violet, lime, fuchsia (500/600 by theme)    |
| Brand name    | "React Vite Auth Base" (placeholder, see `pnpm rename`)   |

## Rebranding guide

Edit these places:

- `src/main.css`:
  - `--theme-primary*` (six tokens) in the dark `:root, :root.dark` block
    **and** in `:root.light`.
  - `--theme-ring` in both blocks.
  - `--font-sans`, plus the `@fontsource-variable/inter` import and the
    dependency in `package.json` if the font changes.
  - `--radius-control` and `--radius-surface`.
  - `--theme-chart-1` to `--theme-chart-5` in both blocks.
- `index.html`: `theme-color` meta (initial and the inline theme script). Keep
  `THEME_COLORS` in `src/lib/ui/hooks/use-theme` and `theme_color` /
  `background_color` in `vite.config.ts` in sync with the background.
- Brand text: the `brand` prop of `Navbar` in `src/routes/__root.tsx`, the
  `<title>` in `index.html` and the locale files in `public/locales`.
  `pnpm rename` covers the title, package name and PWA names.

After changing colors, redo these checks in **both themes**:

- Text on its background at least 4.5:1 (every `-foreground` on its base,
  `-subtle-foreground` on `-subtle`, `foreground-*` on `background`/`surface`).
- Controls (`border-control`, `ring`) and chart marks at least 3:1 against
  `background` and `surface`.
- Chart colors stay distinguishable for color-blind users: simulate the common
  deficiencies (deuteranopia, protanopia, tritanopia) and keep adjacent series
  apart, putting similar hues non-adjacent in the order of `chart-1..5`.
- Open Storybook and check the a11y addon for contrast violations.

## Adding a second accent

The system has no `secondary` color on purpose: it was removed because nothing
used it. Add one only when a product needs it. Copy this block into both
themes, adjusting the palette steps (dark steps shown; use 700/800/900 bases
and 50/700 tints in `:root.light`, as `info` does):

```css
/* in @theme inline */
--color-accent: var(--theme-accent);
--color-accent-foreground: var(--theme-accent-foreground);
--color-accent-hover: var(--theme-accent-hover);
--color-accent-active: var(--theme-accent-active);
--color-accent-subtle: var(--theme-accent-subtle);
--color-accent-subtle-foreground: var(--theme-accent-subtle-foreground);

/* in :root, :root.dark (example hue; check its contrast before use) */
--theme-accent: var(--color-fuchsia-500);
--theme-accent-foreground: var(--color-fuchsia-950);
--theme-accent-hover: var(--color-fuchsia-400);
--theme-accent-active: var(--color-fuchsia-300);
--theme-accent-subtle: var(--color-fuchsia-950);
--theme-accent-subtle-foreground: var(--color-fuchsia-200);
```

Then add a `color` variant for it in components that expose `color` (`Button`,
`Badge`, ...). Choose the hue so that it:

- is outside the semantic hues (rose, emerald, amber, sky), so it never reads
  as danger, success, warning or info;
- is far from the primary hue, so the two stay distinguishable;
- reaches at least 4.5:1 between `accent-foreground` and `accent`, in both
  themes.

## Known gaps

- Charts have no built-in accessible name; callers provide a text alternative.
- There is no `BarChart` yet.
