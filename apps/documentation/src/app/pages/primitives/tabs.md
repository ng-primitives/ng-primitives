---
name: 'Tabs'
---

# Tabs

Dynamically show and hide content based on an active tab.

<docs-example name="tabs"></docs-example>

## Import

Import the Tabs primitives from `ng-primitives/tabs`.

```ts
import { NgpTabset, NgpTabList, NgpTabButton, NgpTabPanel } from 'ng-primitives/tabs';
```

## Usage

Assemble the tabs directives in your template.

```html
<div ngpTabset>
  <div ngpTabList>
    <button ngpTabButton ngpTabButtonValue="tab1">Tab 1</button>
    <button ngpTabButton ngpTabButtonValue="tab2">Tab 2</button>
    <button ngpTabButton ngpTabButtonValue="tab3">Tab 3</button>
  </div>
  <div ngpTabPanel ngpTabPanelValue="tab1">Tab 1 content</div>
  <div ngpTabPanel ngpTabPanelValue="tab2">Tab 2 content</div>
  <div ngpTabPanel ngpTabPanelValue="tab3">Tab 3 content</div>
</div>
```

## Reusable Component

Create reusable components that uses the tab directives.

<docs-snippet name="tabs"></docs-snippet>

## Schematics

Generate a reusable tab components using the Angular CLI.

```bash npm
ng g ng-primitives:primitive tabs
```

### Options

- `path`: The path at which to create the component file.
- `prefix`: The prefix to apply to the generated component selector.
- `componentSuffix`: The suffix to apply to the generated component class name.
- `fileSuffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `exampleStyles`: Whether to include example styles in the generated component file. Defaults to `true`.

## API Reference

The following directives are available to import from the `ng-primitives/tabs` package:

### NgpTabset

<api-docs name="NgpTabset"></api-docs>

#### Data Attributes

The following data attributes are applied to the `ngpTabset` directive:

| Attribute          | Description                  | Value                      |
| ------------------ | ---------------------------- | -------------------------- |
| `data-orientation` | The orientation of the tabs. | `horizontal` \| `vertical` |

### NgpTabList

<api-docs name="NgpTabList"></api-docs>

#### Data Attributes

The following data attributes are applied to the `ngpTabList` directive:

| Attribute          | Description                  | Value                      |
| ------------------ | ---------------------------- | -------------------------- |
| `data-orientation` | The orientation of the tabs. | `horizontal` \| `vertical` |

### NgpTabButton

<api-docs name="NgpTabButton"></api-docs>

#### Data Attributes

The following data attributes are applied to the `ngpTabButton` directive:

| Attribute            | Description                       | Value                      |
| -------------------- | --------------------------------- | -------------------------- |
| `data-orientation`   | The orientation of the tabs.      | `horizontal` \| `vertical` |
| `data-active`        | Applied when the tab is active.   | `-`                        |
| `data-disabled`      | Applied when the tab is disabled. | `-`                        |
| `data-hover`         | Applied when the tab is hovered.  | `-`                        |
| `data-focus-visible` | Applied when the tab is focused.  | `-`                        |
| `data-press`         | Applied when the tab is pressed.  | `-`                        |

### NgpTabPanel

<api-docs name="NgpTabPanel"></api-docs>

#### Data Attributes

The following data attributes are applied to the `ngpTabPanel` directive:

| Attribute          | Description                     | Value                      |
| ------------------ | ------------------------------- | -------------------------- |
| `data-active`      | Applied when the tab is active. | `-`                        |
| `data-orientation` | The orientation of the tabs.    | `horizontal` \| `vertical` |

## Global Configuration

You can configure the default options for all tabs in your application by using the `provideTabsConfig` function in a providers array.

```ts
import { provideTabsConfig } from 'ng-primitives/tabs';

bootstrapApplication(AppComponent, {
  providers: [
    provideTabsConfig({
      orientation: 'horizontal',
      activateOnFocus: false,
      wrap: false,
    }),
  ],
});
```

### NgpTabsConfig

The following options are available to configure the default tab options:

<prop-details name="orientation" type="'horizontal' | 'vertical'" default="horizontal">
  Define the default orientation of the tabs.
</prop-details>

<prop-details name="activateOnFocus" type="boolean" default="false">
  Define whether the tab should activate on focus.
</prop-details>

<prop-details name="wrap" type="boolean" default="false">
  Define whether the tabs should wrap around the tab list.
</prop-details>

## Accessibility

Adheres to the [Tabs WAI-ARIA design pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs).

### Keyboard Interactions

- <kbd>ArrowLeft</kbd>: Move focus to the previous tab (horizontal orientation).
- <kbd>ArrowRight</kbd>: Move focus to the next tab (horizontal orientation).
- <kbd>ArrowUp</kbd>: Move focus to the previous tab (vertical orientation).
- <kbd>ArrowDown</kbd>: Move focus to the next tab (vertical orientation).
- <kbd>Home</kbd>: Move focus to the first tab.
- <kbd>End</kbd>: Move focus to the last tab.
