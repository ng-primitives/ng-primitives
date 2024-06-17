---
title: 'Tabs'
---

# Tabs

Dynamically show and hide content based on an active tab.

<docs-example name="tabs"></docs-example>

## Usage

Assemble the tabs directives in your template.

```html
<div ngpTabs></div>
```

## API Reference

The following directives are available to import from the `@ng-primitives/ng-primitives/tabs` package:

### NgpTabs

There are no inputs or outputs for this directive.

## Global Configuration

You can configure the default options for all tabss in your application by using the `provideNgpTabsConfig` function in a providers array.

```ts
import { provideNgpTabsConfig } from '@ng-primitives/ng-primitives/tabs';

bootstrapApplication(AppComponent, {
  providers: [provideNgpTabsConfig({})],
});
```

### NgpTabsConfig
