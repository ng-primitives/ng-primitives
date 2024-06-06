---
title: 'Tooltip'
---

# Tooltip

Display additional information on hover.

<docs-example name="tooltip"></docs-example>

## Usage

Assemble the tooltip directives in your template.

```html
<div ngpTooltip></div>
```

## API Reference

The following directives are available to import from the `@ng-primitives/ng-primitives/tooltip` package:

### NgpTooltipDirective

There are no inputs or outputs for this directive.

## Global Configuration

You can configure the default options for all tooltips in your application by using the `provideNgpTooltipConfig` function in a providers array.

```ts
import { provideNgpTooltipConfig } from '@ng-primitives/ng-primitives/tooltip';

bootstrapApplication(AppComponent, {
  providers: [provideNgpTooltipConfig({})],
});
```

### NgpTooltipConfig
