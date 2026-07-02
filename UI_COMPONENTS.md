# UI Components Roadmap

Tracks the UI components to be built for this template. Components are
grouped by priority based on how broadly they apply to generic frontend
projects.

Already implemented: `Alert`, `Avatar`, `Badge`, `Breadcrumb`, `Button`, `Checkbox`, `Dialog`,
`DropdownMenu`, `OptionList`, `Pagination`, `Portal`, `RadioGroup`, `Select`, `Skeleton`,
`Spinner`, `Switch`, `Table`, `Tabs`, `Textarea`, `TextInput`, `Toast`, `Tooltip`.

---

## High Priority

Components that appear in nearly every application regardless of domain.

- [x] **Tooltip** — Contextual label shown on hover or focus. Essential for
      icon-only buttons and truncated text where a visible label would clutter
      the UI. Pairs with the existing `Button` and any icon usage.

- [x] **Avatar** — Displays a user's photo or initials as a fallback. Directly
      relevant to this template given its auth-base nature; appears in navbars,
      comment threads, and profile menus.

- [x] **Switch / Toggle** — Boolean on/off control with a distinct visual
      affordance. Complements the existing `Checkbox` for settings and
      preference panels where the immediate effect matters more than form
      submission.

- [x] **Dropdown Menu** — Contextual action menu anchored to a trigger element
      (e.g. "⋯" overflow button, user avatar). Needed for destructive or
      secondary actions that should not take up permanent space in the UI.

- [x] **Tabs** — Horizontal navigation between sibling content sections within
      a page. Reduces the need for separate routes for closely related views and
      is one of the most common layout patterns in dashboards and settings pages.

---

## Medium Priority

Components that arise in most projects once the initial screens are in place.

- [x] **Radio Group** — Mutually exclusive selection among a small set of
      visible options. Distinct from `Select` in that all choices are always
      visible, which suits low-count options in forms and filter panels.

- [x] **Textarea** — Multi-line text field. Extends the existing `TextInput`
      for comments, descriptions, and other free-form long-text inputs.

- [x] **Alert / Banner** — Inline feedback for errors, warnings, info, and
      success states. Complements `Toast` (ephemeral, floating) with persistent,
      in-context feedback anchored to the relevant section of the page.

- [x] **Breadcrumb** — Hierarchical location indicator. Useful for templates
      that use nested routes (TanStack Router is already in place) and helps
      users orient themselves inside deep navigation trees.

- [x] **Table** — Structured data display with header, rows, and optional
      sorting indicators. The single most common data-presentation pattern in
      admin and dashboard interfaces.

- [x] **Pagination** — Page controls for large datasets. Almost always paired
      with `Table`; also applies to card grids and search results.

---

## Low Priority

Components that address specific interaction patterns common in dashboards and
content-heavy applications.

- [ ] **Accordion** — Collapsible content sections. Useful for FAQs, long
      settings pages, and mobile-friendly layouts where vertical space is limited.

- [ ] **Progress Bar** — Visual indicator of task or upload completion. Needed
      for any operation that takes measurable time and should be reflected in the
      UI beyond a spinner.

- [ ] **Card** — Semantic container that groups related content with a
      consistent visual boundary. Provides a reusable layout primitive for feeds,
      dashboards, and product listings.

- [ ] **Popover** — Floating panel anchored to a trigger, containing rich or
      interactive content. Extends `Tooltip` for cases where a plain text label
      is not enough (e.g. date pickers, filter forms, preview panels).
