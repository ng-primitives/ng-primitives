import { DestroyRef, Directive, inject } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { dataBinding } from 'ng-primitives/state';
import { NGP_DRAWER_DATA_ATTRIBUTES } from '../drawer.constants';
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
    dataBinding(this.elementRef, NGP_DRAWER_DATA_ATTRIBUTES.open, () => this.state.open());
    dataBinding(this.elementRef, NGP_DRAWER_DATA_ATTRIBUTES.closed, () => !this.state.open());
    if (this.state.startingStyle()) {
      this.elementRef.nativeElement.setAttribute(NGP_DRAWER_DATA_ATTRIBUTES.startingStyle, '');
    }
    dataBinding(this.elementRef, NGP_DRAWER_DATA_ATTRIBUTES.startingStyle, () =>
      this.state.startingStyle(),
    );
    dataBinding(this.elementRef, NGP_DRAWER_DATA_ATTRIBUTES.endingStyle, () =>
      this.state.endingStyle(),
    );
    dataBinding(
      this.elementRef,
      NGP_DRAWER_DATA_ATTRIBUTES.swipeDismiss,
      () => this.state.swipeDismiss() !== null,
    );
    dataBinding(this.elementRef, NGP_DRAWER_DATA_ATTRIBUTES.swiping, () => this.state.swiping());
    bindDrawerNestedVisuals(this.elementRef, this.state, this.destroyRef);
    this.destroyRef.onDestroy(unregister);
  }
}
