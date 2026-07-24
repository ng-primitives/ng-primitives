import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, output } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { SetterOptions } from 'ng-primitives/state';
import { coerceBooleanOrUndefined } from 'ng-primitives/utils';
import { ngpCollapsible, provideCollapsibleState } from './collapsible-state';

/**
 * Apply the `ngpCollapsible` directive to an element that contains a collapsible
 * trigger and content. It manages the open state of a single disclosure.
 */
@Directive({
  selector: '[ngpCollapsible]',
  exportAs: 'ngpCollapsible',
  // inherit: false so nested collapsibles own independent state.
  providers: [provideCollapsibleState({ inherit: false })],
})
export class NgpCollapsible {
  /**
   * Whether the collapsible is open. Leave unset for uncontrolled usage.
   */
  readonly open = input<boolean | undefined, BooleanInput>(undefined, {
    alias: 'ngpCollapsibleOpen',
    transform: coerceBooleanOrUndefined,
  });

  /**
   * The default open state for uncontrolled usage.
   * @default false
   */
  readonly defaultOpen = input<boolean, BooleanInput>(false, {
    alias: 'ngpCollapsibleDefaultOpen',
    transform: booleanAttribute,
  });

  /**
   * Emits when the open state changes.
   */
  readonly openChange = output<boolean>({
    alias: 'ngpCollapsibleOpenChange',
  });

  /**
   * Whether the collapsible is disabled.
   * @default false
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpCollapsibleDisabled',
    transform: booleanAttribute,
  });

  /**
   * The orientation of the collapsible.
   * @default 'vertical'
   */
  readonly orientation = input<NgpOrientation>('vertical', {
    alias: 'ngpCollapsibleOrientation',
  });

  /**
   * The state for the collapsible primitive.
   */
  protected readonly state = ngpCollapsible({
    open: this.open,
    defaultOpen: this.defaultOpen,
    disabled: this.disabled,
    orientation: this.orientation,
    onOpenChange: value => this.openChange.emit(value),
  });

  /**
   * Toggle the open state.
   */
  toggle(): void {
    this.state.toggle();
  }

  /**
   * Set the open state.
   */
  setOpen(value: boolean, options?: SetterOptions): void {
    this.state.setOpen(value, options);
  }

  /**
   * Set the disabled state.
   */
  setDisabled(value: boolean): void {
    this.state.setDisabled(value);
  }
}
