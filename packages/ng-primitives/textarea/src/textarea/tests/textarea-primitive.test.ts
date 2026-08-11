import { Component, input } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { fireEvent, render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { NgpDescription, NgpFormField, NgpLabel } from 'ng-primitives/form-field';
import { NgpTextarea } from 'ng-primitives/textarea';
import { describe, expect, it } from 'vitest';

@Component({
  imports: [NgpTextarea],
  template: `
    <textarea [disabled]="disabled()" ngpTextarea></textarea>
  `,
})
class TextareaDisabledHost {
  readonly disabled = input(false);
}

describe('NgpTextarea', () => {
  describe('id', () => {
    it('should set a generated id when none is provided', async () => {
      const { getByRole } = await render(`<textarea ngpTextarea></textarea>`, {
        imports: [NgpTextarea],
      });

      expect(getByRole('textbox').id).toMatch(/^ngp-textarea-\d+$/);
    });

    it('should apply the provided id', async () => {
      const { getByRole } = await render(`<textarea ngpTextarea [id]="id"></textarea>`, {
        imports: [NgpTextarea],
        componentProperties: { id: 'custom-id' },
      });

      expect(getByRole('textbox')).toHaveAttribute('id', 'custom-id');
    });
  });

  describe('disabled', () => {
    it('should not be disabled by default', async () => {
      const { getByRole } = await render(`<textarea ngpTextarea></textarea>`, {
        imports: [NgpTextarea],
      });

      const textarea = getByRole('textbox');
      expect(textarea).not.toHaveAttribute('disabled');
      expect(textarea).not.toHaveAttribute('data-disabled');
    });

    it('should reflect the disabled state when it changes', async () => {
      const container = await render(TextareaDisabledHost, {
        componentInputs: { disabled: false },
      });

      const textarea = container.getByRole('textbox');
      expect(textarea).not.toHaveAttribute('disabled');
      expect(textarea).not.toHaveAttribute('data-disabled');

      container.fixture.componentRef.setInput('disabled', true);
      // host bindings apply via afterRenderEffect; wait for it to flush
      await container.fixture.whenStable();

      expect(textarea).toHaveAttribute('disabled');
      expect(textarea).toHaveAttribute('data-disabled', '');
    });

    it('should add the disabled attribute when the form control is disabled via ReactiveForms', async () => {
      const { getByRole, detectChanges } = await render(
        `<textarea ngpTextarea [formControl]="control"></textarea>`,
        {
          imports: [NgpTextarea, ReactiveFormsModule],
          componentProperties: {
            control: new FormControl({ value: '', disabled: true }),
          },
        },
      );

      detectChanges();

      const textarea = getByRole('textbox');
      expect(textarea).toHaveAttribute('disabled');
      expect(textarea).toBeDisabled();
    });

    it('should not allow text entry when disabled', async () => {
      const user = userEvent.setup();
      const { getByRole } = await render(`<textarea ngpTextarea disabled="true"></textarea>`, {
        imports: [NgpTextarea],
      });

      const textarea = getByRole('textbox');
      fireEvent.focus(textarea);
      await user.type(textarea, 'Hello World');
      expect(textarea).toHaveValue('');
    });
  });

  describe('interactions', () => {
    it('should set data-hover on mouseenter and remove on mouseleave', async () => {
      const { getByRole } = await render(`<textarea ngpTextarea></textarea>`, {
        imports: [NgpTextarea],
      });

      const textarea = getByRole('textbox');
      expect(textarea).not.toHaveAttribute('data-hover');

      fireEvent.mouseEnter(textarea);
      expect(textarea).toHaveAttribute('data-hover', '');

      fireEvent.mouseLeave(textarea);
      expect(textarea).not.toHaveAttribute('data-hover');
    });

    it('should set data-press on pointerdown and remove on pointerup', async () => {
      const { getByRole } = await render(`<textarea ngpTextarea></textarea>`, {
        imports: [NgpTextarea],
      });

      const textarea = getByRole('textbox');
      expect(textarea).not.toHaveAttribute('data-press');

      fireEvent.pointerDown(textarea);
      expect(textarea).toHaveAttribute('data-press', '');

      fireEvent.pointerUp(textarea);
      expect(textarea).not.toHaveAttribute('data-press');
    });

    it('should set data-focus on focus and remove on blur', async () => {
      const { getByRole } = await render(`<textarea ngpTextarea></textarea>`, {
        imports: [NgpTextarea],
      });

      const textarea = getByRole('textbox');
      expect(textarea).not.toHaveAttribute('data-focus');

      fireEvent.focus(textarea);
      expect(textarea).toHaveAttribute('data-focus', '');

      fireEvent.blur(textarea);
      expect(textarea).not.toHaveAttribute('data-focus');
    });

    it('should not set data-hover when disabled', async () => {
      const { getByRole } = await render(`<textarea ngpTextarea [disabled]="true"></textarea>`, {
        imports: [NgpTextarea],
      });

      const textarea = getByRole('textbox');
      fireEvent.mouseEnter(textarea);
      expect(textarea).not.toHaveAttribute('data-hover');
    });

    it('should not set data-press when disabled', async () => {
      const { getByRole } = await render(`<textarea ngpTextarea [disabled]="true"></textarea>`, {
        imports: [NgpTextarea],
      });

      const textarea = getByRole('textbox');
      fireEvent.pointerDown(textarea);
      expect(textarea).not.toHaveAttribute('data-press');
    });
  });

  describe('typing', () => {
    it('should allow typing text into the textarea', async () => {
      const user = userEvent.setup();
      const { getByRole } = await render(`<textarea ngpTextarea></textarea>`, {
        imports: [NgpTextarea],
      });

      const textarea = getByRole('textbox');
      await user.click(textarea);
      await user.type(textarea, 'Hello World');
      expect(textarea).toHaveValue('Hello World');
    });
  });

  describe('form control status', () => {
    it('should add data attributes for form control status when ngModel is used', async () => {
      const { getByRole } = await render(`<textarea ngpTextarea [(ngModel)]="value"></textarea>`, {
        imports: [NgpTextarea, FormsModule],
        componentProperties: { value: '' },
      });

      const textarea = getByRole('textbox');
      expect(textarea).toHaveAttribute('data-valid');
      expect(textarea).not.toHaveAttribute('data-invalid');
      expect(textarea).toHaveAttribute('data-pristine');
      expect(textarea).not.toHaveAttribute('data-dirty');

      fireEvent.focus(textarea);
      fireEvent.input(textarea, { target: { value: 'text' } });
      fireEvent.blur(textarea);

      expect(textarea).not.toHaveAttribute('data-pristine');
      expect(textarea).toHaveAttribute('data-dirty');
    });
  });

  describe('form field integration', () => {
    it('should connect the label and description with the textarea', async () => {
      const { getByRole } = await render(
        `<div ngpFormField>
          <label ngpLabel id="label-id">Custom Label</label>
          <textarea ngpTextarea id="custom-id"></textarea>
          <div ngpDescription id="description-id">Helpful description</div>
        </div>`,
        {
          imports: [NgpTextarea, NgpFormField, NgpLabel, NgpDescription],
        },
      );

      const textarea = getByRole('textbox', { name: 'Custom Label' });
      expect(textarea).toHaveAttribute('id', 'custom-id');
      expect(textarea).toHaveAttribute('aria-labelledby', 'label-id');
      expect(textarea).toHaveAttribute('aria-describedby', 'description-id');
    });
  });
});
