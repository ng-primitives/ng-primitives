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
  NgpNavigationMenuContentItem,
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
          <a ngpNavigationMenuContentItem href="/analytics">Analytics</a>
          <a ngpNavigationMenuContentItem href="/automation">Automation</a>
          <a ngpNavigationMenuContentItem href="/insights">Insights</a>
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

<api-reference-props name="NgpNavigationMenu"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-orientation" description="The orientation of the navigation menu (horizontal/vertical)" />
</api-reference-attributes>

### NgpNavigationMenuList

A container for navigation menu items. It manages roving focus between menu triggers and links.

<api-docs name="NgpNavigationMenuList"></api-docs>

<api-reference-props name="NgpNavigationMenuList"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-orientation" description="The orientation of the navigation menu (horizontal/vertical)" />
</api-reference-attributes>

### NgpNavigationMenuItem

A container for a menu trigger and its content. It manages the open/close state for a specific menu item.

<api-docs name="NgpNavigationMenuItem"></api-docs>

<api-reference-props name="NgpNavigationMenuItem"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-active" description="Applied when the menu item is open" />
</api-reference-attributes>

### NgpNavigationMenuTrigger

A button that opens navigation menu content on hover/focus.

<api-docs name="NgpNavigationMenuTrigger"></api-docs>

<api-reference-props name="NgpNavigationMenuTrigger"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-open" description="Applied when the content is open" />
  <api-attribute name="data-disabled" description="Applied when the trigger is disabled" />
</api-reference-attributes>

### NgpNavigationMenuContent

The dropdown panel displayed when a trigger is activated.

<api-docs name="NgpNavigationMenuContent"></api-docs>

<api-reference-props name="NgpNavigationMenuContent"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-open" description="Applied when the content is visible" />
  <api-attribute name="data-placement" description="The final rendered placement of the content" />
</api-reference-attributes>

### NgpNavigationMenuLink

A standalone navigation link within the menu list.

<api-docs name="NgpNavigationMenuLink"></api-docs>

<api-reference-props name="NgpNavigationMenuLink"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-active" description="Applied when the link represents the current page" />
  <api-attribute name="data-disabled" description="Applied when the link is disabled" />
</api-reference-attributes>

## Accessibility

The navigation menu uses `role="navigation"` on the container, `aria-haspopup="menu"` and `aria-expanded` on triggers, and `role="menu"` with `aria-labelledby` on content panels. This follows the [WAI-ARIA Navigation Menu pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/).

### Keyboard Interactions

| Key                        | Action                                              |
| -------------------------- | --------------------------------------------------- |
| `ArrowRight` / `ArrowLeft` | Navigate between triggers (horizontal orientation)  |
| `ArrowUp` / `ArrowDown`    | Navigate between triggers (vertical orientation)    |
| `ArrowDown` (horizontal)   | Open content and focus first item                   |
| `ArrowRight` (vertical)    | Open content and focus first item                   |
| `Enter` / `Space`          | Open content and focus first item, or activate link |
| `Escape`                   | Close content and return focus to trigger           |
| `Home` / `End`             | Navigate to first/last trigger                      |
| `Tab`                      | Move focus out of the navigation menu               |

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

### Instant Transitions (Cooldown)

When users quickly move between menu triggers, the `cooldown` feature provides instant transitions without animation delays. During the cooldown period (default 300ms), the previous menu is immediately removed and the new menu appears instantly.

Use the `data-instant` attribute in CSS to handle these instant transitions:

```css
/* Skip animations during instant transitions */
[ngpNavigationMenuContent][data-instant][data-enter],
[ngpNavigationMenuContent][data-instant][data-exit] {
  animation: none;
}
```

To disable cooldown and always show animations, set `cooldown` to `0` on the trigger:

```html
<button [ngpNavigationMenuTrigger]="menu" [ngpNavigationMenuTriggerCooldown]="0">Menu</button>
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
      shift: true,
      wrap: true,
      cooldown: 300,
    }),
  ],
});
```

### NgpNavigationMenuConfig

<api-reference-config name="NgpNavigationMenuConfig"></api-reference-config>
