import { DestroyRef, Directive, inject } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { dataBinding } from 'ng-primitives/state';
import { injectDrawerState, requireDrawerState } from '../internal/drawer-state';
import { bindDrawerNestedVisuals } from '../internal/nested-visuals';
import { initializeDrawerVisualProperties } from '../internal/visual-properties';

@Directive({
  selector: '[ngpDrawerBackdrop]',
  standalone: true,
})
export class NgpDrawerBackdrop {
  private readonly elementRef = injectElementRef<HTMLElement>();
  private readonly destroyRef = inject(DestroyRef);

  private readonly state = requireDrawerState(
    injectDrawerState({ optional: true }),
    'ngpDrawerBackdrop',
  );
  constructor() {
    initializeDrawerVisualProperties(this.elementRef.nativeElement);
    const unregister = this.state.setPartElement('backdrop', this.elementRef.nativeElement);
    dataBinding(this.elementRef, 'data-open', () => this.state.open());
    dataBinding(this.elementRef, 'data-closed', () => !this.state.open());
    if (this.state.startingStyle()) {
      this.elementRef.nativeElement.setAttribute('data-starting-style', '');
    }
    dataBinding(this.elementRef, 'data-starting-style', () => this.state.startingStyle());
    dataBinding(this.elementRef, 'data-ending-style', () => this.state.endingStyle());
    dataBinding(this.elementRef, 'data-swipe-dismiss', () => this.state.swipeDismiss() !== null);
    dataBinding(this.elementRef, 'data-swiping', () => this.state.swiping());
    bindDrawerNestedVisuals(this.elementRef, this.state, this.destroyRef);
    this.destroyRef.onDestroy(unregister);
  }
}
