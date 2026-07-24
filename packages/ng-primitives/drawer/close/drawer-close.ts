import { booleanAttribute, DestroyRef, Directive, inject, input } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { injectDrawerState, requireDrawerState } from '../internal/drawer-state';

@Directive({
  selector: '[ngpDrawerClose]',
  standalone: true,
  host: {
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '[attr.data-disabled]': 'disabled() ? "" : null',
    '(click)': 'close($event)',
  },
})
export class NgpDrawerClose {
  readonly disabled = input(false, { transform: booleanAttribute });

  private readonly elementRef = injectElementRef<HTMLElement>();
  private readonly stateRef = injectDrawerState({ optional: true });
  private readonly state = requireDrawerState(this.stateRef, 'ngpDrawerClose');

  constructor() {
    const element = this.elementRef.nativeElement;
    const unregisterElement = this.state.registerElement(element);
    if (element instanceof HTMLButtonElement && !element.hasAttribute('type')) {
      element.type = 'button';
    }
    inject(DestroyRef).onDestroy(unregisterElement);
  }

  close(event: Event): void {
    if (this.disabled()) {
      event.preventDefault();
      return;
    }
    this.state.requestOpen(false, 'close-press', { nativeEvent: event });
  }
}
