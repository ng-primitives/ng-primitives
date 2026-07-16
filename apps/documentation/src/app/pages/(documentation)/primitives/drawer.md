---
name: 'Drawer'
sourceUrl: 'https://github.com/ng-primitives/ng-primitives/tree/next/packages/ng-primitives/drawer'
---

# Drawer

Display modal or non-modal content that slides from an edge of the viewport and can be dismissed with a swipe gesture.

<docs-example name="drawer"></docs-example>

## Import

Import the Drawer primitives from `ng-primitives/drawer`.

```ts
import {
  NgpDrawerRoot,
  NgpDrawerTrigger,
  NgpDrawerPortal,
  NgpDrawerBackdrop,
  NgpDrawerViewport,
  NgpDrawerPopup,
  NgpDrawerTitle,
  NgpDrawerDescription,
  NgpDrawerContent,
  NgpDrawerClose,
} from 'ng-primitives/drawer';
```

## Usage

The root owns the drawer state. Place a trigger inside it, then render the overlay parts through an `ng-template` with `ngpDrawerPortal`.

```html
<ng-container ngpDrawerRoot>
  <button ngpDrawerTrigger>Open drawer</button>

  <ng-template ngpDrawerPortal>
    <div ngpDrawerBackdrop></div>
    <div ngpDrawerViewport>
      <section ngpDrawerPopup>
        <h2 ngpDrawerTitle>Drawer title</h2>
        <p ngpDrawerDescription>Additional context for the drawer.</p>
        <div ngpDrawerContent>Drawer content</div>
        <button ngpDrawerClose>Close</button>
      </section>
    </div>
  </ng-template>
</ng-container>
```

The primitive is headless. Give the backdrop and viewport a fixed or absolute position, then animate the popup with the drawer CSS custom properties and state attributes documented below.

## Examples

### Bottom position

The default swipe direction is `down`. Align the viewport content to its bottom edge and animate the popup with `--ngp-drawer-swipe-movement-y`.

<docs-example name="drawer-position"></docs-example>

### Snap points

Set `snapPoints` to a list of pixel, rem, or proportional positions. `defaultSnapPoint` controls the initial position and `snapPointChange` supports controlled state.

<docs-example name="drawer-snap-points"></docs-example>

### Nested drawers

Place another `ngpDrawerRoot` inside a drawer to create an independently focus-managed stack. Parent popups receive nested state attributes and variables for stack animations.

<docs-example name="drawer-nested"></docs-example>

### Non-modal

Set `modal` to `false` when content outside the drawer must remain interactive. `disablePointerDismissal` can prevent outside pointer presses from closing it.

<docs-example name="drawer-non-modal"></docs-example>

### Indenting application content

Wrap related roots with `ngpDrawerProvider`. Apply `ngpDrawerIndent` and `ngpDrawerIndentBackground` to surrounding content to coordinate a visual indentation effect.

<docs-example name="drawer-indent-provider"></docs-example>

### Edge swipe area

Use `ngpDrawerSwipeArea` to open a closed drawer by swiping from an edge. This is useful for navigation drawers without a persistent trigger.

<docs-example name="drawer-swipe-area"></docs-example>

### Close confirmation

Listen to `beforeOpenChange` to inspect and cancel a close request. The event exposes `cancel()` and `preventUnmount()` for guarded workflows.

<docs-example name="drawer-close-confirmation"></docs-example>

### Mobile navigation

Scrollable drawer content cooperates with swipe dismissal: an inner scroll container consumes the gesture until it reaches the dismissal edge.

<docs-example name="drawer-mobile-nav"></docs-example>

### Uncontained action sheet

The popup itself does not need a visual surface. Individual children can provide separate backgrounds, borders, and pointer behavior.

<docs-example name="drawer-uncontained"></docs-example>

### Virtual keyboard awareness

Wrap the portal with `ngpDrawerVirtualKeyboard` to publish the mobile visual viewport inset through `--ngp-drawer-keyboard-inset`.

<docs-example name="drawer-virtual-keyboard-aware"></docs-example>

## Programmatic control

Create a handle when a trigger and root do not share an injector tree, or when another service or component needs to control the drawer.

```ts
import { createDrawerHandle } from 'ng-primitives/drawer';

readonly drawer = createDrawerHandle<{ accountId: string }>();

openDrawer(): void {
  this.drawer.open({ accountId: 'account-42' });
}
```

```html
<button
  [ngpDrawerHandle]="drawer"
  [ngpDrawerPayload]="{ accountId: 'account-42' }"
  ngpDrawerTrigger
>
  Open account
</button>

<ng-container [handle]="drawer" ngpDrawerRoot>
  <!-- portal and drawer parts -->
</ng-container>
```

## API Reference

### NgpDrawerRoot

<api-docs name="NgpDrawerRoot"></api-docs>

<api-reference-props name="NgpDrawerRoot"></api-reference-props>

### NgpDrawerTrigger

<api-docs name="NgpDrawerTrigger"></api-docs>

<api-reference-props name="NgpDrawerTrigger"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-open" description="Applied when the associated drawer is open." />
  <api-attribute name="data-closed" description="Applied when the associated drawer is closed." />
  <api-attribute name="data-disabled" description="Applied when the trigger is disabled." />
</api-reference-attributes>

### NgpDrawerPortal

<api-docs name="NgpDrawerPortal"></api-docs>

<api-reference-props name="NgpDrawerPortal"></api-reference-props>

### NgpDrawerBackdrop

<api-docs name="NgpDrawerBackdrop"></api-docs>

<api-reference-props name="NgpDrawerBackdrop"></api-reference-props>

### NgpDrawerViewport

<api-docs name="NgpDrawerViewport"></api-docs>

<api-reference-props name="NgpDrawerViewport"></api-reference-props>

### NgpDrawerPopup

<api-docs name="NgpDrawerPopup"></api-docs>

<api-reference-props name="NgpDrawerPopup"></api-reference-props>

### NgpDrawerTitle

<api-docs name="NgpDrawerTitle"></api-docs>

<api-reference-props name="NgpDrawerTitle"></api-reference-props>

### NgpDrawerDescription

<api-docs name="NgpDrawerDescription"></api-docs>

<api-reference-props name="NgpDrawerDescription"></api-reference-props>

### NgpDrawerContent

<api-docs name="NgpDrawerContent"></api-docs>

<api-reference-props name="NgpDrawerContent"></api-reference-props>

### NgpDrawerClose

<api-docs name="NgpDrawerClose"></api-docs>

<api-reference-props name="NgpDrawerClose"></api-reference-props>

### NgpDrawerSwipeArea

<api-docs name="NgpDrawerSwipeArea"></api-docs>

<api-reference-props name="NgpDrawerSwipeArea"></api-reference-props>

### NgpDrawerSwipeIgnore

<api-docs name="NgpDrawerSwipeIgnore"></api-docs>

Apply this directive to controls whose pointer movement must not start or continue a drawer swipe, such as sliders and custom drag handles.

### NgpDrawerProvider

<api-docs name="NgpDrawerProvider"></api-docs>

<api-reference-props name="NgpDrawerProvider"></api-reference-props>

### NgpDrawerIndent

<api-docs name="NgpDrawerIndent"></api-docs>

<api-reference-props name="NgpDrawerIndent"></api-reference-props>

### NgpDrawerIndentBackground

<api-docs name="NgpDrawerIndentBackground"></api-docs>

<api-reference-props name="NgpDrawerIndentBackground"></api-reference-props>

### NgpDrawerVirtualKeyboard

<api-docs name="NgpDrawerVirtualKeyboard"></api-docs>

<api-reference-props name="NgpDrawerVirtualKeyboard"></api-reference-props>

## State attributes

State attributes are distributed across the relevant trigger, backdrop, viewport, popup, content, provider, and indent elements.

<api-reference-attributes>
  <api-attribute name="data-open" description="Applied while the drawer is open." />
  <api-attribute name="data-closed" description="Applied while the drawer is closed." />
  <api-attribute name="data-starting-style" description="Applied during the opening transition's initial frame." />
  <api-attribute name="data-ending-style" description="Applied while the closing transition runs." />
  <api-attribute name="data-expanded" description="Applied when the active snap point is fully expanded." />
  <api-attribute name="data-nested" description="Applied when the drawer is nested inside another drawer." />
  <api-attribute name="data-nested-drawer-open" description="Applied while a descendant drawer is open." />
  <api-attribute name="data-nested-drawer-swiping" description="Applied while a descendant drawer is being swiped." />
  <api-attribute name="data-swipe-dismiss" description="Applied when the current gesture will dismiss the drawer." />
  <api-attribute name="data-swipe-direction" description="The configured swipe direction." value="up | down | left | right" />
  <api-attribute name="data-swiping" description="Applied during an active swipe gesture." />
  <api-attribute name="data-disabled" description="Applied when an interactive part is disabled." />
  <api-attribute name="data-active" description="Applied to provider indentation parts while a drawer is active." />
  <api-attribute name="data-inactive" description="Applied to provider indentation parts when no drawer is active." />
  <api-attribute name="data-ngp-drawer-swipe-ignore" description="Marks an element whose pointer movement should be ignored by swipe handling." />
</api-reference-attributes>

## CSS custom properties

<api-reference-css-vars>
  <api-css-var name="--ngp-drawer-swipe-movement-x" description="Current horizontal swipe displacement in pixels." />
  <api-css-var name="--ngp-drawer-swipe-movement-y" description="Current vertical swipe displacement in pixels." />
  <api-css-var name="--ngp-drawer-swipe-progress" description="Normalized swipe progress from 0 to 1." />
  <api-css-var name="--ngp-drawer-swipe-strength" description="Velocity-derived strength used to tune release animation duration." />
  <api-css-var name="--ngp-drawer-snap-point-offset" description="Offset of the active snap point from the expanded position." />
  <api-css-var name="--ngp-drawer-nested-drawers" description="Number of open descendant drawers." />
  <api-css-var name="--ngp-drawer-height" description="Measured height used while animating nested drawers." />
  <api-css-var name="--ngp-drawer-frontmost-height" description="Height of the frontmost drawer in a nested stack." />
  <api-css-var name="--ngp-drawer-keyboard-inset" description="Inset occupied by the mobile virtual keyboard." />
</api-reference-css-vars>

## Accessibility

The popup receives `role="dialog"` by default. `NgpDrawerTitle` and `NgpDrawerDescription` register their IDs with the popup so `aria-labelledby` and `aria-describedby` remain synchronized as content changes.

Modal drawers isolate background content and manage focus. Set `modal="trap-focus"` to trap focus without applying full modal isolation, or `modal="false"` for a non-modal drawer. Always provide a visible or accessible close control.

### Keyboard interactions

- <kbd>Enter</kbd> or <kbd>Space</kbd>: Open the drawer from a trigger.
- <kbd>Escape</kbd>: Close the frontmost dismissible drawer.
- <kbd>Tab</kbd>: Move through focusable content inside a modal drawer.
- <kbd>Shift</kbd> + <kbd>Tab</kbd>: Move backward through focusable content.

Pointer and touch gestures respect nested scrolling. Add `ngpDrawerSwipeIgnore` to interactive regions that must retain direct gesture ownership.
