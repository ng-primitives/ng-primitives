import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  Directive,
  input,
  numberAttribute,
  OnDestroy,
  output,
} from '@angular/core';
import {
  coerceFlip,
  coerceOffset,
  coerceShift,
  NgpFlip,
  NgpFlipInput,
  NgpOffset,
  NgpOffsetInput,
  NgpOverlayContent,
  NgpShift,
  NgpShiftInput,
} from 'ng-primitives/portal';
import { injectPreviewCardConfig } from '../config/preview-card-config';
import {
  NgpPreviewCardPlacement,
  ngpPreviewCardTrigger,
  providePreviewCardTriggerState,
} from './preview-card-trigger-state';

/**
 * Apply the `ngpPreviewCardTrigger` directive to the element that reveals the preview card.
 *
 * This should be an element that is independently useful without the card - typically a
 * link to the content the card previews - because the card itself is not exposed to
 * assistive technology.
 */
@Directive({
  selector: '[ngpPreviewCardTrigger]',
  exportAs: 'ngpPreviewCardTrigger',
  providers: [providePreviewCardTriggerState({ inherit: false })],
})
export class NgpPreviewCardTrigger<T = null> implements OnDestroy {
  /**
   * Access the global preview card configuration.
   */
  private readonly config = injectPreviewCardConfig();

  /**
   * Access the preview card template ref.
   */
  readonly previewCard = input<NgpOverlayContent<T> | undefined>(undefined, {
    alias: 'ngpPreviewCardTrigger',
  });

  /**
   * Whether the preview card is disabled. This allows the preview card to be enabled or disabled dynamically.
   * @default false
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpPreviewCardTriggerDisabled',
    transform: booleanAttribute,
  });

  /**
   * Define the placement of the preview card relative to the trigger.
   * @default 'bottom'
   */
  readonly placement = input<NgpPreviewCardPlacement>(this.config.placement, {
    alias: 'ngpPreviewCardTriggerPlacement',
  });

  /**
   * Define the offset of the preview card relative to the trigger.
   * Can be a number (applies to mainAxis) or an object with mainAxis, crossAxis, and alignmentAxis.
   * @default 4
   */
  readonly offset = input<NgpOffset, NgpOffsetInput>(this.config.offset, {
    alias: 'ngpPreviewCardTriggerOffset',
    transform: coerceOffset,
  });

  /**
   * Define the delay before the preview card is displayed.
   * @default 600
   */
  readonly showDelay = input<number, NumberInput>(this.config.showDelay, {
    alias: 'ngpPreviewCardTriggerShowDelay',
    transform: numberAttribute,
  });

  /**
   * Define the delay before the preview card is hidden.
   * @default 300
   */
  readonly hideDelay = input<number, NumberInput>(this.config.hideDelay, {
    alias: 'ngpPreviewCardTriggerHideDelay',
    transform: numberAttribute,
  });

  /**
   * Define whether the preview card should flip when there is not enough space.
   * Can be a boolean to enable/disable, or an object with padding and fallbackPlacements options.
   * @default true
   */
  readonly flip = input<NgpFlip, NgpFlipInput>(this.config.flip, {
    alias: 'ngpPreviewCardTriggerFlip',
    transform: coerceFlip,
  });

  /**
   * Configure shift behavior to keep the preview card in view.
   * Can be a boolean to enable/disable, or an object with padding and limiter options.
   * @default undefined (enabled by default in overlay)
   */
  readonly shift = input<NgpShift, NgpShiftInput>(this.config.shift, {
    alias: 'ngpPreviewCardTriggerShift',
    transform: coerceShift,
  });

  /**
   * Define the container in which the preview card should be attached.
   * @default document.body
   */
  readonly container = input<HTMLElement | string | null>(this.config.container, {
    alias: 'ngpPreviewCardTriggerContainer',
  });

  /**
   * Define an anchor element for positioning the preview card.
   * If provided, the preview card will be positioned relative to this element instead of the trigger.
   */
  readonly anchor = input<HTMLElement | null>(null, {
    alias: 'ngpPreviewCardTriggerAnchor',
  });

  /**
   * Provide context to the preview card. This can be used to pass data to the preview card content.
   */
  readonly context = input<T>(undefined, {
    alias: 'ngpPreviewCardTriggerContext',
  });

  /**
   * Defines how the preview card behaves when the window is scrolled.
   * @default 'reposition'
   */
  readonly scrollBehavior = input<'reposition' | 'close'>(this.config.scrollBehavior, {
    alias: 'ngpPreviewCardTriggerScrollBehavior',
  });

  /**
   * Define the cooldown duration in milliseconds.
   * When moving from one preview card to another within this duration,
   * the showDelay is skipped for the new card.
   * @default 300
   */
  readonly cooldown = input<number, NumberInput>(this.config.cooldown, {
    alias: 'ngpPreviewCardTriggerCooldown',
    transform: numberAttribute,
  });

  /**
   * Emits when the open state of the preview card changes.
   */
  readonly openChange = output<boolean>({
    alias: 'ngpPreviewCardTriggerOpenChange',
  });

  protected readonly state = ngpPreviewCardTrigger({
    previewCard: this.previewCard,
    disabled: this.disabled,
    placement: this.placement,
    offset: this.offset,
    showDelay: this.showDelay,
    hideDelay: this.hideDelay,
    flip: this.flip,
    shift: this.shift,
    container: this.container,
    anchor: this.anchor,
    context: this.context,
    scrollBehavior: this.scrollBehavior,
    cooldown: this.cooldown,
    onOpenChange: (value: boolean) => this.openChange.emit(value),
  });

  ngOnDestroy(): void {
    this.state.destroy();
  }

  /**
   * Show the preview card.
   */
  show(): void {
    this.state.show();
  }

  /**
   * Hide the preview card.
   */
  hide(): void {
    this.state.hide();
  }
}
