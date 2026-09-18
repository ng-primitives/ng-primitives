import { Signal, signal } from '@angular/core';
import { explicitEffect, injectElementRef } from 'ng-primitives/internal';
import { injectOverlay } from 'ng-primitives/portal';
import {
  attrBinding,
  controlled,
  createPrimitive,
  dataBinding,
  listener,
  styleBinding,
} from 'ng-primitives/state';
import { injectPreviewCardTriggerState } from '../preview-card-trigger/preview-card-trigger-state';

export interface NgpPreviewCardState {
  /** The unique id of the preview card. */
  readonly id: Signal<string>;
}

export interface NgpPreviewCardProps {
  /** The unique id of the preview card. */
  readonly id?: Signal<string>;
}

export const [
  NgpPreviewCardStateToken,
  ngpPreviewCard,
  injectPreviewCardState,
  providePreviewCardState,
] = createPrimitive('NgpPreviewCard', ({ id: _id = signal<string>('') }: NgpPreviewCardProps) => {
  const elementRef = injectElementRef<HTMLElement>();
  const overlay = injectOverlay();
  const triggerState = injectPreviewCardTriggerState();

  const id = controlled(_id);

  // Report hover back to the trigger so the card stays open while the pointer is
  // inside it, and closes once the pointer leaves both the card and the trigger.
  // Touch is ignored here for the same reason it is on the trigger.
  listener(elementRef, 'pointerenter', (event: PointerEvent) => {
    if (event.pointerType === 'touch') {
      return;
    }

    triggerState().setPointerOverCard(true);
  });

  listener(elementRef, 'pointerleave', (event: PointerEvent) => {
    if (event.pointerType === 'touch') {
      return;
    }

    triggerState().setPointerOverCard(false);
  });

  // The card is portalled outside the trigger, so focus leaving it never reaches the
  // trigger's own focusout listener and has to be forwarded.
  listener(elementRef, 'focusout', (event: FocusEvent) =>
    triggerState().onCardFocusOut(event.relatedTarget),
  );

  // Seed the id with the overlay's generated unique id so the card always has a
  // valid id when none is provided. `controlled` returns a linkedSignal, so this is
  // only a transient default: if a consumer binds `id`, that source change wins.
  id.set(overlay.id());

  // Host bindings.
  //
  // Deliberately no `role`: a preview card is not exposed to assistive technology,
  // and neither `tooltip` (which would describe the trigger with a whole
  // interactive card) nor `dialog` (which implies focus management we do not do)
  // is correct. `tabindex="-1"` keeps the card root itself out of the tab
  // sequence while leaving any focusable content inside it reachable.
  attrBinding(elementRef, 'id', id);
  attrBinding(elementRef, 'tabindex', '-1');
  dataBinding(elementRef, 'data-overlay', '');
  dataBinding(elementRef, 'data-placement', () => overlay.finalPlacement()?.toString() ?? null);
  styleBinding(elementRef, 'left.px', () => overlay.position().x ?? null);
  styleBinding(elementRef, 'top.px', () => overlay.position().y ?? null);
  styleBinding(elementRef, '--ngp-preview-card-trigger-width.px', () => overlay.triggerWidth());
  styleBinding(elementRef, '--ngp-preview-card-transform-origin', () => overlay.transformOrigin());
  styleBinding(elementRef, '--ngp-preview-card-available-width.px', () => overlay.availableWidth());
  styleBinding(elementRef, '--ngp-preview-card-available-height.px', () =>
    overlay.availableHeight(),
  );

  // Effects
  explicitEffect([id], ([id]) => overlay.id.set(id));

  return {
    id,
  } satisfies NgpPreviewCardState;
});
