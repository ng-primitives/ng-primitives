import { ElementRef, Signal, signal } from '@angular/core';
import { ngpHover } from 'ng-primitives/interactions';
import { explicitEffect, injectElementRef } from 'ng-primitives/internal';
import { injectOverlay } from 'ng-primitives/portal';
import {
  attrBinding,
  controlled,
  createPrimitive,
  dataBinding,
  styleBinding,
} from 'ng-primitives/state';
import { injectTooltipTriggerState } from '../tooltip-trigger/tooltip-trigger-state';

export interface NgpTooltipState {
  /** Access the element's reference. */
  readonly elementRef: ElementRef;
  /** The unique id of the tooltip. */
  readonly id: Signal<string>;
}

export interface NgpTooltipProps {
  /** The unique id of the tooltip. */
  readonly id?: Signal<string>;
}

export const [NgpTooltipStateToken, ngpTooltip, injectTooltipState, provideTooltipState] =
  createPrimitive('NgpTooltip', ({ id: _id = signal<string>('') }: NgpTooltipProps) => {
    const elementRef = injectElementRef();
    const tooltipTriggerState = injectTooltipTriggerState();
    const overlay = injectOverlay();

    const id = controlled(_id);

    // Seed the id with the overlay's generated unique id so the tooltip has a
    // valid id (and the trigger a valid aria-describedby) when none is provided.
    // `controlled` returns a linkedSignal, so this is only a transient default:
    // if a consumer binds `id`, that source change supersedes this seed.
    id.set(overlay.id());

    // Setup interactions
    ngpHover({
      onHoverStart: () => tooltipTriggerState().onTooltipHoverStart(),
      onHoverEnd: () => tooltipTriggerState().onTooltipHoverEnd(),
    });

    // Host binding
    attrBinding(elementRef, 'role', 'tooltip');
    attrBinding(elementRef, 'id', () => id());
    dataBinding(elementRef, 'data-overlay', '');
    dataBinding(elementRef, 'data-placement', () => overlay.finalPlacement()?.toString() ?? null);
    styleBinding(elementRef, 'left.px', () => overlay.position().x ?? null);
    styleBinding(elementRef, 'top.px', () => overlay.position().y ?? null);
    styleBinding(elementRef, '--ngp-tooltip-trigger-width.px', () => overlay.triggerWidth());
    styleBinding(elementRef, '--ngp-tooltip-transform-origin', () => overlay.transformOrigin());
    styleBinding(elementRef, '--ngp-tooltip-available-width.px', () => overlay.availableWidth());
    styleBinding(elementRef, '--ngp-tooltip-available-height.px', () => overlay.availableHeight());

    // Effects
    explicitEffect([id], ([id]) => overlay.id.set(id));

    return {
      elementRef,
      id,
    } satisfies NgpTooltipState;
  });
