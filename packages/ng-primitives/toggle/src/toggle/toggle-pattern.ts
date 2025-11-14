import {
  ElementRef,
  FactoryProvider,
  inject,
  InjectionToken,
  linkedSignal,
  OutputEmitterRef,
  signal,
  Signal,
  Type,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { ngpFormControlPattern } from 'ng-primitives/form-field';
import { ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import {
  attrBinding,
  controlled,
  createStateInjectFn,
  dataBinding,
  listener,
} from 'ng-primitives/state';

export interface NgpToggleState {
  id: Signal<string>;
  selected: Signal<boolean>;
  disabled: Signal<boolean>;
  toggle(event?: Event): void;
  setSelected(value: boolean): void;
  setDisabled(isDisabled: boolean): void;
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
  disabled: _disabled = signal(false),
  selectedChange,
  element = injectElementRef(),
}: NgpToggleProps): NgpToggleState {
  const selected = controlled(_selected);
  const disabled = controlled(_disabled);

  const isButton = element.nativeElement.tagName.toLowerCase() === 'button';

  // Setup form control
  ngpFormControlPattern({ id, disabled });

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
    setSelected(!selected());
  }

  function setSelected(value: boolean): void {
    if (disabled()) {
      return;
    }

    selected.set(value);
    selectedChange.emit(value);
  }

  function setDisabled(isDisabled: boolean): void {
    disabled.set(isDisabled);
  }

  return {
    id,
    selected: selected.asReadonly(),
    disabled,
    toggle,
    setSelected,
    setDisabled,
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

/**
 * @deprecated Use `injectTogglePattern` instead.
 */
export const injectToggleState = createStateInjectFn(injectTogglePattern, pattern => {
  const selected = linkedSignal(pattern.selected);
  selected.set = pattern.setSelected;
  const disabled = linkedSignal(pattern.disabled);
  disabled.set = pattern.setDisabled;
  return { ...pattern, selected, disabled, selectedChange: toObservable(pattern.selected) };
});
