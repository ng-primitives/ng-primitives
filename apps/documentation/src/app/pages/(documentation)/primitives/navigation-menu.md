---
name: 'Navigation Menu'
sourceUrl: 'https://github.com/ng-primitives/ng-primitives/tree/next/packages/ng-primitives/navigation-menu'
---

# Navigation Menu

A navigation menu displays a list of links for navigating websites with support for hover-triggered dropdowns and keyboard navigation.

<docs-example name="navigation-menu"></docs-example>

## Import

Import the Navigation Menu primitives from `ng-primitives/navigation-menu`.

```ts
import {
  NgpNavigationMenu,
  NgpNavigationMenuList,
  NgpNavigationMenuItem,
  NgpNavigationMenuTrigger,
  NgpNavigationMenuContent,
  NgpNavigationMenuLink,
  NgpNavigationMenuIndicator,
  NgpNavigationMenuViewport,
} from 'ng-primitives/navigation-menu';
```

## Usage

Assemble the navigation menu directives in your template.

```html
<nav ngpNavigationMenu>
  <ul ngpNavigationMenuList>
    <li ngpNavigationMenuItem ngpNavigationMenuItemValue="products">
      <button ngpNavigationMenuTrigger>Products</button>
      <div ngpNavigationMenuContent>
        <a ngpNavigationMenuLink href="/product-a">Product A</a>
        <a ngpNavigationMenuLink href="/product-b">Product B</a>
      </div>
    </li>
    <li ngpNavigationMenuItem ngpNavigationMenuItemValue="about">
      <a ngpNavigationMenuLink href="/about">About</a>
    </li>
  </ul>
</nav>
```

## Examples

### Animated Viewport

Use the viewport component to create a shared container that animates its dimensions as you switch between menus with different content sizes.

<docs-example name="navigation-menu-viewport"></docs-example>

### Vertical Sidebar

Create a collapsed vertical sidebar navigation with icon-only triggers that expand on hover to reveal submenu content.

<docs-example name="navigation-menu-vertical"></docs-example>

## API Reference

The following directives are available to import from the `ng-primitives/navigation-menu` package:

### NgpNavigationMenu

The root container for the navigation menu.

<api-docs name="NgpNavigationMenu"></api-docs>

#### Data Attributes

| Attribute          | Description                             |
| ------------------ | --------------------------------------- |
| `data-orientation` | The orientation of the navigation menu. |

### NgpNavigationMenuList

Container for top-level menu items.

<api-docs name="NgpNavigationMenuList"></api-docs>

#### Data Attributes

| Attribute          | Description                             |
| ------------------ | --------------------------------------- |
| `data-orientation` | The orientation of the navigation menu. |

### NgpNavigationMenuItem

Wrapper for individual menu items containing a trigger and optional content.

<api-docs name="NgpNavigationMenuItem"></api-docs>

#### Data Attributes

| Attribute    | Description                                    |
| ------------ | ---------------------------------------------- |
| `data-state` | `open` when content is visible, else `closed`. |

### NgpNavigationMenuTrigger

Button element that toggles the visibility of associated content.

<api-docs name="NgpNavigationMenuTrigger"></api-docs>

#### Data Attributes

| Attribute       | Description                                    |
| --------------- | ---------------------------------------------- |
| `data-state`    | `open` when content is visible, else `closed`. |
| `data-disabled` | Present when the trigger is disabled.          |

### NgpNavigationMenuContent

The dropdown content panel that appears when a trigger is activated.

<api-docs name="NgpNavigationMenuContent"></api-docs>

#### Data Attributes

| Attribute          | Description                                                          |
| ------------------ | -------------------------------------------------------------------- |
| `data-state`       | `open` when visible, else `closed`.                                  |
| `data-orientation` | The orientation of the navigation menu.                              |
| `data-motion`      | Animation direction: `from-start`, `from-end`, `to-start`, `to-end`. |

### NgpNavigationMenuLink

A navigational link element within the menu.

<api-docs name="NgpNavigationMenuLink"></api-docs>

#### Data Attributes

| Attribute     | Description                             |
| ------------- | --------------------------------------- |
| `data-active` | Present when the link is marked active. |

### NgpNavigationMenuIndicator

A visual indicator that highlights the active trigger position.

<api-docs name="NgpNavigationMenuIndicator"></api-docs>

#### Data Attributes

| Attribute          | Description                                    |
| ------------------ | ---------------------------------------------- |
| `data-state`       | `visible` when an item is open, else `hidden`. |
| `data-orientation` | The orientation of the navigation menu.        |

#### CSS Variables

| Property                                 | Description                     |
| ---------------------------------------- | ------------------------------- |
| `--ngp-navigation-menu-indicator-left`   | Left position of the indicator. |
| `--ngp-navigation-menu-indicator-top`    | Top position of the indicator.  |
| `--ngp-navigation-menu-indicator-width`  | Width of the indicator.         |
| `--ngp-navigation-menu-indicator-height` | Height of the indicator.        |

### NgpNavigationMenuViewport

An optional container for rendering content with animated dimensions.

<api-docs name="NgpNavigationMenuViewport"></api-docs>

#### Data Attributes

| Attribute          | Description                                    |
| ------------------ | ---------------------------------------------- |
| `data-state`       | `open` when content is visible, else `closed`. |
| `data-orientation` | The orientation of the navigation menu.        |

#### CSS Variables

| Property                                | Description                                        |
| --------------------------------------- | -------------------------------------------------- |
| `--ngp-navigation-menu-viewport-width`  | Width of the active content.                       |
| `--ngp-navigation-menu-viewport-height` | Height of the active content.                      |
| `--ngp-navigation-menu-viewport-left`   | Left position of the active trigger (for styling). |
| `--ngp-navigation-menu-viewport-top`    | Top position of the active trigger (for styling).  |

## Animations

The `data-motion` attribute on `NgpNavigationMenuContent` can be used to animate content based on navigation direction:

- `from-start`: Content entering from the start (left in LTR)
- `from-end`: Content entering from the end (right in LTR)
- `to-start`: Content exiting toward the start
- `to-end`: Content exiting toward the end

```css
[ngpNavigationMenuContent][data-motion='from-start'] {
  animation: slideFromLeft 200ms ease;
}

[ngpNavigationMenuContent][data-motion='from-end'] {
  animation: slideFromRight 200ms ease;
}
```

## Global Configuration

Configure default options for all navigation menus using `provideNavigationMenuConfig`.

```ts
import { provideNavigationMenuConfig } from 'ng-primitives/navigation-menu';

bootstrapApplication(AppComponent, {
  providers: [
    provideNavigationMenuConfig({
      orientation: 'horizontal',
      showDelay: 200,
      skipDelayDuration: 300,
    }),
  ],
});
```

### NgpNavigationMenuConfig

<prop-details name="orientation" type="'horizontal' | 'vertical'" default="horizontal">
  The orientation of the navigation menu.
</prop-details>

<prop-details name="showDelay" type="number" default="200">
  The delay in milliseconds before content opens on hover.
</prop-details>

<prop-details name="skipDelayDuration" type="number" default="300">
  The duration in milliseconds after closing where the show delay is skipped when hovering another trigger.
</prop-details>

## Accessibility

The Navigation Menu primitive follows the [WAI-ARIA Navigation Menu pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/).

### RTL Support

The navigation menu automatically detects the text direction from the Angular CDK's `Directionality` service, which reads the `dir` attribute from the DOM. To enable RTL support, set `dir="rtl"` on a parent element or the document.

### Keyboard Interactions

| Key                | Description                                                       |
| ------------------ | ----------------------------------------------------------------- |
| `Space` / `Enter`  | Opens/closes the content when focused on trigger.                 |
| `Arrow Down`       | Opens content (horizontal) or moves to next item (vertical).      |
| `Arrow Up`         | Closes content (horizontal) or moves to previous item (vertical). |
| `Arrow Left/Right` | Navigates between triggers based on orientation.                  |
| `Home` / `End`     | Moves focus to first/last trigger.                                |
| `Tab`              | Moves focus naturally through the menu.                           |
| `Escape`           | Closes the open content.                                          |
