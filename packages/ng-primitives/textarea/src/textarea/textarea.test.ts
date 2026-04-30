import { Component, Input } from '@angular/core';
import { fireEvent, render } from '@testing-library/angular';
import { NgpTextarea } from './textarea';

@Component({
  imports: [NgpTextarea],
  template: `
    <textarea [disabled]="disabled" ngpTextarea></textarea>
  `,
})
class TextareaDisabledHost {
  @Input() disabled = false;
}

describe('NgpTextarea', () => {
  it('should set a generated id when none is provided', async () => {
    const { getByRole } = await render(`<textarea ngpTextarea></textarea>`, {
      imports: [NgpTextarea],
    });

    expect(getByRole('textbox').id).toMatch(/^ngp-textarea/);
  });

  it('should apply the provided id', async () => {
    const { getByRole } = await render(`<textarea ngpTextarea [id]="id"></textarea>`, {
      imports: [NgpTextarea],
      componentProperties: { id: 'custom-id' },
    });

    expect(getByRole('textbox')).toHaveAttribute('id', 'custom-id');
  });

  it('should reflect disabled state', async () => {
    const container = await render(TextareaDisabledHost, {
      componentInputs: { disabled: false },
    });

    expect(container.getByRole('textbox')).not.toHaveAttribute('disabled');
    expect(container.getByRole('textbox')).not.toHaveAttribute('data-disabled');

    container.fixture.componentRef.setInput('disabled', true);
    container.fixture.detectChanges();

    expect(container.getByRole('textbox')).toHaveAttribute('disabled');
    expect(container.getByRole('textbox')).toHaveAttribute('data-disabled', '');
  });

  it('should set data-hover on mouseenter and remove on mouseleave', async () => {
    const { getByRole, fixture } = await render(`<textarea ngpTextarea></textarea>`, {
      imports: [NgpTextarea],
    });

    const textarea = getByRole('textbox');

    expect(textarea).not.toHaveAttribute('data-hover');

    fireEvent.mouseEnter(textarea);
    fixture.detectChanges();
    expect(textarea).toHaveAttribute('data-hover', '');

    fireEvent.mouseLeave(textarea);
    fixture.detectChanges();
    expect(textarea).not.toHaveAttribute('data-hover');
  });

  it('should set data-focus on focus and remove on blur', async () => {
    const { getByRole, fixture } = await render(`<textarea ngpTextarea></textarea>`, {
      imports: [NgpTextarea],
    });

    const textarea = getByRole('textbox');

    expect(textarea).not.toHaveAttribute('data-focus');

    fireEvent.focus(textarea);
    fixture.detectChanges();
    expect(textarea).toHaveAttribute('data-focus', '');

    fireEvent.blur(textarea);
    fixture.detectChanges();
    expect(textarea).not.toHaveAttribute('data-focus');
  });

  it('should not set data-hover when disabled', async () => {
    const { getByRole, fixture } = await render(
      `<textarea ngpTextarea [disabled]="true"></textarea>`,
      {
        imports: [NgpTextarea],
      },
    );

    const textarea = getByRole('textbox');

    fireEvent.mouseEnter(textarea);
    fixture.detectChanges();
    expect(textarea).not.toHaveAttribute('data-hover');
  });
});
