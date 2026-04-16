---
name: 'Context Menu'
sourceUrl: 'https://github.com/ng-primitives/ng-primitives/tree/next/packages/ng-primitives/context-menu'
---

# Context Menu

A context menu displays a list of actions or options triggered by a right-click or long-press on an element.

<docs-example name="context-menu"></docs-example>

## Import

Import the Context Menu primitives from `ng-primitives/context-menu`.

```ts
import {
  NgpContextMenu,
  NgpContextMenuItem,
  NgpContextMenuTrigger,
  NgpContextMenuSubmenuTrigger,
  NgpContextMenuItemCheckbox,
  NgpContextMenuItemRadioGroup,
  NgpContextMenuItemRadio,
  NgpContextMenuItemIndicator,
} from 'ng-primitives/context-menu';
```

## Usage

Assemble the context menu directives in your template.

```html
<div [ngpContextMenuTrigger]="menu">Right-click me</div>

<ng-template #menu>
  <div ngpContextMenu>
    <button ngpContextMenuItem>Cut</button>
    <button ngpContextMenuItem>Copy</button>
    <button ngpContextMenuItem>Paste</button>
  </div>
</ng-template>
```

## Reusable Component

Create reusable components that use the `NgpContextMenu` directive.

<docs-snippet name="context-menu"></docs-snippet>

## Examples

Here are some additional examples of how to use the Context Menu primitives.

### Submenu

The context menu can contain submenus, which are nested menus that can be opened by hovering on a menu item.

<docs-example name="context-menu-submenu"></docs-example>

## API Reference

The following directives are available to import from the `ng-primitives/context-menu` package:

### NgpContextMenuTrigger

<api-docs name="NgpContextMenuTrigger"></api-docs>

<api-reference-props name="NgpContextMenuTrigger"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-open" description="Applied when the context menu is open." />
</api-reference-attributes>

### NgpContextMenu

<api-docs name="NgpContextMenu"></api-docs>

<api-reference-props name="NgpContextMenu"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-enter" description="Applied when the menu is being added to the DOM. This can be used to trigger animations." />
  <api-attribute name="data-exit" description="Applied when the menu is being removed from the DOM. This can be used to trigger animations." />
  <api-attribute name="data-placement" description="The final rendered placement of the menu." />
</api-reference-attributes>

<api-reference-css-vars>
  <api-css-var name="--ngp-menu-transform-origin" description="The transform origin of the menu for animations." />
  <api-css-var name="--ngp-menu-trigger-width" description="The width of the trigger element." />
  <api-css-var name="--ngp-menu-available-width" description="The available width of the menu before it overflows the viewport." />
  <api-css-var name="--ngp-menu-available-height" description="The available height of the menu before it overflows the viewport." />
</api-reference-css-vars>

### NgpContextMenuItem

<api-docs name="NgpContextMenuItem"></api-docs>

<api-reference-props name="NgpContextMenuItem"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-disabled" description="Applied when the item is disabled." />
</api-reference-attributes>

### NgpContextMenuSubmenuTrigger

<api-docs name="NgpContextMenuSubmenuTrigger"></api-docs>

<api-reference-props name="NgpContextMenuSubmenuTrigger"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-open" description="Applied when the submenu is open." />
</api-reference-attributes>

### NgpContextMenuItemCheckbox

<api-docs name="NgpContextMenuItemCheckbox"></api-docs>

<api-reference-props name="NgpContextMenuItemCheckbox"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-checked" description="Applied when the checkbox item is checked." />
  <api-attribute name="data-disabled" description="Applied when the checkbox item is disabled." />
</api-reference-attributes>

### NgpContextMenuItemRadioGroup

<api-docs name="NgpContextMenuItemRadioGroup"></api-docs>

<api-reference-props name="NgpContextMenuItemRadioGroup"></api-reference-props>

### NgpContextMenuItemRadio

<api-docs name="NgpContextMenuItemRadio"></api-docs>

<api-reference-props name="NgpContextMenuItemRadio"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-checked" description="Applied when the radio item is checked." />
  <api-attribute name="data-disabled" description="Applied when the radio item is disabled." />
</api-reference-attributes>

### NgpContextMenuItemIndicator

<api-docs name="NgpContextMenuItemIndicator"></api-docs>

<api-reference-props name="NgpContextMenuItemIndicator"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-checked" description="Applied when the parent checkbox or radio is checked." />
</api-reference-attributes>

## Styling

For the context menu to be positioned correctly relative to the cursor, it should use fixed positioning. For example, you can use the following CSS:

```css
[ngpContextMenu] {
  position: fixed;
}
```

## Animations

The `ngpContextMenu` primitive adds a CSS custom property `--ngp-menu-transform-origin` to the element that can be used to animate the menu from the cursor position.

The `ngpContextMenu` will also add the `data-enter` and `data-exit` attributes to the element when it is being added or removed from the DOM. This can be used to trigger animations.

```css
[ngpContextMenu][data-enter] {
  animation: fade-in 0.2s ease-in-out;
}

[ngpContextMenu][data-exit] {
  animation: fade-out 0.2s ease-in-out;
}
```

## Global Configuration

You can configure the default options for all context menus in your application by using the `provideContextMenuConfig` function in a providers array.

```ts
import { provideContextMenuConfig } from 'ng-primitives/context-menu';

bootstrapApplication(AppComponent, {
  providers: [
    provideContextMenuConfig({
      offset: 2,
      flip: true,
      container: document.body,
      scrollBehavior: 'close',
    }),
  ],
});
```

### NgpContextMenuConfig

<api-reference-config name="NgpContextMenuConfig"></api-reference-config>

## Accessibility

Adheres to the [WAI-ARIA Menu Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menu/).

### Keyboard Interactions

| Key                   | Description                                                                                    |
| --------------------- | ---------------------------------------------------------------------------------------------- |
| <kbd>Enter</kbd>      | Activates the focused menu item. Closes all menus unless the item is a checkbox or radio item. |
| <kbd>Escape</kbd>     | Closes all open menus.                                                                         |
| <kbd>ArrowDown</kbd>  | Moves focus to the next menu item.                                                             |
| <kbd>ArrowUp</kbd>    | Moves focus to the previous menu item.                                                         |
| <kbd>ArrowRight</kbd> | Opens a submenu when focused on a submenu trigger.                                             |
| <kbd>ArrowLeft</kbd>  | Closes the current submenu and moves focus to the parent submenu trigger.                      |
| <kbd>Home</kbd>       | Moves focus to the first menu item.                                                            |
| <kbd>End</kbd>        | Moves focus to the last menu item.                                                             |
