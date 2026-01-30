---
name: 'Navigation Menu'
sourceUrl: 'https://github.com/ng-primitives/ng-primitives/tree/next/packages/ng-primitives/navigation-menu'
---

# Navigation Menu

A navigation menu component for site-wide navigation with dropdown content panels.

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
} from 'ng-primitives/navigation-menu';
```

## Usage

Assemble the navigation menu directives in your template.

```html
<nav ngpNavigationMenu>
  <ul ngpNavigationMenuList>
    <li ngpNavigationMenuItem>
      <button [ngpNavigationMenuTrigger]="productsMenu">Products</button>
      <ng-template #productsMenu>
        <div ngpNavigationMenuContent>
          <a href="/analytics">Analytics</a>
          <a href="/automation">Automation</a>
          <a href="/insights">Insights</a>
        </div>
      </ng-template>
    </li>
    <li>
      <a ngpNavigationMenuLink href="/pricing">Pricing</a>
    </li>
    <li>
      <a ngpNavigationMenuLink href="/about">About</a>
    </li>
  </ul>
</nav>
```

## Examples

### Vertical Navigation Menu

A vertical navigation menu is useful for sidebar navigation. Use the `ngpNavigationMenuOrientation` input to change the orientation and adjust the trigger placement accordingly.

<docs-example name="navigation-menu-vertical"></docs-example>

## API Reference

The following directives are available to import from the `ng-primitives/navigation-menu` package:

### NgpNavigationMenu

The root container for the navigation menu. Apply this to a `<nav>` element for proper semantics.

<api-docs name="NgpNavigationMenu"></api-docs>

#### Data Attributes

| Attribute          | Description                                                  |
| ------------------ | ------------------------------------------------------------ |
| `data-orientation` | The orientation of the navigation menu (horizontal/vertical) |

### NgpNavigationMenuList

A container for navigation menu items. It manages roving focus between menu triggers and links.

<api-docs name="NgpNavigationMenuList"></api-docs>

#### Data Attributes

| Attribute          | Description                                                  |
| ------------------ | ------------------------------------------------------------ |
| `data-orientation` | The orientation of the navigation menu (horizontal/vertical) |

### NgpNavigationMenuItem

A container for a menu trigger and its content. It manages the open/close state for a specific menu item.

<api-docs name="NgpNavigationMenuItem"></api-docs>

#### Data Attributes

| Attribute     | Description                              |
| ------------- | ---------------------------------------- |
| `data-active` | Applied when the menu item is open       |

### NgpNavigationMenuTrigger

A button that opens navigation menu content on hover/focus.

<api-docs name="NgpNavigationMenuTrigger"></api-docs>

#### Data Attributes

| Attribute       | Description                               |
| --------------- | ----------------------------------------- |
| `data-open`     | Applied when the content is open          |
| `data-disabled` | Applied when the trigger is disabled      |

### NgpNavigationMenuContent

The dropdown panel displayed when a trigger is activated.

<api-docs name="NgpNavigationMenuContent"></api-docs>

#### Data Attributes

| Attribute        | Description                               |
| ---------------- | ----------------------------------------- |
| `data-open`      | Applied when the content is visible       |
| `data-placement` | The final rendered placement of the content |

### NgpNavigationMenuLink

A standalone navigation link within the menu list.

<api-docs name="NgpNavigationMenuLink"></api-docs>

#### Data Attributes

| Attribute       | Description                               |
| --------------- | ----------------------------------------- |
| `data-active`   | Applied when the link represents the current page |
| `data-disabled` | Applied when the link is disabled         |

## Keyboard Navigation

| Key                        | Action                                                   |
| -------------------------- | -------------------------------------------------------- |
| `ArrowRight` / `ArrowLeft` | Navigate between triggers (horizontal orientation)       |
| `ArrowUp` / `ArrowDown`    | Navigate between triggers (vertical orientation)         |
| `ArrowDown` (horizontal)   | Open content and focus first item                        |
| `ArrowRight` (vertical)    | Open content and focus first item                        |
| `Enter` / `Space`          | Open content and focus first item, or activate link      |
| `Escape`                   | Close content and return focus to trigger                |
| `Home` / `End`             | Navigate to first/last trigger                           |
| `Tab`                      | Move focus out of the navigation menu                    |

## Styling

The navigation menu content uses a portal and should be positioned using `position: fixed` or `position: absolute`.

```css
[ngpNavigationMenuContent] {
  position: fixed;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```

## Animations

The content panel supports enter/exit animations using the `data-enter` and `data-exit` attributes.

```css
[ngpNavigationMenuContent][data-enter] {
  animation: fade-in 0.2s ease-out;
}

[ngpNavigationMenuContent][data-exit] {
  animation: fade-out 0.15s ease-in;
}
```

## Global Configuration

You can configure the default options for all navigation menus in your application using the `provideNavigationMenuConfig` function.

```ts
import { provideNavigationMenuConfig } from 'ng-primitives/navigation-menu';

bootstrapApplication(AppComponent, {
  providers: [
    provideNavigationMenuConfig({
      orientation: 'horizontal',
      showDelay: 200,
      hideDelay: 150,
      placement: 'bottom-start',
      offset: 4,
      flip: true,
      wrap: true,
    }),
  ],
});
```

### NgpNavigationMenuConfig

<prop-details name="orientation" type="'horizontal' | 'vertical'" default="horizontal">
Define the orientation of the navigation menu.
</prop-details>

<prop-details name="showDelay" type="number" default="200">
Define the delay in milliseconds before showing content on hover.
</prop-details>

<prop-details name="hideDelay" type="number" default="150">
Define the delay in milliseconds before hiding content.
</prop-details>

<prop-details name="placement" type="Placement" default="bottom-start">
Define the placement of the content relative to the trigger.
</prop-details>

<prop-details name="offset" type="number | NgpOffsetOptions" default="4">
Define the offset from the trigger element.
</prop-details>

<prop-details name="flip" type="boolean" default="true">
Define if the content should flip when it reaches the edge of the viewport.
</prop-details>

<prop-details name="wrap" type="boolean" default="true">
Define if focus should wrap around when navigating with arrow keys.
</prop-details>
