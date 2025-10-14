import {
  ElementRef,
  FactoryProvider,
  inject,
  InjectionToken,
  OutputEmitterRef,
  Signal,
  Type,
} from '@angular/core';
import { setupFormControl } from 'ng-primitives/form-field';
import { ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, controlled, dataBinding, listener } from 'ng-primitives/state';

export interface NgpToggleState {
  id: Signal<string>;
  selected: Signal<boolean>;
  disabled: Signal<boolean>;
  toggle(event?: Event): void;
}

export interface NgpToggleProps {
  id: Signal<string>;
  selected: Signal<boolean>;
  disabled: Signal<boolean>;
  selectedChange: OutputEmitterRef<boolean>;
  element?: ElementRef<HTMLElement>;
}

export function ngpTogglePattern({
  id,
  selected: _selected,
  disabled,
  selectedChange,
  element = injectElementRef(),
}: NgpToggleProps): NgpToggleState {
  const selected = controlled(_selected);
  const isButton = element.nativeElement.tagName.toLowerCase() === 'button';

  // Setup form control
  setupFormControl({ id, disabled });

  // Setup interactions
  ngpInteractions({
    hover: true,
    press: true,
    focusVisible: true,
    disabled,
  });

  // Setup host attribute bindings
  attrBinding(element, 'type', () => (isButton ? 'button' : null));
  attrBinding(element, 'aria-pressed', () => (selected() ? 'true' : 'false'));
  dataBinding(element, 'data-selected', selected);
  dataBinding(element, 'data-disabled', disabled);

  // Setup event listeners
  listener(element, 'click', toggle);
  listener(element, 'keydown', (event: KeyboardEvent) => {
    if (event.key === ' ' && !isButton && element.nativeElement.tagName !== 'A') {
      event.preventDefault();
      toggle();
    }
  });

  function toggle(): void {
    if (disabled()) {
      return;
    }

    const newSelected = !selected();
    selected.set(newSelected);
    selectedChange.emit(newSelected);
  }

  return {
    id,
    selected: selected.asReadonly(),
    disabled,
    toggle,
  };
}

export const NgpTogglePatternToken = new InjectionToken<NgpToggleState>('NgpTogglePatternToken');

export function injectTogglePattern(): NgpToggleState {
  return inject(NgpTogglePatternToken);
}

export function provideTogglePattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpToggleState,
): FactoryProvider {
  return { provide: NgpTogglePatternToken, useFactory: () => fn(inject(type)) };
}
