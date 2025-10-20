import {
  computed,
  ElementRef,
  FactoryProvider,
  HOST_TAG_NAME,
  inject,
  InjectionToken,
  Signal,
  Type,
} from '@angular/core';
import { ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import { ngpRovingFocusItemPattern } from 'ng-primitives/roving-focus';
import { attrBinding, dataBinding, listener, onDestroy } from 'ng-primitives/state';
import { injectTabsetPattern } from '../tabset/tabset-pattern';

/**
 * The state interface for the TabButton pattern.
 */
export interface NgpTabButtonState {
  /**
   * Determine a unique id for the tab button if not provided
   */
  readonly buttonId: Signal<string>;

  /**
   * Determine the aria-controls of the tab button
   */
  readonly ariaControls: Signal<string>;

  /**
   * Whether the tab is active
   */
  readonly active: Signal<boolean>;

  /**
   * The value of the tab button
   */
  readonly value: Signal<string | undefined>;

  /**
   * Whether the tab is disabled
   */
  readonly disabled: Signal<boolean>;

  /**
   * Select the tab this trigger controls
   */
  select(): void;

  /**
   * On focus select the tab this trigger controls if activateOnFocus is true
   */
  activateOnFocus(): void;
}

/**
 * The props interface for the TabButton pattern.
 */
export interface NgpTabButtonProps {
  /**
   * The element reference for the tab-button.
   */
  element?: ElementRef<HTMLElement>;

  /**
   * The value of the tab this trigger controls
   */
  value: Signal<string | undefined>;

  /**
   * Whether the tab is disabled
   */
  disabled: Signal<boolean>;

  /**
   * Determine the id of the tab button
   */
  id?: Signal<string | undefined>;
}

/**
 * The TabButton pattern function.
 */
export function ngpTabButtonPattern({
  element = injectElementRef(),
  value,
  disabled,
  id,
}: NgpTabButtonProps): NgpTabButtonState {
  const tagName = inject(HOST_TAG_NAME);
  const tabset = injectTabsetPattern();

  // Computed properties
  const buttonId = computed(() => id?.() ?? `${tabset.id()}-button-${value()}`);
  const ariaControls = computed(() => `${tabset.id()}-panel-${value()}`);
  const active = computed(() => tabset.selectedTab() === value());

  // Host bindings
  attrBinding(element, 'id', buttonId);
  attrBinding(element, 'role', 'tab');
  attrBinding(element, 'aria-controls', ariaControls);
  dataBinding(element, 'data-active', active);
  dataBinding(element, 'data-disabled', disabled);
  attrBinding(element, 'disabled', () => (tagName === 'button' && disabled() ? '' : null));
  dataBinding(element, 'data-orientation', tabset.orientation);

  // Interactions
  ngpInteractions({
    hover: true,
    press: true,
    focusVisible: true,
    disabled,
    element,
  });

  // Roving focus item - this runs
  ngpRovingFocusItemPattern({
    element,
    disabled,
  });

  // Methods
  const select = () => {
    // Only select if not disabled
    if (disabled()) {
      return;
    }
    tabset.select(value()!);
  };

  const activateOnFocus = () => {
    if (tabset.activateOnFocus()) {
      select();
    }
  };

  // Event listeners
  listener(element, 'click', select);
  listener(element, 'focus', activateOnFocus);

  const state: NgpTabButtonState = {
    buttonId,
    ariaControls,
    active,
    value,
    disabled,
    select,
    activateOnFocus,
  };

  tabset.registerTab(state);
  onDestroy(() => tabset.unregisterTab(state));

  return state;
}

/**
 * The injection token for the TabButton pattern.
 */
export const NgpTabButtonPatternToken = new InjectionToken<NgpTabButtonState>(
  'NgpTabButtonPatternToken',
);

/**
 * Injects the TabButton pattern.
 */
export function injectTabButtonPattern(): NgpTabButtonState {
  return inject(NgpTabButtonPatternToken);
}

/**
 * Provides the TabButton pattern.
 */
export function provideTabButtonPattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpTabButtonState,
): FactoryProvider {
  return { provide: NgpTabButtonPatternToken, useFactory: () => fn(inject(type)) };
}
