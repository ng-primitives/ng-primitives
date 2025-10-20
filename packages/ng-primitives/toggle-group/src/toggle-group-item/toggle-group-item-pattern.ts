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
import { attrBinding, dataBinding, listener } from '@ng-primitives/state';
import { injectElementRef } from 'ng-primitives/internal';
import { injectToggleGroupPattern } from '../toggle-group/toggle-group-pattern';

/**
 * The state interface for the ToggleGroupItem pattern.
 */
export interface NgpToggleGroupItemState {
  selected: Signal<boolean>;
  toggle(): void;
}

/**
 * The props interface for the ToggleGroupItem pattern.
 */
export interface NgpToggleGroupItemProps {
  /**
   * The element reference for the toggle-group-item.
   */
  element?: ElementRef<HTMLElement>;

  /**
   * The value of the toggle group item.
   */
  value: Signal<string>;

  /**
   * Whether the toggle group item is disabled.
   */
  disabled?: Signal<boolean>;
}

/**
 * The ToggleGroupItem pattern function.
 */
export function ngpToggleGroupItemPattern({
  element = injectElementRef(),
  value,
  disabled = signal(false),
  // Add other props
}: NgpToggleGroupItemProps): NgpToggleGroupItemState {
  const toggleGroup = injectToggleGroupPattern();

  // Whether the item is selected.
  const selected = computed(() => toggleGroup.isSelected(value()!));

  // Host bindings
  attrBinding(element, 'role', 'radio');
  attrBinding(element, 'aria-checked', selected);
  dataBinding(element, 'data-selected', selected);
  attrBinding(element, 'aria-disabled', disabled);
  dataBinding(element, 'data-disabled', disabled);

  // Host listener
  listener(element, 'click', () => toggle());

  // Toggle the item.
  const toggle = (): void => {
    if (disabled?.()) {
      return;
    }
    toggleGroup.toggle(value()!);
  };

  return { selected, toggle };
}

/**
 * The injection token for the ToggleGroupItem pattern.
 */
export const NgpToggleGroupItemPatternToken = new InjectionToken<NgpToggleGroupItemState>(
  'NgpToggleGroupItemPatternToken',
);

/**
 * Injects the ToggleGroupItem pattern.
 */
export function injectToggleGroupItemPattern(): NgpToggleGroupItemState {
  return inject(NgpToggleGroupItemPatternToken);
}

/**
 * Provides the ToggleGroupItem pattern.
 */
export function provideToggleGroupItemPattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpToggleGroupItemState,
): FactoryProvider {
  return { provide: NgpToggleGroupItemPatternToken, useFactory: () => fn(inject(type)) };
}
