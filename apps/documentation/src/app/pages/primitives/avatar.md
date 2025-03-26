---
name: 'Avatar'
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

Apply the `ngpAvatar` directive to an element that represents the avatar. This directive is a container for the image and/or fallback.

- Selector: `[ngpAvatar]`
- Exported As: `ngpAvatar`
- Host Directives: [NgpHover](/interactions/hover), [NgpFocusVisible](/interactions/focus-visible), [NgpPress](/interactions/press)

#### Data Attributes

| Attribute            | Description                                 | Value                                      |
| -------------------- | ------------------------------------------- | ------------------------------------------ |
| `data-state`         | The loading state of the avatar image.      | `idle` \| `loading` \| `loaded` \| `error` |
| `data-hover`         | The added to the avatar when hovered.       | `-`                                        |
| `data-focus-visible` | The added to the avatar when focus visible. | `-`                                        |
| `data-press`         | The added to the avatar when pressed.       | `-`                                        |

### NgpAvatarImage

Apply the `ngpAvatarImage` directive to an element that represents the avatar image. This would typically be an `img` element or a `div` with a background image.

- Selector: `[ngpAvatarImage]`
- Exported As: `ngpAvatarImage`
- Host Directives: [NgpVisuallyHidden](/utilities/visually-hidden)

### NgpAvatarFallback

Apply the `ngpAvatarFallback` directive to an element that represents the user in the absence of an image. This is typically the user's initials.

- Selector: `[ngpAvatarFallback]`
- Exported As: `ngpAvatarFallback`

<response-field name="ngpAvatarFallbackDelay" type="number" default="0">
  Define a delay before the fallback is shown. This is useful to only show the fallback for those
  with slower connections.
</response-field>

## Global Configuration

You can configure the default options for all avatars in your application by using the `provideAvatarConfig` function in a providers array.

```ts
import { provideAvatarConfig } from 'ng-primitives/avatar';

bootstrapApplication(AppComponent, {
  providers: [provideAvatarConfig({ delay: 1000 })],
});
```

### NgpAvatarConfig

<response-field name="delay" type="number">
  Define a delay before the fallback is shown. This is useful to only show the fallback for those
  with slower connections.
</response-field>
