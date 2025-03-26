import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Component, input, model } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChevronDownSolid } from '@ng-icons/heroicons/solid';
import { NgpButton } from 'ng-primitives/button';
import { NgpSelectionMode } from 'ng-primitives/common';
import {
  injectListboxState,
  NgpListbox,
  NgpListboxTrigger,
  provideListboxState,
} from 'ng-primitives/listbox';
import { NgpPopover, NgpPopoverTrigger } from 'ng-primitives/popover';
import { ChangeFn, provideValueAccessor, TouchedFn } from 'ng-primitives/utils';

@Component({
  selector: 'app-listbox',
  providers: [
    provideIcons({ heroChevronDownSolid }),
    provideListboxState(),
    provideValueAccessor(Listbox),
  ],
  imports: [NgpPopoverTrigger, NgpListbox, NgpListboxTrigger, NgIcon, NgpButton, NgpPopover],
  template: `
    <button [ngpPopoverTrigger]="dropdown" ngpButton ngpListboxTrigger>
      {{ value().length ? value().join(', ') : placeholder() }}
      <ng-icon name="heroChevronDownSolid" />
    </button>

    <ng-template #dropdown>
      <div
        [(ngpListboxValue)]="value"
        [ngpListboxMode]="mode()"
        [ngpListboxDisabled]="disabled()"
        [ngpListboxCompareWith]="compareWith()"
        ngpPopover
        ngpListbox
      >
        <ng-content />
      </div>
    </ng-template>
  `,
  styles: `
    [ngpButton] {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 36px;
      width: 300px;
      border-radius: 8px;
      padding: 0 16px;
      border: none;
      background-color: var(--ngp-background);
      text-align: left;
      box-shadow: var(--ngp-input-shadow);
      outline: none;
      font-family: inherit;
      font-size: 14px;
    }

    [ngpButton][data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    [ngpListbox] {
      background-color: var(--ngp-background);
      border: 1px solid var(--ngp-border);
      padding: 0.25rem;
      border-radius: 0.75rem;
      outline: none;
      position: absolute;
      animation: popover-show 0.1s ease-out;
      width: var(--ngp-popover-trigger-width);
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
}
