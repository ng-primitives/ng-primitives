import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Component, input, model } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { provideIcons } from '@ng-icons/core';
import { heroChevronDownSolid } from '@ng-icons/heroicons/solid';
import { NgpSelectionMode } from 'ng-primitives/common';
import { injectListboxState, NgpListbox, provideListboxState } from 'ng-primitives/listbox';
import { ChangeFn, provideValueAccessor, TouchedFn } from 'ng-primitives/utils';

@Component({
  selector: 'app-listbox',
  providers: [
    provideIcons({ heroChevronDownSolid }),
    provideListboxState(),
    provideValueAccessor(Listbox),
  ],
  imports: [NgpListbox],
  template: `
    <div
      [(ngpListboxValue)]="value"
      [ngpListboxMode]="mode()"
      [ngpListboxDisabled]="disabled()"
      [ngpListboxCompareWith]="compareWith()"
      (ngpListboxValueChange)="onListboxValueChange($event)"
      ngpPopover
      ngpListbox
    >
      <ng-content />
    </div>
  `,
  styles: `
    [ngpListbox] {
      background-color: var(--ngp-background);
      border: 1px solid var(--ngp-border);
      padding: 0.25rem;
      border-radius: 0.75rem;
      outline: none;
      width: var(--ngp-popover-trigger-width);
      box-sizing: border-box;
    }
  `,
})
export class Listbox implements ControlValueAccessor {
  /**
   * Access the listbox state
   */
  protected readonly state = injectListboxState<NgpListbox<string>>();

  /**
   * The listbox mode.
   */
  readonly mode = input<NgpSelectionMode>('single');

  /**
   * The listbox value.
   */
  readonly value = model<string[]>([]);

  /**
   * The listbox disabled state.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    transform: booleanAttribute,
  });

  /**
   * The comparator function to use when comparing values.
   */
  readonly compareWith = input<(a: string, b: string) => boolean>((a, b) => a === b);

  /**
   * The placeholder text.
   */
  readonly placeholder = input<string>('Select an option');

  /**
   * The onChange callback.
   */
  protected onChange?: ChangeFn<string[]>;

  /**
   * The onTouch callback.
   */
  protected onTouch?: TouchedFn;

  writeValue(value: string[]): void {
    this.state()?.value.set(value);
  }

  registerOnChange(fn: ChangeFn<string[]>): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: TouchedFn): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.state()?.disabled.set(isDisabled);
  }

  onListboxValueChange(value: string[]): void {
    this.value.set(value);
    if (this.onChange) this.onChange(value);
  }
}
