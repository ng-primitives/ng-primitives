---
name: 'Avatar'
sourceUrl: 'https://github.com/ng-primitives/ng-primitives/tree/main/packages/ng-primitives/avatar'
---

# Avatar

Display an image that represents a user with a text fallback.

<docs-example name="avatar"></docs-example>

## Import

Import the Avatar primitives from `ng-primitives/avatar`.

```ts
import { NgpAvatar, NgpAvatarImage, NgpAvatarFallback } from 'ng-primitives/avatar';
```

## Usage

Assemble the avatar directives in your template.

```html
<span ngpAvatar>
  <img ngpAvatarImage src="..." alt="..." />
  <span ngpAvatarFallback>NG</span>
</span>
```

## Reusable Component

Create a reusable component that uses the `NgpAvatar` directive.

<docs-snippet name="avatar"></docs-snippet>

## Schematics

Generate a reusable avatar component using the Angular CLI.

```bash npm
ng g ng-primitives:primitive avatar
```

### Options

- `path`: The path at which to create the component file.
- `prefix`: The prefix to apply to the generated component selector.
- `componentSuffix`: The suffix to apply to the generated component class name.
- `fileSuffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `exampleStyles`: Whether to include example styles in the generated component file. Defaults to `true`.

## API Reference

The following directives are available to import from the `ng-primitives/avatar` package:

### NgpAvatar

<api-docs name="NgpAvatar"></api-docs>

#### Data Attributes

| Attribute     | Description                             | Value                                      |
| ------------- | --------------------------------------- | ------------------------------------------ |
| `data-status` | The loading status of the avatar image. | `idle` \| `loading` \| `loaded` \| `error` |

### NgpAvatarImage

<api-docs name="NgpAvatarImage"></api-docs>

### NgpAvatarFallback

<api-docs name="NgpAvatarFallback"></api-docs>

## Global Configuration

You can configure the default options for all avatars in your application by using the `provideAvatarConfig` function in a providers array.

```ts
import { provideAvatarConfig } from 'ng-primitives/avatar';

bootstrapApplication(AppComponent, {
  providers: [provideAvatarConfig({ delay: 1000 })],
});
```

### NgpAvatarConfig

<prop-details name="delay" type="number">
  Define a delay before the fallback is shown. This is useful to only show the fallback for those
  with slower connections.
</prop-details>
