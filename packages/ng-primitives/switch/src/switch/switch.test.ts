import { Component } from '@angular/core';
import { ControlValueAccessor, FormControl, ReactiveFormsModule } from '@angular/forms';
import { fireEvent, render } from '@testing-library/angular';
import {
  injectSwitchState,
  NgpSwitch,
  NgpSwitchThumb,
  provideSwitchState,
} from 'ng-primitives/switch';
import { ChangeFn, provideValueAccessor, TouchedFn } from 'ng-primitives/utils';
import { describe, expect, it, vi } from 'vitest';

describe('NgpSwitch', () => {
  it('should render with generated id and default unchecked state', async () => {
    const { getByRole } = await render(`<button ngpSwitch></button>`, { imports: [NgpSwitch] });
    const button = getByRole('switch');

    expect(button.id).toMatch(/^ngp-switch/);
    expect(button).toHaveAttribute('aria-checked', 'false');
    expect(button).not.toHaveAttribute('data-checked');
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('tabindex', '0');
  });

  it('should reflect a provided id and initial checked state', async () => {
    const { getByRole } = await render(
      `<button ngpSwitch id="custom-id" ngpSwitchChecked="true"></button>`,
      { imports: [NgpSwitch] },
    );
    const button = getByRole('switch');

    expect(button.id).toBe('custom-id');
    expect(button).toHaveAttribute('aria-checked', 'true');
    expect(button).toHaveAttribute('data-checked', '');
  });

  it('should toggle on click when enabled and emit changes', async () => {
    const checkedChange = vi.fn();
    const { getByRole } = await render(
      `<button ngpSwitch (ngpSwitchCheckedChange)="checkedChange($event)"></button>`,
      {
        imports: [NgpSwitch],
        componentProperties: { checkedChange },
      },
    );

    const button = getByRole('switch');
    fireEvent.click(button);

    expect(checkedChange).toHaveBeenCalledWith(true);
    expect(button).toHaveAttribute('aria-checked', 'true');
    expect(button).toHaveAttribute('data-checked', '');
  });

  it('should not toggle or emit when disabled', async () => {
    const checkedChange = vi.fn();
    const container = await render(
      `<button ngpSwitch [ngpSwitchDisabled]="disabled" (ngpSwitchCheckedChange)="checkedChange($event)"></button>`,
      {
        imports: [NgpSwitch],
        componentProperties: { disabled: true, checkedChange },
      },
    );

    const button = container.getByRole('switch');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveAttribute('data-disabled', '');
    expect(button).toHaveAttribute('tabindex', '-1');

    fireEvent.click(button);
    expect(checkedChange).not.toHaveBeenCalled();

    await container.rerender({ componentProperties: { disabled: false, checkedChange } });
    fireEvent.click(container.getByRole('switch'));
    expect(checkedChange).toHaveBeenCalledWith(true);
  });

  it('should toggle on space key when element is not a button', async () => {
    const checkedChange = vi.fn();
    const { getByRole } = await render(
      `<div ngpSwitch tabindex="0" (ngpSwitchCheckedChange)="checkedChange($event)"></div>`,
      {
        imports: [NgpSwitch],
        componentProperties: { checkedChange },
      },
    );

    const switchDiv = getByRole('switch');
    fireEvent.keyDown(switchDiv, { key: ' ' });

    expect(checkedChange).toHaveBeenCalledWith(true);
    expect(switchDiv).toHaveAttribute('aria-checked', 'true');
  });

  it('should expose disabled state via aria and data attributes', async () => {
    const { getByRole } = await render(`<button ngpSwitch ngpSwitchDisabled></button>`, {
      imports: [NgpSwitch],
    });

    const button = getByRole('switch');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveAttribute('data-disabled', '');
    expect(button).toHaveAttribute('disabled', '');
    expect(button).toHaveAttribute('tabindex', '-1');
  });

  describe('when used within a form', () => {
    @Component({
      selector: 'app-switch',
      hostDirectives: [
        {
          directive: NgpSwitch,
          inputs: ['ngpSwitchChecked:checked', 'ngpSwitchDisabled:disabled'],
          outputs: ['ngpSwitchCheckedChange:checkedChange'],
        },
      ],
      imports: [NgpSwitchThumb],
      template: `
        <span ngpSwitchThumb></span>
      `,
      providers: [provideValueAccessor(Switch), provideSwitchState({ inherit: true })],
      host: {
        '(focusout)': 'onTouched?.()',
      },
    })
    class Switch implements ControlValueAccessor {
      private readonly switchState = injectSwitchState();
      private onChange?: ChangeFn<boolean>;
      protected onTouched?: TouchedFn;

      constructor() {
        this.switchState().checkedChange.subscribe(value => this.onChange?.(value));
      }

      writeValue(value: boolean): void {
        this.switchState().setChecked(value);
      }

      registerOnChange(fn: ChangeFn<boolean>): void {
        this.onChange = fn;
      }

      registerOnTouched(fn: TouchedFn): void {
        this.onTouched = fn;
      }

      setDisabledState(isDisabled: boolean): void {
        this.switchState().setDisabled(isDisabled);
      }
    }

    it('should work as a form control', async () => {
      const formControl = new FormControl(true);

      const { getByRole, fixture } = await render(`<app-switch [formControl]="formControl" />`, {
        imports: [Switch, ReactiveFormsModule],
        componentProperties: {
          formControl,
        },
      });

      const switchElement = getByRole('switch');

      expect(switchElement).toHaveAttribute('aria-checked', 'true');
      expect(switchElement).toHaveAttribute('data-checked', '');
      expect(formControl.value).toBe(true);

      fireEvent.click(switchElement);
      expect(formControl.value).toBe(false);
      expect(switchElement).toHaveAttribute('aria-checked', 'false');
      expect(switchElement).not.toHaveAttribute('data-checked');

      formControl.setValue(true);
      fixture.detectChanges();
      expect(switchElement).toHaveAttribute('aria-checked', 'true');
      expect(switchElement).toHaveAttribute('data-checked', '');

      formControl.disable();
      fixture.detectChanges();
      expect(switchElement).toHaveAttribute('aria-disabled', 'true');
      expect(switchElement).toHaveAttribute('data-disabled', '');
    });
  });
});
