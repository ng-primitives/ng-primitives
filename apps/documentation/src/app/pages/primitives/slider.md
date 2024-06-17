---
title: 'Slider'
---

# Slider

Select a value within a range.

<docs-example name="slider"></docs-example>

## Usage

Assemble the slider directives in your template.

```html
<div ngpSlider></div>
```

## API Reference

The following directives are available to import from the `@ng-primitives/ng-primitives/slider` package:

### NgpSlider

There are no inputs or outputs for this directive.

## Global Configuration

You can configure the default options for all sliders in your application by using the `provideNgpSliderConfig` function in a providers array.

```ts
import { provideNgpSliderConfig } from '@ng-primitives/ng-primitives/slider';

bootstrapApplication(AppComponent, {
  providers: [provideNgpSliderConfig({})],
});
```

### NgpSliderConfig
