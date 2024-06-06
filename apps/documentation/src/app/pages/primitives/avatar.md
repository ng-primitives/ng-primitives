---
title: 'Avatar'
---

# Avatar

Display an image that represents a user with a text fallback.

<docs-example name="avatar"></docs-example>

## Usage

Assemble the avatar directives in your template.

```html
<span ngpAvatar>
  <img ngpAvatarImage src="..." alt="..." />
  <span ngpAvatarFallback>NG</span>
</span>
```

## API Reference

The following directives are available to import from the `@ng-primitives/ng-primitives/avatar` package:

### NgpAvatarDirective

There are no inputs or outputs for this directive.

### NgpAvatarImageDirective

There are no inputs or outputs for this directive.

### NgpAvatarFallbackDirective

<response-field name="ngpAvatarFallbackDelay" type="number" default="0">
  Define a delay before the fallback is shown. This is useful to only show the fallback for those
  with slower connections.
</response-field>

## Global Configuration

You can configure the default options for all avatars in your application by using the `provideNgpAvatarConfig` function in a providers array.

```ts
import { provideAvatarConfig } from '@ng-primitives/ng-primitives';

bootstrapApplication(AppComponent, {
  providers: [provideAvatarConfig({ delay: 1000 })],
});
```

### NgpAvatarConfig

<response-field name="delay" type="number">
  Define a delay before the fallback is shown. This is useful to only show the fallback for those
  with slower connections.
</response-field>
