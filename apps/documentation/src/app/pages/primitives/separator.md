---
name: 'Separator'
---

# Separator

The separator primitive allow you to semantically separate content either horizontally or vertically.

<docs-example name="separator"></docs-example>

## Import

Import the Separator primitives from `ng-primitives/separator`.

```ts
import { NgpSeparator } from 'ng-primitives/separator';
```

## Usage

Assemble the separator directives in your template.

```html
<div ngpSeparator></div>
```

## API Reference

The following directives are available to import from the `ng-primitives/separator` package:

### NgpSeparator

- Selector: `[ngpSeparator]`
- Exported As: `ngpSeparator`

<response-field name="ngpSeparatorOrientation" type="horizontal | vertical" default="horizontal">
  The orientation of the separator.
</response-field>

#### Data Attributes

| Attribute          | Description                       |
| ------------------ | --------------------------------- |
| `data-orientation` | The orientation of the separator. |

## Global Configuration

You can configure the default options for all separators in your application by using the `provideSeparatorConfig` function in a providers array.

```ts
import { provideSeparatorConfig } from 'ng-primitives/tabs';

bootstrapApplication(AppComponent, {
  providers: [
    provideSeparatorConfig({
      orientation: 'horizontal',
    }),
  ],
});
```

### NgpSeparatorConfig

The following options are available to configure the default tab options:

<response-field name="orientation" type="'horizontal' | 'vertical'" default="horizontal">
  Define the default orientation of the separator.
</response-field

## Accessibility

Adheres to the [WAI-ARIA Separator Design Pattern](https://www.w3.org/TR/wai-aria-1.2/#separator).
