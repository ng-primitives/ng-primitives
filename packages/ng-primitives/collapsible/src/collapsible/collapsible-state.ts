import { signal, Signal, WritableSignal } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { injectElementRef } from 'ng-primitives/internal';
import {
  controlled,
  controlledState,
  createPrimitive,
  dataBinding,
  deprecatedSetter,
  SetterOptions,
} from 'ng-primitives/state';
import { Observable } from 'rxjs';

/**
 * The shared state for the Collapsible primitive. This is the reusable core
 * behind both the standalone collapsible and each accordion item - the trigger
 * and content parts read their open/disabled/orientation state and their
 * registered ids from here.
 */
export interface NgpCollapsibleState {
  /**
   * Whether the collapsible is open.
   */
  readonly open: WritableSignal<boolean>;
  /**
   * Whether the collapsible is disabled.
   */
  readonly disabled: WritableSignal<boolean>;
  /**
   * The orientation of the collapsible.
   */
  readonly orientation: Signal<NgpOrientation>;
  /**
   * Emits when the open state changes.
   */
  readonly openChange: Observable<boolean>;
  /**
   * The id of the trigger, registered by the trigger part.
   */
  readonly triggerId: Signal<string | undefined>;
  /**
   * The id of the content, registered by the content part.
   */
  readonly contentId: Signal<string | undefined>;
  /**
   * Toggle the open state.
   */
  toggle(): void;
  /**
   * Set the open state.
   */
  setOpen(value: boolean, options?: SetterOptions): void;
  /**
   * Set the disabled state.
   */
  setDisabled(value: boolean): void;
  /**
   * Set the default open state.
   */
  setDefaultOpen(value: boolean): void;
  /**
   * Register the trigger id.
   * @internal
   */
  setTrigger(id: string): void;
  /**
   * Register the content id.
   * @internal
   */
  setContent(id: string): void;
}

/**
 * Inputs for configuring the Collapsible primitive.
 */
export interface NgpCollapsibleProps {
  /**
   * Whether the collapsible is open. Leave `undefined` for uncontrolled usage.
   */
  readonly open: Signal<boolean | undefined>;
  /**
   * The default open state for uncontrolled usage.
   */
  readonly defaultOpen?: Signal<boolean>;
  /**
   * Whether the collapsible is disabled.
   */
  readonly disabled?: Signal<boolean>;
  /**
   * The orientation of the collapsible.
   */
  readonly orientation?: Signal<NgpOrientation>;
  /**
   * Callback fired when the open state changes.
   */
  readonly onOpenChange?: (open: boolean) => void;
}

export const [
  NgpCollapsibleStateToken,
  ngpCollapsible,
  injectCollapsibleState,
  provideCollapsibleState,
] = createPrimitive(
  'NgpCollapsible',
  ({
    open: _open,
    defaultOpen: _defaultOpen,
    disabled: _disabled,
    orientation: _orientation,
    onOpenChange,
  }: NgpCollapsibleProps): NgpCollapsibleState => {
    const element = injectElementRef<HTMLElement>();

    const defaultOpen = controlled(_defaultOpen, false);
    const disabled = controlled(_disabled, false);
    const orientation = controlled(_orientation, 'vertical');

    // controlledState is used (rather than a plain `controlled`) so that when an
    // owner controls `open` - e.g. an accordion group that may reject a toggle
    // in single, non-collapsible mode - the local state never desyncs from it.
    const [open, setOpen, openChange] = controlledState({
      value: _open,
      defaultValue: defaultOpen,
      onChange: onOpenChange,
    });

    const trigger = signal<string | undefined>(undefined);
    const content = signal<string | undefined>(undefined);

    // Host bindings
    dataBinding(element, 'data-open', open);
    dataBinding(element, 'data-closed', () => !open());
    dataBinding(element, 'data-disabled', disabled);
    dataBinding(element, 'data-orientation', orientation);

    function toggle(): void {
      if (disabled()) {
        return;
      }
      setOpen(!open());
    }

    function setDisabled(value: boolean): void {
      disabled.set(value);
    }

    function setTrigger(id: string): void {
      trigger.set(id);
    }

    function setContent(id: string): void {
      content.set(id);
    }

    return {
      open: deprecatedSetter(open, 'setOpen', setOpen),
      disabled: deprecatedSetter(disabled, 'setDisabled', setDisabled),
      orientation,
      openChange,
      triggerId: trigger,
      contentId: content,
      toggle,
      setOpen,
      setDisabled,
      setDefaultOpen: defaultOpen.set,
      setTrigger,
      setContent,
    } satisfies NgpCollapsibleState;
  },
);
