import { computed, DestroyRef, Directive, inject, input } from '@angular/core';
import { injectElementRef, explicitEffect } from 'ng-primitives/internal';
import { createDrawerId } from '../internal/dom';
import { injectDrawerState, requireDrawerState } from '../internal/drawer-state';

@Directive({
  selector: '[ngpDrawerDescription]',
  standalone: true,
  host: { '[attr.id]': 'resolvedId()' },
})
export class NgpDrawerDescription {
  readonly id = input<string | undefined>(undefined, { alias: 'id' });
  private readonly generatedId = createDrawerId('description');
  readonly resolvedId = computed(() => this.id() || this.generatedId);

  private readonly elementRef = injectElementRef<HTMLElement>();
  private readonly state = requireDrawerState(
    injectDrawerState({ optional: true }),
    'ngpDrawerDescription',
  );

  constructor() {
    const unregisterElement = this.state.registerElement(this.elementRef.nativeElement);
    explicitEffect([this.resolvedId], ([id], onCleanup) =>
      onCleanup(this.state.registerDescription(id)),
    );
    inject(DestroyRef).onDestroy(unregisterElement);
  }
}
