import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, numberAttribute } from '@angular/core';
import {
  coerceFlip,
  coerceOffset,
  coerceShift,
  NgpFlip,
  NgpFlipInput,
  NgpOffset,
  NgpOffsetInput,
  NgpOverlayContent,
  NgpPlacement,
  NgpPosition,
  NgpShift,
  NgpShiftInput,
} from 'ng-primitives/portal';
import { isString } from 'ng-primitives/utils';
import { injectTooltipConfig } from '../config/tooltip-config';
import { ngpTooltipTrigger, provideTooltipTriggerState } from './tooltip-trigger-state';

type TooltipInput<T> = NgpOverlayContent<T> | string | null | undefined;

/**
 * Apply the `ngpTooltipTrigger` directive to an element that triggers the tooltip to show.
 */
@Directive({
  selector: '[ngpTooltipTrigger]',
  exportAs: 'ngpTooltipTrigger',
  providers: [provideTooltipTriggerState({ inherit: false })],
})
export class NgpTooltipTrigger<T = null> {
  /**
   * Access the global tooltip configuration.
   */
  private readonly config = injectTooltipConfig();

  /**
   * Access the tooltip template ref.
   */
  readonly tooltip = input<NgpOverlayContent<T> | string | null, TooltipInput<T>>(null, {
    alias: 'ngpTooltipTrigger',
    transform: (value: TooltipInput<T>) => (value && !isString(value) ? value : null),
  });

  /**
   * Whether the tooltip is disabled. This allows the tooltip to be enabled or disabled dynamically.
   * @default false
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpTooltipTriggerDisabled',
    transform: booleanAttribute,
  });

  /**
   * Define the placement of the tooltip relative to the trigger.
   * @default 'top'
   */
  readonly placement = input<NgpPlacement>(this.config.placement, {
    alias: 'ngpTooltipTriggerPlacement',
  });

  /**
   * Define the offset of the tooltip relative to the trigger.
   * Can be a number (applies to mainAxis) or an object with mainAxis, crossAxis, and alignmentAxis.
   * @default 0
   */
  readonly offset = input<NgpOffset, NgpOffsetInput>(this.config.offset, {
    alias: 'ngpTooltipTriggerOffset',
    transform: coerceOffset,
  });

  /**
   * Define the delay before the tooltip is displayed.
   * @default 500
   */
  readonly showDelay = input<number, NumberInput>(this.config.showDelay, {
    alias: 'ngpTooltipTriggerShowDelay',
    transform: numberAttribute,
  });

  /**
   * Define the delay before the tooltip is hidden.
   * @default 0
   */
  readonly hideDelay = input<number, NumberInput>(this.config.hideDelay, {
    alias: 'ngpTooltipTriggerHideDelay',
    transform: numberAttribute,
  });

  /**
   * Define whether the tooltip should flip when there is not enough space for the tooltip.
   * Can be a boolean to enable/disable, or an object with padding and fallbackPlacements options.
   * @default true
   */
  readonly flip = input<NgpFlip, NgpFlipInput>(this.config.flip, {
    alias: 'ngpTooltipTriggerFlip',
    transform: coerceFlip,
  });

  /**
   * Configure shift behavior to keep the tooltip in view.
   * Can be a boolean to enable/disable, or an object with padding and limiter options.
   * @default undefined (enabled by default in overlay)
   */
  readonly shift = input<NgpShift, NgpShiftInput>(this.config.shift, {
    alias: 'ngpTooltipTriggerShift',
    transform: coerceShift,
  });

  /**
   * Define the container in which the tooltip should be attached.
   * @default document.body
   */
  readonly container = input<HTMLElement | string | null>(this.config.container, {
    alias: 'ngpTooltipTriggerContainer',
  });

  /**
   * Define whether the tooltip should only show when the trigger element overflows.
   * @default false
   */
  readonly showOnOverflow = input<boolean, BooleanInput>(this.config.showOnOverflow, {
    alias: 'ngpTooltipTriggerShowOnOverflow',
    transform: booleanAttribute,
  });

  /**
   * Define an anchor element for positioning the tooltip.
   * If provided, the tooltip will be positioned relative to this element instead of the trigger.
   *
   * The anchor is live, so rebinding it moves an open tooltip.
   *
   * An input only reaches this directive on the next change detection pass, which a press
   * can outrun - use `setAnchor()` instead when the anchor is claimed during one.
   */
  readonly anchor = input<HTMLElement | null>(null, { alias: 'ngpTooltipTriggerAnchor' });

  /**
   * Provide context to the tooltip. This can be used to pass data to the tooltip content.
   */
  readonly context = input<T>(undefined, {
    alias: 'ngpTooltipTriggerContext',
  });

  /**
   * Define whether to use the text content of the trigger element as the tooltip content.
   * When enabled, the tooltip will display the text content of the trigger element.
   * @default true
   */
  readonly useTextContent = input<boolean, BooleanInput>(this.config.useTextContent, {
    alias: 'ngpTooltipTriggerUseTextContent',
    transform: booleanAttribute,
  });

  /**
   * Define whether to track the trigger element position on every animation frame.
   * Useful for moving elements like slider thumbs.
   * @default false
   */
  readonly trackPosition = input<boolean, BooleanInput>(this.config.trackPosition, {
    alias: 'ngpTooltipTriggerTrackPosition',
    transform: booleanAttribute,
  });

  /**
   * Programmatic position for the tooltip. When provided, the tooltip
   * will be positioned at these coordinates instead of the trigger element.
   * Use with trackPosition="true" for smooth cursor following.
   */
  readonly position = input<NgpPosition | null>(null, {
    alias: 'ngpTooltipTriggerPosition',
  });

  /**
   * Defines how the tooltip behaves when the window is scrolled.
   * @default 'reposition'
   */
  readonly scrollBehavior = input<'reposition' | 'close'>(this.config.scrollBehavior, {
    alias: 'ngpTooltipTriggerScrollBehavior',
  });

  /**
   * Define the cooldown duration in milliseconds.
   * When moving from one tooltip to another within this duration,
   * the showDelay is skipped for the new tooltip.
   * @default 300
   */
  readonly cooldown = input<number, NumberInput>(this.config.cooldown, {
    alias: 'ngpTooltipTriggerCooldown',
    transform: numberAttribute,
  });

  /**
   * Whether hovering tooltip content keeps the tooltip open.
   * @default false
   */
  readonly hoverableContent = input<boolean, BooleanInput>(this.config.hoverableContent, {
    alias: 'ngpTooltipTriggerHoverableContent',
    transform: booleanAttribute,
  });

  protected readonly state = ngpTooltipTrigger({
    tooltip: this.tooltip,
    disabled: this.disabled,
    placement: this.placement,
    offset: this.offset,
    showDelay: this.showDelay,
    hideDelay: this.hideDelay,
    flip: this.flip,
    shift: this.shift,
    container: this.container,
    showOnOverflow: this.showOnOverflow,
    anchor: this.anchor,
    context: this.context,
    useTextContent: this.useTextContent,
    trackPosition: this.trackPosition,
    position: this.position,
    scrollBehavior: this.scrollBehavior,
    cooldown: this.cooldown,
    hoverableContent: this.hoverableContent,
  });

  /**
   * Show the tooltip programmatically (skips cooldown so multiple tooltips can coexist).
   */
  show(): void {
    return this.state.show();
  }

  /**
   * Hide the tooltip.
   * @param immediate Skip the hide delay and exit animation.
   */
  hide(immediate = false): void {
    return this.state.hide(immediate);
  }

  /**
   * Set the anchor the tooltip is positioned against, taking effect immediately rather than
   * on the next change detection pass.
   *
   * Reach for this over `ngpTooltipTriggerAnchor` when the anchor is claimed during a press.
   * Outside-press dismissal is decided on a capture-phase `mouseup`, which a fast tap can
   * deliver in the same frame as the `pointerdown` that claimed the anchor - before the
   * binding has reached this directive, so the press dismisses the overlay instead of moving
   * it. Writing the anchor here is visible to that check straight away.
   * @param anchor - The new anchor element
   */
  setAnchor(anchor: HTMLElement | null): void {
    this.state.setAnchor(anchor);
  }

  /**
   * Called by tooltip content when pointer enters the tooltip.
   * @internal
   */
  onTooltipHoverStart(): void {
    return this.state.onTooltipHoverStart();
  }

  /**
   * Called by tooltip content when pointer leaves the tooltip.
   * @internal
   */
  onTooltipHoverEnd(): void {
    return this.state.onTooltipHoverEnd();
  }

  /**
   * Set the tooltip id.
   */
  setTooltipId(id: string): void {
    return this.state.setTooltipId(id);
  }
}
