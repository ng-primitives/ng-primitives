import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Component, input, model, signal } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChevronDown } from '@ng-icons/heroicons/outline';
import {
  NgpSelect,
  NgpSelectDropdown,
  NgpSelectOption,
  NgpSelectPortal,
} from 'ng-primitives/select';
import { ChangeFn, provideValueAccessor, TouchedFn } from 'ng-primitives/utils';

@Component({
  selector: 'app-select',
  imports: [NgpSelect, NgpSelectDropdown, NgpSelectOption, NgpSelectPortal, NgIcon],
  providers: [provideIcons({ heroChevronDown }), provideValueAccessor(Select)],
  template: `
    <div
      [(ngpSelectValue)]="value"
      [ngpSelectDisabled]="disabled() || formDisabled()"
      (ngpSelectValueChange)="onValueChange($event)"
      ngpSelect
    >
      @if (value(); as value) {
        <span class="select-value">{{ value }}</span>
      } @else {
        <span class="select-placeholder">{{ placeholder() }}</span>
      }

      <ng-icon name="heroChevronDown" />

      <div *ngpSelectPortal ngpSelectDropdown>
        @for (option of options(); track option) {
          <div [ngpSelectOptionValue]="option" ngpSelectOption>
            {{ option }}
          </div>
        } @empty {
          <div class="empty-message">No options found</div>
        }
      </div>
    </div>
  `,
  styles: `
    [ngpSelect] {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 36px;
      width: 300px;
      border-radius: 8px;
      border: none;
      background-color: var(--ngp-background);
      box-shadow: var(--ngp-input-shadow);
      box-sizing: border-box;
    }

    [ngpSelect][data-focus] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    .select-value,
    .select-placeholder {
      display: flex;
      align-items: center;
      flex: 1;
      padding: 0 16px;
      background-color: transparent;
      color: var(--ngp-text-primary);
      font-family: inherit;
      font-size: 14px;
      padding: 0 16px;
      height: 100%;
    }

    .select-placeholder {
      color: var(--ngp-text-secondary);
    }

    ng-icon {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      margin-inline: 8px;
      font-size: 14px;
    }

    [ngpSelectDropdown] {
      background-color: var(--ngp-background);
      border: 1px solid var(--ngp-border);
      padding: 0.25rem;
      border-radius: 0.75rem;
      outline: none;
      position: absolute;
      animation: popover-show 0.1s ease-out;
      width: var(--ngp-select-width);
      box-shadow: var(--ngp-shadow-lg);
      box-sizing: border-box;
      margin-top: 4px;
      max-height: 240px;
      overflow-y: auto;
      transform-origin: var(--ngp-select-transform-origin);
    }

    [ngpSelectDropdown][data-enter] {
      animation: select-show 0.1s ease-out;
    }

    [ngpSelectDropdown][data-exit] {
      animation: select-hide 0.1s ease-out;
    }

    [ngpSelectOption] {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.375rem 0.75rem;
      cursor: pointer;
      border-radius: 0.5rem;
      width: 100%;
      height: 36px;
      font-size: 14px;
      color: var(--ngp-text-primary);
      box-sizing: border-box;
    }

    [ngpSelectOption][data-hover] {
      background-color: var(--ngp-background-hover);
    }

    [ngpSelectOption][data-press] {
      background-color: var(--ngp-background-active);
    }

    [ngpSelectOption][data-active] {
      background-color: var(--ngp-background-active);
    }

    .empty-message {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0.5rem;
      color: var(--ngp-text-secondary);
      font-size: 14px;
      font-weight: 500;
      text-align: center;
    }

    @keyframes select-show {
      0% {
        opacity: 0;
        transform: translateY(-10px) scale(0.9);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes select-hide {
      0% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
      100% {
        opacity: 0;
        transform: translateY(-10px) scale(0.9);
      }
    }
  `,
})
export class Select implements ControlValueAccessor {
  /** The options for the select. */
  readonly options = input<string[]>([]);

  /** The selected value. */
  readonly value = model<string | undefined>();

  /** The placeholder for the input. */
  readonly placeholder = input<string>('');

  /** The disabled state of the select. */
  readonly disabled = input<boolean, BooleanInput>(false, {
    transform: booleanAttribute,
  });

  /** Store the form disabled state */
  protected readonly formDisabled = signal(false);

  /** The on change callback */
  private onChange?: ChangeFn<string>;

  /** The on touch callback */
  protected onTouched?: TouchedFn;

  writeValue(value: string | undefined): void {
    this.value.set(value);
  }

  registerOnChange(fn: ChangeFn<string | undefined>): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: TouchedFn): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  protected onValueChange(value: string): void {
    this.onChange?.(value);
  }
}
