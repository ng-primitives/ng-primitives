import { DestroyRef, Directive, inject } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { dataBinding } from 'ng-primitives/state';
import { NGP_DRAWER_DATA_ATTRIBUTES } from '../drawer.constants';
import { injectDrawerState, requireDrawerState } from '../internal/drawer-state';

@Directive({
  selector: '[ngpDrawerContent]',
  standalone: true,
})
export class NgpDrawerContent {
  private readonly elementRef = injectElementRef<HTMLElement>();
  private readonly state = requireDrawerState(
    injectDrawerState({ optional: true }),
    'ngpDrawerContent',
  );

  constructor() {
    dataBinding(this.elementRef, NGP_DRAWER_DATA_ATTRIBUTES.content, true);
    const unregister = this.state.registerElement(this.elementRef.nativeElement);
    inject(DestroyRef).onDestroy(unregister);
  }
}
