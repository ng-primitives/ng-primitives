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

### NgpMenuItem

<api-docs name="NgpMenuItem"></api-docs>

#### Data Attributes

The following data attributes are available on the `NgpMenuItem` directive:

| Attribute       | Description                        |
| --------------- | ---------------------------------- |
| `data-disabled` | Applied when the item is disabled. |

## Accessibility

Adhere to the [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/) for menus and submenus.
