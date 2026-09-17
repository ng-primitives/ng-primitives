# Documentation Page Structure

Applies to the docs pages under
`apps/documentation/src/app/pages/(documentation)/**`. Readers move between
primitives constantly, so every page must put the same section in the same
place. The `documentation` generator emits this skeleton already - keep it when
you add sections by hand.

## Canonical section order

Top-level (`##`) sections appear in this order:

1. `Import`
2. `Usage`
3. `Reusable Component`
4. `Schematics`
5. `Examples`
6. `API Reference`
7. `Styling`
8. `Animations`
9. `Global Configuration`
10. `Accessibility`

Every section is optional - a primitive with no config provider has no
`Global Configuration`. Omitting one is fine; reordering the ones you do have is
not. `Accessibility` is always last.

```md
<!-- ✅ -->

## Schematics

## Examples

## API Reference

## Global Configuration

## Accessibility

<!-- ❌ Examples below API Reference, Accessibility not last -->

## API Reference

## Examples

## Accessibility

## Global Configuration
```

## Page-specific sections

Sections outside the canonical list (`Features`, `Color values`, `Grouping
Collapsibles`) are fine. Place them by what they are:

- Explanatory or example-style content goes **before** `API Reference`, in the
  `Examples` slot.
- Never split `API Reference` from the reference tail that follows it -
  `API Reference` → `Styling` → `Animations` → `Global Configuration` →
  `Accessibility` stays contiguous.

Prefer an `###` subsection under `Examples` to a new `##` when the content is
just another example.

## One heading per section

A page gets at most one `## Examples` (and one of every other section). Add
examples as `###` subsections of the existing block rather than opening a second
one further down the page.
