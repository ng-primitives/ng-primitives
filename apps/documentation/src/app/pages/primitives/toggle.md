---
title: 'Toggle'
---

# Toggle

Toggle a button on and off.

<docs-example name="toggle"></docs-example>

## Usage

Assemble the toggle directives in your template.

```html
<div ngpToggle></div>
```

## API Reference

The following directives are available to import from the `@ng-primitives/ng-primitives/toggle` package:

### NgpToggleDirective

There are no inputs or outputs for this directive.

## Global Configuration

You can configure the default options for all toggles in your application by using the `provideNgpToggleConfig` function in a providers array.

```ts
import { provideNgpToggleConfig } from '@ng-primitives/ng-primitives/toggle';

bootstrapApplication(AppComponent, {
  providers: [provideNgpToggleConfig({})],
});
```

### NgpToggleConfig

### Options

<ResponseField name="name" type="string">
  The name of the component.
</ResponseField>

<ResponseField name="project" type="string">
  The name of the project to add the component to.
</ResponseField>

<ResponseField name="path" type="string">
  The path to create the component.
</ResponseField>
