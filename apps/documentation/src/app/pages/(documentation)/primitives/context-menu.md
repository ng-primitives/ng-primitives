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

#### Data Attributes

The following data attributes are available on the `NgpContextMenuTrigger` directive:

| Attribute   | Description                            |
| ----------- | -------------------------------------- |
| `data-open` | Applied when the context menu is open. |

### NgpContextMenu

<api-docs name="NgpContextMenu"></api-docs>

#### Data Attributes

The following data attributes are available on the `NgpContextMenu` directive:

| Attribute        | Description                                                                                  |
| ---------------- | -------------------------------------------------------------------------------------------- |
| `data-enter`     | Applied when the menu is being added to the DOM. This can be used to trigger animations.     |
| `data-exit`      | Applied when the menu is being removed from the DOM. This can be used to trigger animations. |
| `data-placement` | The final rendered placement of the menu.                                                    |

The following CSS custom properties are applied to the `ngpContextMenu` directive:

| Property                      | Description                                                        |
| ----------------------------- | ------------------------------------------------------------------ |
| `--ngp-menu-transform-origin` | The transform origin of the menu for animations.                   |
| `--ngp-menu-trigger-width`    | The width of the trigger element.                                  |
| `--ngp-menu-available-width`  | The available width of the menu before it overflows the viewport.  |
| `--ngp-menu-available-height` | The available height of the menu before it overflows the viewport. |

### NgpContextMenuItem

<api-docs name="NgpContextMenuItem"></api-docs>

#### Data Attributes

The following data attributes are available on the `NgpContextMenuItem` directive:

| Attribute       | Description                        |
| --------------- | ---------------------------------- |
| `data-disabled` | Applied when the item is disabled. |

### NgpContextMenuSubmenuTrigger

<api-docs name="NgpContextMenuSubmenuTrigger"></api-docs>

#### Data Attributes

The following data attributes are available on the `NgpContextMenuSubmenuTrigger` directive:

| Attribute   | Description                       |
| ----------- | --------------------------------- |
| `data-open` | Applied when the submenu is open. |

### NgpContextMenuItemCheckbox

<api-docs name="NgpContextMenuItemCheckbox"></api-docs>

#### Data Attributes

The following data attributes are available on the `NgpContextMenuItemCheckbox` directive:

| Attribute       | Description                                 |
| --------------- | ------------------------------------------- |
| `data-checked`  | Applied when the checkbox item is checked.  |
| `data-disabled` | Applied when the checkbox item is disabled. |

### NgpContextMenuItemRadioGroup

<api-docs name="NgpContextMenuItemRadioGroup"></api-docs>

### NgpContextMenuItemRadio

<api-docs name="NgpContextMenuItemRadio"></api-docs>

#### Data Attributes

The following data attributes are available on the `NgpContextMenuItemRadio` directive:

| Attribute       | Description                              |
| --------------- | ---------------------------------------- |
| `data-checked`  | Applied when the radio item is checked.  |
| `data-disabled` | Applied when the radio item is disabled. |

### NgpContextMenuItemIndicator

<api-docs name="NgpContextMenuItemIndicator"></api-docs>

#### Data Attributes

The following data attributes are available on the `NgpContextMenuItemIndicator` directive:

| Attribute      | Description                                           |
| -------------- | ----------------------------------------------------- |
| `data-checked` | Applied when the parent checkbox or radio is checked. |

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
:host[data-enter] {
  animation: fade-in 0.2s ease-in-out;
}

:host[data-exit] {
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

<prop-details name="offset" type="number | NgpOffsetOptions">
  Define the offset from the cursor position. Can be a number (applies to mainAxis) or an object with mainAxis, crossAxis, and alignmentAxis properties.
</prop-details>

<prop-details name="flip" type="boolean">
  Define if the context menu should flip when it reaches the edge of the viewport.
</prop-details>

<prop-details name="container" type="HTMLElement | string | null" default="'body'">
  Define the container element for the context menu. This is the document body by default.
</prop-details>

<prop-details name="scrollBehavior" type="'reposition' | 'block' | 'close'" default="'close'">
  Defines how the context menu behaves when the window is scrolled. If set to `close`, the context menu will close when the window is scrolled. If set to `reposition`, the menu will adjust its position. If set to `block`, scrolling will be disabled.
</prop-details>

<prop-details name="shift" type="boolean | NgpShiftOptions">
  Configure shift behavior to keep the context menu in view.
</prop-details>

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
