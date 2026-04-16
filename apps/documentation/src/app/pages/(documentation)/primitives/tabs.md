---
name: 'Tabs'
sourceUrl: 'https://github.com/ng-primitives/ng-primitives/tree/next/packages/ng-primitives/tabs'
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
- `component-suffix`: The suffix to apply to the generated component class name.
- `file-suffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `example-styles`: Whether to include example styles in the generated component file. Defaults to `true`.

## API Reference

The following directives are available to import from the `ng-primitives/tabs` package:

### NgpTabset

<api-docs name="NgpTabset"></api-docs>

<api-reference-props name="NgpTabset"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-orientation" description="The orientation of the tabs." value="horizontal | vertical" />
</api-reference-attributes>

### NgpTabList

<api-docs name="NgpTabList"></api-docs>

<api-reference-props name="NgpTabList"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-orientation" description="The orientation of the tabs." value="horizontal | vertical" />
</api-reference-attributes>

### NgpTabButton

<api-docs name="NgpTabButton"></api-docs>

<api-reference-props name="NgpTabButton"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-orientation" description="The orientation of the tabs." value="horizontal | vertical" />
  <api-attribute name="data-active" description="Applied when the tab is active." />
  <api-attribute name="data-disabled" description="Applied when the tab is disabled." />
  <api-attribute name="data-hover" description="Applied when the tab is hovered." />
  <api-attribute name="data-focus-visible" description="Applied when the tab is focused." />
  <api-attribute name="data-press" description="Applied when the tab is pressed." />
</api-reference-attributes>

### NgpTabPanel

<api-docs name="NgpTabPanel"></api-docs>

<api-reference-props name="NgpTabPanel"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-active" description="Applied when the tab is active." />
  <api-attribute name="data-orientation" description="The orientation of the tabs." value="horizontal | vertical" />
</api-reference-attributes>

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

<api-reference-config name="NgpTabsConfig"></api-reference-config>

## Accessibility

Adheres to the [Tabs WAI-ARIA design pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs).

### Keyboard Interactions

- <kbd>ArrowLeft</kbd>: Move focus to the previous tab (horizontal orientation).
- <kbd>ArrowRight</kbd>: Move focus to the next tab (horizontal orientation).
- <kbd>ArrowUp</kbd>: Move focus to the previous tab (vertical orientation).
- <kbd>ArrowDown</kbd>: Move focus to the next tab (vertical orientation).
- <kbd>Home</kbd>: Move focus to the first tab.
- <kbd>End</kbd>: Move focus to the last tab.
