import { ElementRef, Signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { injectOverlayContext } from 'ng-primitives/portal';
import { attrBinding, createPrimitive } from 'ng-primitives/state';

export interface NgpTooltipTextContentState {
  /** Access the component's context. */
  readonly elementRef: ElementRef;
  /** The string content to display. */
  readonly content: Signal<unknown>;
}

export interface NgpTooltipTextContentProps {}

export const [
  NgpTooltipTextContentStateToken,
  ngpTooltipTextContent,
  injectTooltipTextContentState,
  provideTooltipTextContentState,
] = createPrimitive('NgpTooltipTextContent', ({}: NgpTooltipTextContentProps) => {
  const elementRef = injectElementRef();
  const content = injectOverlayContext();

  // Host bindings
  attrBinding(elementRef, 'ngpTooltip', '');

  return { elementRef, content } satisfies NgpTooltipTextContentState;
});
