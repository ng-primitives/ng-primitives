---
name: 'Menu'
---

# Menu

A menu is a list of options or commands presented to the user in a dropdown list.

<docs-example name="menu"></docs-example>

## Import

Import the Menu primitives from `ng-primitives/menu`.

```ts
import { NgpMenu, NgpMenuItem, NgpMenuTrigger, NgpSubmenuTrigger } from 'ng-primitives/menu';
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
- `componentSuffix`: The suffix to apply to the generated component class name.
- `fileSuffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `exampleStyles`: Whether to include example styles in the generated component file. Defaults to `true`.

## Examples

Here are some additional examples of how to use the Menu primitives.

### Submenu

The menu can contain submenus, which are nested menus that can be opened by hovering on a menu item.

<docs-example name="submenu"></docs-example>

## API Reference

The following directives are available to import from the `ng-primitives/menu` package:

### NgpMenuTrigger

<api-docs name="NgpMenuTrigger"></api-docs>

#### Data Attributes

The following data attributes are available on the `NgpMenuTrigger` directive:

| Attribute   | Description                    |
| ----------- | ------------------------------ |
| `data-open` | Applied when the menu is open. |

### NgpMenu

<api-docs name="NgpMenu"></api-docs>

The following CSS custom properties are applied to the `ngpMenu` directive:

| Property                      | Description                                      |
| ----------------------------- | ------------------------------------------------ |
| `--ngp-menu-transform-origin` | The transform origin of the menu for animations. |
| `--ngp-menu-trigger-width`    | The width of the trigger element.                |

### NgpMenuItem

<api-docs name="NgpMenuItem"></api-docs>

#### Data Attributes

The following data attributes are available on the `NgpMenuItem` directive:

| Attribute       | Description                        |
| --------------- | ---------------------------------- |
| `data-disabled` | Applied when the item is disabled. |

### NgpSubmenuTrigger

<api-docs name="NgpSubmenuTrigger"></api-docs>

#### Data Attributes

The following data attributes are available on the `NgpSubmenuTrigger` directive:

| Attribute   | Description                       |
| ----------- | --------------------------------- |
| `data-open` | Applied when the submenu is open. |

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
    }),
  ],
});
```

### NgpMenuConfig

<prop-details name="offset" type="number">
  Define the offset from the trigger element.
</prop-details>

<prop-details name="placement" type="'top' | 'right' | 'bottom' | 'left'">
  Define the placement of the menu.
</prop-details>

<prop-details name="flip" type="boolean">
  Define if the menu should flip when it reaches the edge of the viewport.
</prop-details>

<prop-details name="container" type="HTMLElement">
  Define the container element for the menu. This is the document body by default.
</prop-details>

<prop-details name="scrollBehavior" type="reposition | block">
Defines how the menu behaves when the window is scrolled. If set to `reposition`, the menu will adjust its position automatically during scrolling. Make sure the menu uses `position: absolute` in this mode. If set to `block`, scrolling will be disabled while the menu is open. In this case, the menu should use `position: fixed`.
</prop-details>

## Accessibility

Adhere to the [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/) for menus and submenus.
