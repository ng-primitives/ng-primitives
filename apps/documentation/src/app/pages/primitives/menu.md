---
name: 'Menu'
---

# Menu

A menu is a list of options or commands presented to the user in a dropdown list.

<docs-example name="menu"></docs-example>

## Import

Import the Menu primitives from `ng-primitives/menu`.

```ts
import { NgpMenu, NgpMenuItem, NgpMenuTrigger } from 'ng-primitives/menu';
```

## Usage

The Menu primitives are a thin wrapper around the [Angular CDK Menu](https://material.angular.io/cdk/menu/overview) directives.
As a result you will need to import the Angular CDK overlay styles in your application.

```css
@import '@angular/cdk/overlay-prebuilt.css';
```

Assemble the menu directives in your template.

```html
<button [ngpMenuTrigger]="menu"></button>

<ng-template #menu>
  <div ngpMenu>
    <div ngpMenuItem>Item 1</div>
    <div ngpMenuItem>Item 2</div>
    <div ngpMenuItem>Item 3</div>
  </div>
</ng-template>
```

## API Reference

The following directives are available to import from the `ng-primitives/menu` package:

### NgpMenuTrigger

The `NgpMenuTrigger` directive allows you to turn an element into a menu trigger.

- Selector: `[ngpMenuTrigger]`
- Exported As: `ngpMenuTrigger`

<response-field name="ngpMenuTrigger" type="TemplateRef" required="true">
  The menu template to display when the trigger is activated.
</response-field>

#### Data Attributes

The following data attributes are available on the `NgpMenuTrigger` directive:

| Attribute   | Description          | Value             |
| ----------- | -------------------- | ----------------- |
| `data-open` | If the menu is open. | `true` \| `false` |

### NgpMenu

The `NgpMenu` is a container for menu items.

- Selector: `[ngpMenu]`
- Exported As: `ngpMenu`

### NgpMenuItem

The `NgpMenuItem` directive represents a menu item.

- Selector: `[ngpMenuItem]`
- Exported As: `ngpMenuItem`
- Host Directives: [NgpHover](/interactions/hover), [NgpFocusVisible](/interactions/focus-visible), [NgpPress](/interactions/press)

<response-field name="ngpMenuItemDisabled" type="boolean" default="false">
  Define if the menu item is disabled.
</response-field>

#### Data Attributes

The following data attributes are available on the `NgpMenuItem` directive:

| Attribute       | Description                   | Value             |
| --------------- | ----------------------------- | ----------------- |
| `data-disabled` | If the menu item is disabled. | `true` \| `false` |
