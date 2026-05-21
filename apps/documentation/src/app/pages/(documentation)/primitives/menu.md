---
name: 'Menu'
sourceUrl: 'https://github.com/ng-primitives/ng-primitives/tree/next/packages/ng-primitives/menu'
---

# Menu

A menu is a list of options or commands presented to the user in a dropdown list.

<docs-example name="menu"></docs-example>

## Import

Import the Menu primitives from `ng-primitives/menu`.

```ts
import {
  NgpMenu,
  NgpMenuItem,
  NgpMenuTrigger,
  NgpSubmenuTrigger,
  NgpMenuItemCheckbox,
  NgpMenuItemRadioGroup,
  NgpMenuItemRadio,
  NgpMenuItemIndicator,
} from 'ng-primitives/menu';
```

## Usage

Assemble the menu directives in your template.

```html
<button [ngpMenuTrigger]="menu" ngpButton></button>

<ng-template #menu>
  <div ngpMenu>
    <button ngpMenuItem>Item 1</button>
    <button ngpMenuItem>Item 2</button>
    <button ngpMenuItem>Item 3</button>
  </div>
</ng-template>
```

## Reusable Component

Create reusable components that use the `NgpMenu` directive.

<docs-snippet name="menu"></docs-snippet>

## Schematics

Generate a reusable menu component using the Angular CLI.

```bash npm
ng g ng-primitives:primitive menu
```

### Options

- `path`: The path at which to create the component file.
- `prefix`: The prefix to apply to the generated component selector.
- `component-suffix`: The suffix to apply to the generated component class name.
- `file-suffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `example-styles`: Whether to include example styles in the generated component file. Defaults to `true`.

## Examples

Here are some additional examples of how to use the Menu primitives.

### Submenu

The menu can contain submenus, which are nested menus that can be opened by hovering on a menu item.

<docs-example name="submenu"></docs-example>

### Checkbox Items

Menu items that can be toggled on and off. Clicking a checkbox item does not close the menu.

<docs-example name="menu-checkbox"></docs-example>

### Radio Items

Menu items that allow selecting one option from a group. Clicking a radio item does not close the menu.

<docs-example name="menu-radio"></docs-example>

### Custom Offset

You can customize the offset using either a simple number or an object for more precise control:

```html
<!-- Simple number offset -->
<button [ngpMenuTrigger]="menu" ngpMenuTriggerOffset="12">Menu with 12px offset</button>

<!-- Object offset for precise control -->
<button
  [ngpMenuTrigger]="menu"
  [ngpMenuTriggerOffset]="{mainAxis: 8, crossAxis: 4, alignmentAxis: 2}"
>
  Menu with custom offset
</button>
```

### Custom Shift

You can customize the shift behavior to control how the menu stays within the viewport:

```html
<!-- Disable shift -->
<button [ngpMenuTrigger]="menu" [ngpMenuTriggerShift]="false">Menu without shift</button>

<!-- Object shift for precise control -->
<button [ngpMenuTrigger]="menu" [ngpMenuTriggerShift]="{padding: 8}">
  Menu with custom shift padding
</button>
```

### Keyboard Triggers

Enable keyboard triggers to allow users to open menus using Enter or arrow keys:

```html
<!-- Enable Enter key to toggle menu -->
<button [ngpMenuTrigger]="menu" [ngpMenuTriggerOpenTriggers]="['click', 'enter']">Menu</button>

<!-- Enable arrow keys (placement-aware) -->
<button
  [ngpMenuTrigger]="menu"
  [ngpMenuTriggerOpenTriggers]="['arrowkey']"
  ngpMenuTriggerPlacement="right-start"
>
  Sidebar Menu
</button>

<!-- Combine triggers for best UX -->
<button
  [ngpMenuTrigger]="menu"
  [ngpMenuTriggerOpenTriggers]="['hover', 'arrowkey', 'enter']"
  ngpMenuTriggerPlacement="right-start"
>
  Navigation Item
</button>
```

#### Keyboard Trigger Behavior

**Enter Key:**

- Toggles menu (opens if closed, closes if open)
- Only works when trigger is focused
- Useful for keyboard-only navigation

**Arrow Keys:**

- Placement-aware: Only responds to arrows matching menu direction
  - `bottom-*` placement: ArrowDown opens
  - `top-*` placement: ArrowUp opens
  - `right-*` placement: ArrowRight opens (ArrowLeft in RTL)
  - `left-*` placement: ArrowLeft opens (ArrowRight in RTL)
- Automatically respects RTL text direction
- Only works when trigger is focused
- Perfect for sidebar/navigation menus

## API Reference

The following directives are available to import from the `ng-primitives/menu` package:

### NgpMenuTrigger

<api-docs name="NgpMenuTrigger"></api-docs>

<api-reference-props name="NgpMenuTrigger"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-open" description="Applied when the menu is open." />
</api-reference-attributes>

### NgpMenu

<api-docs name="NgpMenu"></api-docs>

<api-reference-props name="NgpMenu"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-enter" description="Applied when the menu is being added to the DOM. This can be used to trigger animations." />
  <api-attribute name="data-exit" description="Applied when the menu is being removed from the DOM. This can be used to trigger animations." />
  <api-attribute name="data-placement" description="The final rendered placement of the menu." />
  <api-attribute name="data-instant" description="Applied when switching menus within the cooldown period. Use this to skip animations for instant transitions between menu changes." />
</api-reference-attributes>

<api-reference-css-vars>
  <api-css-var name="--ngp-menu-transform-origin" description="The transform origin of the menu for animations." />
  <api-css-var name="--ngp-menu-trigger-width" description="The width of the trigger element." />
  <api-css-var name="--ngp-menu-available-width" description="The available width of the menu before it overflows the viewport." />
  <api-css-var name="--ngp-menu-available-height" description="The available height of the menu before it overflows the viewport." />
</api-reference-css-vars>

### NgpMenuItem

<api-docs name="NgpMenuItem"></api-docs>

<api-reference-props name="NgpMenuItem"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-disabled" description="Applied when the item is disabled." />
</api-reference-attributes>

### NgpSubmenuTrigger

<api-docs name="NgpSubmenuTrigger"></api-docs>

<api-reference-props name="NgpSubmenuTrigger"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-open" description="Applied when the submenu is open." />
</api-reference-attributes>

### NgpMenuItemCheckbox

<api-docs name="NgpMenuItemCheckbox"></api-docs>

<api-reference-props name="NgpMenuItemCheckbox"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-checked" description="Applied when the checkbox item is checked." />
  <api-attribute name="data-disabled" description="Applied when the checkbox item is disabled." />
</api-reference-attributes>

### NgpMenuItemRadioGroup

<api-docs name="NgpMenuItemRadioGroup"></api-docs>

<api-reference-props name="NgpMenuItemRadioGroup"></api-reference-props>

### NgpMenuItemRadio

<api-docs name="NgpMenuItemRadio"></api-docs>

<api-reference-props name="NgpMenuItemRadio"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-checked" description="Applied when the radio item is checked." />
  <api-attribute name="data-disabled" description="Applied when the radio item is disabled." />
</api-reference-attributes>

### NgpMenuItemIndicator

<api-docs name="NgpMenuItemIndicator"></api-docs>

<api-reference-props name="NgpMenuItemIndicator"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-checked" description="Applied when the parent checkbox or radio is checked." />
</api-reference-attributes>

## Styling

For the menu to be positioned correctly relative to the trigger element, it should use fixed positioning. For example, you can use the following CSS:

```css
[ngpMenu] {
  position: fixed;
}
```

## Animations

The `ngpMenu` primitive adds a CSS custom property `--ngp-menu-transform-origin` to the element that can be used to animate the menu from the trigger element.

The `ngpMenu` will also add the `data-enter` and `data-exit` attributes to the element when it is being added or removed from the DOM. This can be used to trigger animations.

```css
:host[data-enter] {
  animation: fade-in 0.2s ease-in-out;
}

:host[data-exit] {
  animation: fade-out 0.2s ease-in-out;
}
```

When using the `cooldown` option to allow quick switching between menus, the `data-instant` attribute is applied. Use this to skip animations for instant transitions:

```css
:host[data-instant][data-enter],
:host[data-instant][data-exit] {
  animation: none;
}
```

## Global Configuration

You can configure the default options for all menus in your application by using the `provideMenuConfig` function in a providers array.

```ts
import { provideMenuConfig } from 'ng-primitives/menu';

bootstrapApplication(AppComponent, {
  providers: [
    provideMenuConfig({
      offset: 4,
      placement: 'top',
      flip: true,
      container: document.body,
      scrollBehavior: 'reposition',
      cooldown: 0,
    }),
  ],
});
```

### NgpMenuConfig

<api-reference-config name="NgpMenuConfig"></api-reference-config>

## Accessibility

Adheres to the [WAI-ARIA Menu Button Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/).

### Keyboard Interactions

| Key                   | Description                                                                                    |
| --------------------- | ---------------------------------------------------------------------------------------------- |
| <kbd>Enter</kbd>      | Activates the focused menu item. Closes all menus unless the item is a checkbox or radio item. |
| <kbd>Escape</kbd>     | Closes all open menus and returns focus to the root menu trigger.                              |
| <kbd>ArrowDown</kbd>  | Moves focus to the next menu item.                                                             |
| <kbd>ArrowUp</kbd>    | Moves focus to the previous menu item.                                                         |
| <kbd>ArrowRight</kbd> | Opens a submenu when focused on a submenu trigger.                                             |
| <kbd>ArrowLeft</kbd>  | Closes the current submenu and moves focus to the parent submenu trigger.                      |
| <kbd>Home</kbd>       | Moves focus to the first menu item.                                                            |
| <kbd>End</kbd>        | Moves focus to the last menu item.                                                             |

### Focus Management

- Focus is always trapped within the menu when open (Tab key does not leave the menu).
- When a menu is opened via keyboard, the first menu item receives visible focus (`:focus-visible`).
- When a menu is opened via mouse, focus moves into the menu but without the visible focus ring until arrow keys are used.
- Closing all menus (via Escape or item selection) returns focus to the root menu trigger.
