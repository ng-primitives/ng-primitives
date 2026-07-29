import { computed, DestroyRef, Directive, inject, input } from '@angular/core';
import { injectElementRef, explicitEffect } from 'ng-primitives/internal';
import { createDrawerId } from '../internal/dom';
import { injectDrawerState, requireDrawerState } from '../internal/drawer-state';

@Directive({
  selector: '[ngpDrawerTitle]',
  standalone: true,
  host: { '[attr.id]': 'resolvedId()' },
})
export class NgpDrawerTitle {
  readonly id = input<string | undefined>(undefined, { alias: 'id' });
  private readonly generatedId = createDrawerId('title');
  readonly resolvedId = computed(() => this.id() || this.generatedId);

  private readonly elementRef = injectElementRef<HTMLElement>();
  private readonly state = requireDrawerState(
    injectDrawerState({ optional: true }),
    'ngpDrawerTitle',
  );

  constructor() {
    const unregisterElement = this.state.registerElement(this.elementRef.nativeElement);
    explicitEffect([this.resolvedId], ([id], onCleanup) => onCleanup(this.state.registerTitle(id)));
    inject(DestroyRef).onDestroy(unregisterElement);
  }
}
