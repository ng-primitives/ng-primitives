import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import {
  computed,
  ElementRef,
  FactoryProvider,
  inject,
  InjectionToken,
  signal,
  Signal,
  Type,
} from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, listener, onDestroy } from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { injectRovingFocusGroupPattern } from '../roving-focus-group/roving-focus-group-pattern';

/**
 * The state interface for the RovingFocusItem pattern.
 */
export interface NgpRovingFocusItemState {
  readonly id: Signal<string>;
  readonly disabled: Signal<boolean>;
  readonly tabindex: Signal<number>;
  readonly element: ElementRef<HTMLElement>;
  focus(origin: FocusOrigin): void;
}

/**
 * The props interface for the RovingFocusItem pattern.
 */
export interface NgpRovingFocusItemProps {
  /**
   * The element reference for the roving-focus-item.
   */
  readonly element?: ElementRef<HTMLElement>;
  /**
   * Whether the item is disabled.
   */
  readonly disabled: Signal<boolean>;
}

/**
 * The RovingFocusItem pattern function.
 */
export function ngpRovingFocusItemPattern({
  element = injectElementRef<HTMLElement>(),
  disabled = signal(false),
}: NgpRovingFocusItemProps): NgpRovingFocusItemState {
  const group = injectRovingFocusGroupPattern();
  const focusMonitor = inject(FocusMonitor);

  // genertate a unique id for the roving focus item - this is not a DOM id but an internal identifier
  const id = uniqueId('ngp-roving-focus-item');

  /**
   * Derive the tabindex of the roving focus item.
   */
  const tabindex = computed(() => (!group.disabled() && group.activeItem() === id ? 0 : -1));

  // Setup host attribute bindings
  attrBinding(element, 'tabindex', () => tabindex().toString());

  // Setup keyboard event listener
  listener(element, 'keydown', (event: KeyboardEvent) => {
    if (disabled()) {
      return;
    }
    group.onKeydown(event);
  });

  // Setup click event listener
  listener(element, 'click', () => {
    if (disabled()) {
      return;
    }
    group.setActiveItem(id, 'mouse');
  });

  function focus(origin: FocusOrigin): void {
    focusMonitor.focusVia(element, origin);
  }

  const state: NgpRovingFocusItemState = {
    id: signal(id),
    disabled,
    tabindex,
    focus,
    element,
  };

  // Register the item with the roving focus group
  group.register(state);

  // Unregister the item when destroyed
  onDestroy(() => group.unregister(state));

  return state;
}

/**
 * The injection token for the RovingFocusItem pattern.
 */
export const NgpRovingFocusItemPatternToken = new InjectionToken<NgpRovingFocusItemState>(
  'NgpRovingFocusItemPatternToken',
);

/**
 * Injects the RovingFocusItem pattern.
 */
export function injectRovingFocusItemPattern(): NgpRovingFocusItemState {
  return inject(NgpRovingFocusItemPatternToken);
}

/**
 * Provides the RovingFocusItem pattern.
 */
export function provideRovingFocusItemPattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpRovingFocusItemState,
): FactoryProvider {
  return { provide: NgpRovingFocusItemPatternToken, useFactory: () => fn(inject(type)) };
}
