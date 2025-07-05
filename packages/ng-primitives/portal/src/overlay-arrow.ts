import { DestroyRef, afterRenderEffect, inject } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { injectOverlay } from './overlay';

export function setupOverlayArrow(): void {
  const overlay = injectOverlay();
  const element = injectElementRef();
  const destroyRef = inject(DestroyRef);

  // register the arrow element with the overlay
  overlay.registerArrow(element.nativeElement);

  // cleanup the arrow element on destroy
  destroyRef.onDestroy(() => overlay.unregisterArrow());

  // update the arrow position after the overlay is rendered
  afterRenderEffect(() => {
    const position = overlay.arrowPosition();
    element.nativeElement.style.setProperty('inset-inline-start', `${position.x}px`);
    element.nativeElement.style.setProperty('inset-block-start', `${position.y}px`);
    element.nativeElement.dataset['placement'] = overlay.finalPlacement();
  });
}
