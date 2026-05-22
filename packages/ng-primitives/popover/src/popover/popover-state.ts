import { signal, Signal } from '@angular/core';
import { explicitEffect, injectElementRef } from 'ng-primitives/internal';
import { injectOverlay } from 'ng-primitives/portal';
import {
  attrBinding,
  controlled,
  createPrimitive,
  dataBinding,
  styleBinding,
} from 'ng-primitives/state';

export interface NgpPopoverState {
  /** The unique id of the tooltip. */
  readonly id: Signal<string>;
}

export interface NgpPopoverProps {
  /** The unique id of the tooltip. */
  readonly id?: Signal<string>;
}

export const [NgpPopoverStateToken, ngpPopover, injectPopoverState, providePopoverState] =
  createPrimitive('NgpPopover', ({ id: _id = signal<string>('') }: NgpPopoverProps) => {
    const elementRef = injectElementRef<HTMLElement>();

    const overlay = injectOverlay();
    const id = controlled(_id);

    id.set(overlay.id());

    // Host binding
    attrBinding(elementRef, 'id', _id);
    styleBinding(elementRef, 'left.px', () => overlay.position().x ?? null);
    styleBinding(elementRef, 'top.px', () => overlay.position().y ?? null);
    styleBinding(elementRef, '--ngp-popover-trigger-width.px', overlay.triggerWidth());
    styleBinding(elementRef, '--ngp-popover-transform-origin', overlay.transformOrigin());
    styleBinding(elementRef, '--ngp-popover-available-width.px', overlay.availableWidth());
    styleBinding(elementRef, '--ngp-popover-available-height.px', overlay.availableHeight());
    dataBinding(elementRef, 'data-placement', () => (overlay.finalPlacement() ? '' : null));
    dataBinding(elementRef, 'data-overlay', '');

    // Effect handle
    explicitEffect([_id], ([id]) => overlay.id.set(id));

    return {
      id: _id,
    } satisfies NgpPopoverState;
  });
