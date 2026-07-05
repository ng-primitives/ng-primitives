import { Component, input } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { fireEvent, render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { NgpDescription, NgpFormField, NgpLabel } from 'ng-primitives/form-field';
import { NgpInput } from 'ng-primitives/input';
import { describe, expect, it } from 'vitest';

@Component({
  imports: [NgpInput],
  template: `
    <input [disabled]="disabled()" ngpInput />
  `,
})
class InputDisabledHost {
  readonly disabled = input(false);
}

describe('NgpInput', () => {
  describe('id', () => {
    it('should set a generated id when none is provided', async () => {
      const { getByRole } = await render(`<input ngpInput />`, {
        imports: [NgpInput],
      });

      const input = getByRole('textbox');
      expect(input).toHaveAttribute('id');
      expect(input.id).toMatch(/^ngp-input-\d+$/);
    });

    it('should allow the user to set a custom id', async () => {
      const { getByRole } = await render(`<input ngpInput id="custom-input-id" />`, {
        imports: [NgpInput],
      });

      expect(getByRole('textbox')).toHaveAttribute('id', 'custom-input-id');
    });
  });

  describe('disabled', () => {
    it('should not be disabled by default', async () => {
      const { getByRole } = await render(`<input ngpInput />`, {
        imports: [NgpInput],
      });

      const input = getByRole('textbox');
      expect(input).not.toHaveAttribute('disabled');
      expect(input).not.toHaveAttribute('data-disabled');
    });

    it('should set the disabled attribute when disabled is true', async () => {
      const { getByRole } = await render(`<input ngpInput disabled />`, {
        imports: [NgpInput],
      });

      const input = getByRole('textbox');
      expect(input).toHaveAttribute('disabled');
      expect(input).toBeDisabled();
    });

    it('should set the data-disabled attribute when disabled', async () => {
      const { getByRole } = await render(`<input ngpInput disabled />`, {
        imports: [NgpInput],
      });

      expect(getByRole('textbox')).toHaveAttribute('data-disabled', '');
    });

    it('should reflect the disabled state when it changes', async () => {
      const { getByRole, fixture } = await render(InputDisabledHost, {
        componentInputs: { disabled: false },
      });

      const input = getByRole('textbox');
      expect(input).not.toHaveAttribute('disabled');
      expect(input).not.toHaveAttribute('data-disabled');

      fixture.componentRef.setInput('disabled', true);
      // host bindings apply via afterRenderEffect; wait for it to flush
      await fixture.whenStable();

      expect(input).toHaveAttribute('disabled');
      expect(input).toHaveAttribute('data-disabled', '');
    });

    it('should add the disabled attribute when the form control is disabled via ReactiveForms', async () => {
      const { getByRole, detectChanges } = await render(
        `<input ngpInput [formControl]="control" />`,
        {
          imports: [NgpInput, ReactiveFormsModule],
          componentProperties: {
            control: new FormControl({ value: '', disabled: true }),
          },
        },
      );

      detectChanges();

      const input = getByRole('textbox');
      expect(input).toHaveAttribute('disabled');
      expect(input).toBeDisabled();
    });

    it('should not allow text entry when disabled', async () => {
      const user = userEvent.setup();
      const { getByRole } = await render(`<input ngpInput disabled="true" />`, {
        imports: [NgpInput],
      });

      const input = getByRole('textbox');
      fireEvent.focus(input);
      await user.type(input, 'Hello World');
      expect(input).toHaveValue('');
    });
  });

  describe('interactions', () => {
    it('should add the data-hover attribute on hover', async () => {
      const { getByRole } = await render(`<input ngpInput />`, {
        imports: [NgpInput],
      });

      const input = getByRole('textbox');
      fireEvent.mouseEnter(input);
      expect(input).toHaveAttribute('data-hover');
      fireEvent.mouseLeave(input);
      expect(input).not.toHaveAttribute('data-hover');
    });

    it('should add the data-press attribute on press', async () => {
      const { getByRole } = await render(`<input ngpInput />`, {
        imports: [NgpInput],
      });

      const input = getByRole('textbox');
      fireEvent.pointerDown(input);
      expect(input).toHaveAttribute('data-press');
      fireEvent.pointerUp(input);
      expect(input).not.toHaveAttribute('data-press');
    });

    it('should add the data-focus attribute on focus', async () => {
      const { getByRole } = await render(`<input ngpInput />`, {
        imports: [NgpInput],
      });

      const input = getByRole('textbox');
      fireEvent.focus(input);
      expect(input).toHaveAttribute('data-focus');
      fireEvent.blur(input);
      expect(input).not.toHaveAttribute('data-focus');
    });

    it('should not add the data-hover attribute when disabled', async () => {
      const { getByRole } = await render(`<input ngpInput disabled />`, {
        imports: [NgpInput],
      });

      const input = getByRole('textbox');
      fireEvent.mouseEnter(input);
      expect(input).not.toHaveAttribute('data-hover');
    });

    it('should not add the data-press attribute when disabled', async () => {
      const { getByRole } = await render(`<input ngpInput disabled />`, {
        imports: [NgpInput],
      });

      const input = getByRole('textbox');
      fireEvent.pointerDown(input);
      expect(input).not.toHaveAttribute('data-press');
    });
  });

  describe('typing', () => {
    it('should allow typing text into the input', async () => {
      const user = userEvent.setup();
      const { getByRole } = await render(`<input ngpInput />`, {
        imports: [NgpInput],
      });

      const input = getByRole('textbox');
      await user.click(input);
      await user.type(input, 'Hello World');

      expect(input).toHaveValue('Hello World');
    });

    it('should support typing with the spacebar key', async () => {
      const user = userEvent.setup();
      const { getByRole } = await render(`<input ngpInput />`, {
        imports: [NgpInput],
      });

      const input = getByRole('textbox');
      await user.click(input);
      await user.type(input, 'Hello');
      await user.keyboard(' ');
      await user.type(input, 'Angular');
      await user.keyboard('  ');
      await user.type(input, 'Primitives');

      expect(input).toHaveValue('Hello Angular  Primitives');
    });
  });

  describe('form control status', () => {
    it('should add data attributes for form control status when ngModel is used', async () => {
      const { getByRole } = await render(`<input ngpInput [(ngModel)]="value" />`, {
        imports: [NgpInput, FormsModule],
        componentProperties: { value: '' },
      });

      const input = getByRole('textbox');
      expect(input).toHaveAttribute('data-valid');
      expect(input).not.toHaveAttribute('data-invalid');
      expect(input).toHaveAttribute('data-pristine');
      expect(input).not.toHaveAttribute('data-dirty');
      expect(input).not.toHaveAttribute('data-touched');

      fireEvent.focus(input);
      fireEvent.input(input, { target: { value: '' } });
      fireEvent.blur(input);

      expect(input).not.toHaveAttribute('data-pristine');
      expect(input).toHaveAttribute('data-dirty');
    });
  });

  describe('form field integration', () => {
    it('should connect the label with the input', async () => {
      const { getByText, getByRole } = await render(
        `<div ngpFormField>
          <label ngpLabel id="label-id">Custom Label</label>
          <input ngpInput id="custom-id" />
        </div>`,
        {
          imports: [NgpInput, NgpFormField, NgpLabel],
        },
      );

      const input = getByRole('textbox', { name: 'Custom Label' });
      const label = getByText('Custom Label');
      expect(label).toHaveAttribute('for', 'custom-id');
      expect(input).toHaveAttribute('id', 'custom-id');
      expect(input).toHaveAttribute('aria-labelledby', 'label-id');
    });

    it('should describe the input with a description', async () => {
      const { getByRole } = await render(
        `<div ngpFormField>
          <label ngpLabel>Label</label>
          <input ngpInput id="described-id" />
          <div ngpDescription id="description-id">Helpful description</div>
        </div>`,
        {
          imports: [NgpInput, NgpFormField, NgpLabel, NgpDescription],
        },
      );

      expect(getByRole('textbox')).toHaveAttribute('aria-describedby', 'description-id');
    });
  });
});
