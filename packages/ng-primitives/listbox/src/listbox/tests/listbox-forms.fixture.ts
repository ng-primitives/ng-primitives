import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Component, input, model, signal } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { NgpSelectionMode } from 'ng-primitives/common';
import {
  injectListboxState,
  NgpListbox,
  NgpListboxOption,
  provideListboxState,
} from 'ng-primitives/listbox';
import { ChangeFn, provideValueAccessor, TouchedFn } from 'ng-primitives/utils';

/**
 * Inline fixtures mirroring
 * `apps/components/.../reusable-components/listbox/listbox.ts` and
 * `listbox-option.ts`. Used by the reusable-component test suites.
 */
@Component({
  selector: 'app-listbox',
  providers: [provideListboxState(), provideValueAccessor(Listbox)],
  imports: [NgpListbox],
  template: `
    <div
      [(ngpListboxValue)]="value"
      [ngpListboxMode]="mode()"
      [ngpListboxDisabled]="disabled() || formDisabled()"
      [ngpListboxCompareWith]="compareWith()"
      [attr.aria-label]="ariaLabel()"
      (ngpListboxValueChange)="onListboxValueChange($event)"
      ngpListbox
    >
      <ng-content />
    </div>
  `,
  host: {
    '[attr.aria-label]': 'null',
    '(focusout)': 'onTouch?.()',
  },
})
export class Listbox implements ControlValueAccessor {
  protected readonly state = injectListboxState<NgpListbox<string>>();

  readonly mode = input<NgpSelectionMode>('single');

  readonly value = model<string[]>([]);

  readonly disabled = input<boolean, BooleanInput>(false, {
    transform: booleanAttribute,
  });

  readonly compareWith = input<(a: string, b: string) => boolean>((a, b) => a === b);

  readonly ariaLabel = input<string>('Listbox', {
    alias: 'aria-label',
  });

  protected onChange?: ChangeFn<string[]>;
  protected onTouch?: TouchedFn;
  protected readonly formDisabled = signal(false);

  writeValue(value: string[]): void {
    // drive the value through the bound model so the controlled input reflects it
    this.value.set(value);
  }

  registerOnChange(fn: ChangeFn<string[]>): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: TouchedFn): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  onListboxValueChange(value: string[]): void {
    this.value.set(value);
    if (this.onChange) {
      this.onChange(value);
    }
  }
}

@Component({
  selector: 'app-listbox-option',
  hostDirectives: [
    {
      directive: NgpListboxOption,
      inputs: ['id', 'ngpListboxOptionValue:value', 'ngpListboxOptionDisabled:disabled'],
    },
  ],
  template: `
    <ng-content />
  `,
})
export class ListboxOption {}
