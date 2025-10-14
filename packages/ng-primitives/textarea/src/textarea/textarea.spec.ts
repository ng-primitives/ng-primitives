import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { fireEvent, render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { NgpFormField, NgpLabel } from 'ng-primitives/form-field';
import { NgpTextarea } from './textarea';

describe('NgpTextarea', () => {
  it('should initialise correctly', async () => {
    const { getByTestId } = await render(
      `<textarea ngpTextarea data-testid="textarea"></textarea>`,
      {
        imports: [NgpTextarea],
      },
    );

    const textarea = getByTestId('textarea');
    expect(textarea).toBeInTheDocument();
  });

  it('should set the id attribute', async () => {
    const { getByTestId } = await render(
      `<textarea ngpTextarea data-testid="textarea"></textarea>`,
      {
        imports: [NgpTextarea],
      },
    );

    const textarea = getByTestId('textarea');
    expect(textarea).toHaveAttribute('id');
    expect(textarea.id).toMatch(/^ngp-textarea-\d+$/);
  });

  it('should allow the user to set a custom id', async () => {
    const customId = 'custom-textarea-id';
    const { getByTestId } = await render(
      `<textarea ngpTextarea id="${customId}" data-testid="textarea"></textarea>`,
      {
        imports: [NgpTextarea],
      },
    );

    const textarea = getByTestId('textarea');
    expect(textarea).toHaveAttribute('id', customId);
  });

  it('should add the disabled attribute when disabled is true', async () => {
    const { getByTestId } = await render(
      `<textarea ngpTextarea data-testid="textarea" disabled></textarea>`,
      {
        imports: [NgpTextarea],
      },
    );

    const textarea = getByTestId('textarea');
    expect(textarea).toHaveAttribute('disabled');
    expect(textarea).toBeDisabled();
  });

  it('should not add the disabled attribute when disabled is false', async () => {
    const { getByTestId } = await render(
      `<textarea ngpTextarea data-testid="textarea"></textarea>`,
      {
        imports: [NgpTextarea],
      },
    );

    const textarea = getByTestId('textarea');
    expect(textarea).not.toHaveAttribute('disabled');
    expect(textarea).not.toBeDisabled();
  });

  it('should set the data-disabled attribute when disabled', async () => {
    const { getByTestId } = await render(
      `<textarea ngpTextarea data-testid="textarea" disabled></textarea>`,
      {
        imports: [NgpTextarea],
      },
    );

    const textarea = getByTestId('textarea');
    expect(textarea).toHaveAttribute('data-disabled', '');
  });

  it('should not set the data-disabled attribute when not disabled', async () => {
    const { getByTestId } = await render(
      `<textarea ngpTextarea data-testid="textarea"></textarea>`,
      {
        imports: [NgpTextarea],
      },
    );

    const textarea = getByTestId('textarea');
    expect(textarea).not.toHaveAttribute('data-disabled');
  });

  it('should update the disabled attribute when disabled changes', async () => {
    const { getByTestId, rerender } = await render(
      `<textarea ngpTextarea data-testid="textarea" [disabled]="isDisabled"></textarea>`,
      {
        imports: [NgpTextarea],
        componentProperties: { isDisabled: false },
      },
    );

    const textarea = getByTestId('textarea');
    expect(textarea).not.toHaveAttribute('disabled');
    expect(textarea).not.toHaveAttribute('data-disabled');

    await rerender({ componentProperties: { isDisabled: true } });
    expect(textarea).toHaveAttribute('disabled');
    expect(textarea).toHaveAttribute('data-disabled');
  });

  it('should add the data-hover attribute on hover', async () => {
    const { getByTestId } = await render(
      `<textarea ngpTextarea data-testid="textarea"></textarea>`,
      {
        imports: [NgpTextarea],
      },
    );

    const textarea = getByTestId('textarea');
    fireEvent.mouseEnter(textarea);
    expect(textarea).toHaveAttribute('data-hover');
    fireEvent.mouseLeave(textarea);
    expect(textarea).not.toHaveAttribute('data-hover');
  });

  it('should add the data-press attribute on press', async () => {
    const { getByTestId } = await render(
      `<textarea ngpTextarea data-testid="textarea"></textarea>`,
      {
        imports: [NgpTextarea],
      },
    );

    const textarea = getByTestId('textarea');
    fireEvent.pointerDown(textarea);
    expect(textarea).toHaveAttribute('data-press');
    fireEvent.pointerUp(textarea);
    expect(textarea).not.toHaveAttribute('data-press');
  });

  it('should add the data-focus attribute when focused', async () => {
    const { getByTestId } = await render(
      `<textarea ngpTextarea data-testid="textarea"></textarea>`,
      {
        imports: [NgpTextarea],
      },
    );

    const textarea = getByTestId('textarea');
    fireEvent.focus(textarea);
    expect(textarea).toHaveAttribute('data-focus');
    fireEvent.blur(textarea);
    expect(textarea).not.toHaveAttribute('data-focus');
  });

  it('should not add interaction attributes when disabled', async () => {
    const { getByTestId } = await render(
      `<textarea ngpTextarea data-testid="textarea" disabled></textarea>`,
      {
        imports: [NgpTextarea],
      },
    );

    const textarea = getByTestId('textarea');

    fireEvent.mouseEnter(textarea);
    expect(textarea).not.toHaveAttribute('data-hover');

    fireEvent.pointerDown(textarea);
    expect(textarea).not.toHaveAttribute('data-press');

    fireEvent.focus(textarea);
    expect(textarea).not.toHaveAttribute('data-focus');
  });

  it('should not allow text entering when disabled', async () => {
    const { getByTestId } = await render(
      `<textarea ngpTextarea data-testid="textarea" disabled></textarea>`,
      {
        imports: [NgpTextarea],
      },
    );

    const textarea = getByTestId('textarea');
    fireEvent.focus(textarea);
    userEvent.type(textarea, 'Hello World');
    expect(textarea).toHaveValue('');
  });

  it('should add data attributes for form control status when ngModel is used', async () => {
    const { getByTestId } = await render(
      `<textarea ngpTextarea data-testid="textarea" [(ngModel)]="value"></textarea>`,
      {
        imports: [NgpTextarea, FormsModule],
        componentProperties: { value: '' },
      },
    );

    const textarea = getByTestId('textarea');
    expect(textarea).toHaveAttribute('data-valid');
    expect(textarea).not.toHaveAttribute('data-invalid');
    expect(textarea).toHaveAttribute('data-pristine');
    expect(textarea).not.toHaveAttribute('data-dirty');
    expect(textarea).not.toHaveAttribute('data-touched');

    fireEvent.focus(textarea);
    fireEvent.input(textarea, { target: { value: 'test' } });
    fireEvent.blur(textarea);

    expect(textarea).not.toHaveAttribute('data-pristine');
    expect(textarea).toHaveAttribute('data-dirty');
  });

  it('should add the disabled attribute when the form control is disabled via ReactiveForms', async () => {
    const { getByTestId, detectChanges } = await render(
      `<textarea ngpTextarea data-testid="textarea" [formControl]="control"></textarea>`,
      {
        imports: [NgpTextarea, ReactiveFormsModule],
        componentProperties: {
          control: new FormControl({ value: '', disabled: true }),
        },
      },
    );

    detectChanges();

    const textarea = getByTestId('textarea');
    expect(textarea).toHaveAttribute('disabled');
    expect(textarea).toBeDisabled();
  });

  it('should connect the label with the textarea', async () => {
    const { getByTestId } = await render(
      `<div ngpFormField>
        <label ngpLabel id="label-id" data-testid="label">Custom Label</label>
        <textarea ngpTextarea data-testid="textarea" id="custom-id"></textarea>
      </div>`,
      {
        imports: [NgpTextarea, NgpFormField, NgpLabel],
      },
    );

    const textarea = getByTestId('textarea');
    const label = getByTestId('label');
    expect(label).toHaveAttribute('for', 'custom-id');
    expect(textarea).toHaveAttribute('id', 'custom-id');
    expect(textarea).toHaveAttribute('aria-labelledby', 'label-id');
  });
});
