---
title: 'Select'
---

# Select

Select an option from a list of choices.

<docs-example name="select"></docs-example>

## Usage

Assemble the select directives in your template.

```html
<div ngpSelect></div>
```

## API Reference

The following directives are available to import from the `@ng-primitives/ng-primitives/select` package:

### NgpSelect

There are no inputs or outputs for this directive.

## Global Configuration

You can configure the default options for all selects in your application by using the `provideNgpSelectConfig` function in a providers array.

```ts
import { provideNgpSelectConfig } from '@ng-primitives/ng-primitives/select';

bootstrapApplication(AppComponent, {
  providers: [provideNgpSelectConfig({})],
});
```

### NgpSelectConfig
