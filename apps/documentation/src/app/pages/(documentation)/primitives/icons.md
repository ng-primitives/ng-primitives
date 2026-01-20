---
name: 'Icons'
sourceUrl: 'https://github.com/ng-primitives/ng-primitives/tree/main/packages/ng-primitives/icons'
---

# Icons

Enhance your application by providing a visually appealing and intuitive way to represent actions, statuses, and features. Icons improve user experience, aid in navigation, and help convey information quickly.

We also maintain the popular [Angular Icons library](https://ng-icons.github.io/ng-icons) which gives you access to over 50,000 icons from popular icon libraries like Font Awesome, Material Design, Heroicons and more.

## Import

The `NgIcon` component is used to render icons in your application. To use icons, you need to import the `NgIcon` directive from `@ng-icons/core`.

Icons must be registered using the `provideIcons` function. The icons you want to use must be individually imported from their respective packages.

```ts
import { NgIcon, provideIcons } from '@ng-icons/core';
import { featherAirplay } from '@ng-icons/feather-icons';
import { heroUsers } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-root',
  template: `
    <ng-icon name="featherAirplay" />
    <ng-icon name="heroUsers" />
  `,
  imports: [NgIcon],
  providers: [provideIcons({ featherAirplay, heroUsers })],
})
export class AppComponent {}
```

View the full list of available icons in the [Angular Icons documentation](https://ng-icons.github.io/ng-icons/#/browse-icons).
