---
title: 'Tabs'
---

# Tabs

Dynamically show and hide content based on an active tab.

<docs-example name="tabs"></docs-example>

## Usage

Assemble the tabs directives in your template.

```html
<div ngpTabset>
  <div ngpTabList>
    <button ngpTabButton value="tab1">Tab 1</button>
    <button ngpTabButton value="tab2">Tab 2</button>
    <button ngpTabButton value="tab3">Tab 3</button>
  </div>
  <div ngpTabPanel value="tab1">Tab 1 content</div>
  <div ngpTabPanel value="tab2">Tab 2 content</div>
  <div ngpTabPanel value="tab3">Tab 3 content</div>
</div>
```

## API Reference

The following directives are available to import from the `@ng-primitives/ng-primitives/tabs` package:

### NgpTabset

Apply the `ngpTabset` directive to an element to manage the tabs.

- Selector: `[ngpTabset]`
- Exported As: `ngpTabset`

<response-field name="ngpTabsetValue" type="string">
  Define the selected tab.
</response-field>

<response-field name="ngpTabsetOrientation" type="'horizontal' | 'vertical'" default="horizontal">
  Define the orientation of the tabs.
</response-field>

<response-field name="ngpTabsetActivateOnFocus" type="boolean">
  Define whether the tab should activate on focus.
</response-field>

#### Data Attributes

The following data attributes are applied to the `ngpTabset` directive:

| Attribute          | Description                         | Value                      |
| ------------------ | ----------------------------------- | -------------------------- |
| `data-orientation` | Define the orientation of the tabs. | `horizontal` \| `vertical` |

### NgpTabList

Apply the `ngpTabList` directive to an element that represents the list of tab buttons.

- Selector: `[ngpTabList]`
- Exported As: `ngpTabList`

#### Data Attributes

The following data attributes are applied to the `ngpTabList` directive:

| Attribute          | Description                         | Value                      |
| ------------------ | ----------------------------------- | -------------------------- |
| `data-orientation` | Define the orientation of the tabs. | `horizontal` \| `vertical` |

### NgpTabButton

Apply the `ngpTabButton` directive to an element within a tab list to represent a tab button. This directive should be applied to a button element.

- Selector: `[ngpTabButton]`
- Exported As: `ngpTabButton`

<response-field name="ngpTabButtonValue" type="string" required="true">
  Define the value of the tab.
</response-field>

<response-field name="ngpTabButtonDisabled" type="boolean">
  Define whether the tab button is disabled.
</response-field>

#### Data Attributes

The following data attributes are applied to the `ngpTabButton` directive:

| Attribute          | Description                         | Value                      |
| ------------------ | ----------------------------------- | -------------------------- |
| `data-state`       | Define the state of the tab.        | `active` \| `inactive`     |
| `data-disabled`    | Define the disabled state.          | `true` \| `false`          |
| `data-orientation` | Define the orientation of the tabs. | `horizontal` \| `vertical` |

### NgpTabPanel

Apply the `ngpTabPanel` directive to an element that represents the content of a tab.

- Selector: `[ngpTabPanel]`
- Exported As: `ngpTabPanel`

<response-field name="ngpTabPanelValue" type="string" required="true">
  Define the value of the tab.
</response-field>

#### Data Attributes

The following data attributes are applied to the `ngpTabPanel` directive:

| Attribute          | Description                         | Value                      |
| ------------------ | ----------------------------------- | -------------------------- |
| `data-state`       | Define the state of the tab.        | `active` \| `inactive`     |
| `data-orientation` | Define the orientation of the tabs. | `horizontal` \| `vertical` |

## Global Configuration

You can configure the default options for all tabss in your application by using the `provideNgpTabsConfig` function in a providers array.

```ts
import { provideNgpTabsConfig } from '@ng-primitives/ng-primitives/tabs';

bootstrapApplication(AppComponent, {
  providers: [
    provideNgpTabsConfig({
      orientation: 'horizontal',
      activateOnFocus: false,
      wrap: false,
    }),
  ],
});
```

### NgpTabsConfig

The following options are available to configure the default tab options:

<response-field name="orientation" type="'horizontal' | 'vertical'" default="horizontal">
  Define the default orientation of the tabs.
</response-field>

<response-field name="activateOnFocus" type="boolean" default="false">
  Define whether the tab should activate on focus.
</response-field>

<response-field name="wrap" type="boolean" default="false">
  Define whether the tabs should wrap around the tab list.
</response-field>
