import { Provider } from '@angular/core';
import { ControlContainer } from '@angular/forms';

/**
 * Provide a null `ControlContainer` at the element level of an overlay-content root directive
 * (e.g. `NgpPopover`, `NgpTooltip`, `NgpMenu`).
 *
 * Overlay content is portaled but its template is often declared inside a form, so its
 * element-injector chain can reach that outer form's `ControlContainer` and leak it into the
 * overlay (ngp#677 / angular#57390). This backstop resolves `ControlContainer` to `null` at the
 * content root: a form declared *inside* the content sits closer in the injector chain and still
 * wins, while a control with no inner form resolves to `null` here instead of escaping to the
 * outer form.
 *
 * Pairs with the `EmbeddedViewInjector` in `overlay.ts`, which returns `notFoundValue` for the
 * `Host`/`SkipSelf` `ControlContainer` lookup so the element-injector walk runs and reaches this.
 */
export function provideControlContainerIsolation(): Provider {
  return { provide: ControlContainer, useValue: null };
}
