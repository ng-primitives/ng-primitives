# Documentation Example Styling

Applies to the documentation primitive examples under
`apps/documentation/src/app/examples/**`. These render in the docs site and are
the copy-paste reference consumers use, so they must look polished and stay
internally consistent. The aesthetic is restrained and modern - clean surfaces,
tight typography - built around our red brand.

Most primitives ship **two variants** that must stay visually identical:

- `<name>.example.ts` - styling in the component `styles` block using the
  `--ngp-*` theme tokens.
- `<name>.tailwind.example.ts` - the same look with Tailwind classes.

Change both together. The theme tokens live in
`packages/ng-primitives/example-theme/index.css`; extend there rather than
hardcoding, except for the brand hex literals noted below in Tailwind.

## Colour: red is for STATE, blue is for FOCUS

This is the most important rule. The brand red is **reserved** - it is not a
decorative or focus colour.

**Brand red** (`--ngp-primary` = `#f01e2b` light / `#ff4651` dark) is used only
for state and primary intent:

- checked / selected / indeterminate (checkbox, radio dot, switch on, menu
  checkbox & radio indicators, selected select/combobox/listbox option)
- active (tab underline, current pagination page, active toggle / toggle-group
  / toolbar item)
- value fills (slider & range-slider range, progress, meter)
- primary action buttons (the one filled CTA)
- date-picker today + selected day, and the in-range tint
- the active drag-over target (file upload / dropzone)

In Tailwind use the hex literals `#f01e2b` / `dark:#ff4651` (no `--ngp-primary`
token there).

**Focus rings are blue, never red.** A red ring on a text input reads as a
validation error. Use `--ngp-focus-ring` in CSS and `blue-500` (light) /
`blue-400` (dark) in Tailwind for every `:focus`, `[data-focus]`,
`[data-focus-visible]`, `:focus-within`, and the input-otp active slot + caret.

```css
/* ✅ focus = blue, state = red */
[ngpCheckbox][data-focus-visible] {
  box-shadow: 0 0 0 2px var(--ngp-focus-ring);
}
[ngpCheckbox][data-checked] {
  background-color: var(--ngp-primary);
}

/* ❌ red focus ring - looks invalid */
[ngpInput]:focus {
  outline: 2px solid var(--ngp-primary);
}
```

**Never use off-palette accents.** No `--ngp-text-blue`, `--ngp-background-blue`,
`--ngp-border-blue`, `--ngp-background-success`, `--ngp-text-red`, or Tailwind
`blue-*` / `green-*` for accents - they predate the brand pass. Don't invert to
solid black/white (`--ngp-background-inverse`) for a selected state; use the red
accent (filled, or a 1.5px inset ring) on a light surface instead.

## Menu / option focus = background highlight, not an outline

Menu items, context-menu items, select / combobox options, and listbox options
indicate the hovered or keyboard-active item with a **background**, never an
outline ring (an outline shows on open in Safari and looks wrong):

```css
[ngpMenuItem][data-hover],
[ngpMenuItem][data-focus-visible] {
  background-color: var(--ngp-background-hover);
}
[ngpMenuItem][data-press] {
  background-color: var(--ngp-background-active);
}
```

Add `outline: none` to the menu/dropdown panel. Mark the selected option with
the brand red (a check icon and/or 510-weight text). Mute submenu chevrons to
`--ngp-text-tertiary`.

## Typography

- Weights: medium = `510`, semibold = `590` (use these literals, not 500/600).
- Negative letter-spacing: body & controls `-0.006em`; small captions
  `-0.011em`; titles & form labels `-0.014em`; large display `-0.021em`.
- Set explicit `color: var(--ngp-text-primary)` and `font-size` on inputs and
  option rows rather than relying on inherited values (they can break in dark).
- Use the right text tier: `--ngp-text-primary` for headings, values and the
  selected item; `--ngp-text-secondary` for body and descriptions;
  `--ngp-text-tertiary` for placeholders, metadata and muted icons;
  `--ngp-text-disabled` for disabled content.

## Spacing

Space on an 8px base. Common steps are 4, 6, 8, 12, 16 and 24px - keep padding
and gaps on this scale so controls align across examples. `0.4375rem` (7px) is
fine for the occasional optical adjustment.

## Radii & surfaces

- Controls (buttons, inputs, triggers, day cells): `0.5rem`-`0.625rem`.
- Dropdown / menu panels `0.625rem`-`0.75rem`; option rows `0.375rem`-`0.5rem`.
- Dialogs / modals: `0.875rem`. Pills/chips `9999px`; icon buttons/avatars `50%`.
- Dark panels: `--ngp-background` in CSS; in Tailwind `dark:bg-zinc-950` +
  `dark:border-zinc-800` (not `dark:bg-black` / `dark:border-gray-700`).
- Depth on dark: drop shadows are nearly invisible on dark surfaces - convey
  elevation with a hairline border (`--ngp-border`) and a one-step lighter
  background, not a heavier shadow.

## States

- Interactive controls expose the full set: hover, keyboard focus and pressed.
  Hover = `--ngp-background-hover`; pressed/active = `--ngp-background-active`
  (one step darker). For menu/option rows, keyboard focus shares the hover
  background (see above); elsewhere focus is the blue ring.
- Disabled: `color: var(--ngp-text-disabled)`, `cursor: not-allowed`, no
  hover/press response; mute the surface rather than removing it.
- Default transition for colour and state changes: ~150ms
  `cubic-bezier(0.4, 0, 0.2, 1)`.

## Buttons

- Standard size: `2.125rem` (34px) height, `510` weight, `-0.006em` tracking,
  `0.5rem`-`0.625rem` radius. CTA horizontal padding `~0.625rem`; footer/action
  buttons `~0.875rem`.
- **Primary** = filled `var(--ngp-primary)` + `var(--ngp-primary-text)`, hover
  `var(--ngp-primary-hover)`.
- **Secondary** = neutral surface with a _subtle_ hairline shadow, not the heavy
  `--ngp-button-shadow`:
  `box-shadow: inset 0 0 0 1px var(--ngp-border), 0 1px 2px 0 rgba(0,0,0,0.04);`
- A dialog footer pairs one secondary + one filled primary (not two secondaries).

## Overlays & animation

- Dialog overlays need `z-index: 1000` (CSS) / `z-[1000]` (Tailwind) so the
  backdrop sits above the docs navbar.
- Avoid keyframe `animation` on an element that promotes to its own compositing
  layer and then ends - Safari snaps it to a sub-pixel position on completion
  (e.g. a checkmark drifting after it appears). Prefer transitions, opacity-only
  reveals, or no entrance animation for icons that settle into place. Infinite
  animations (typing dots, spinners) are fine. Keep entrance motion calm:
  ease-out, ~120-180ms, no scale overshoot past 1.

## Process

- Restart the Vite dev server after editing example/markdown files - it caches
  globs and markdown.
- Use `ng-icon` for icons (never inline `<img>`/SVG for a glyph).
