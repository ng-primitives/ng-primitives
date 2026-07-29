import { DestroyRef, Directive, inject } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { injectDrawerState, requireDrawerState } from '../internal/drawer-state';

@Directive({
  selector: '[ngpDrawerContent]',
  standalone: true,
  host: { 'data-drawer-content': '' },
})
export class NgpDrawerContent {
  private readonly elementRef = injectElementRef<HTMLElement>();
  private readonly state = requireDrawerState(
    injectDrawerState({ optional: true }),
    'ngpDrawerContent',
  );

  constructor() {
    const unregister = this.state.registerElement(this.elementRef.nativeElement);
    inject(DestroyRef).onDestroy(unregister);
  }
}
