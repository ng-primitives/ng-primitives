import { Component } from '@angular/core';
import { fireEvent, render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { NgpTextarea } from 'ng-primitives/textarea';
import { describe, expect, it } from 'vitest';

/**
 * Inline fixture mirroring the reusable Textarea component in
 * apps/components/src/app/pages/reusable-components/textarea/textarea.ts.
 */
@Component({
  selector: 'textarea[app-textarea]',
  hostDirectives: [{ directive: NgpTextarea, inputs: ['disabled'] }],
  template: `
    <ng-content />
  `,
})
class TextareaFixture {}

describe('Textarea (reusable component) — standalone', () => {
  it('generates an id on the underlying textarea', async () => {
    const { getByRole } = await render(`<textarea app-textarea></textarea>`, {
      imports: [TextareaFixture],
    });

    expect(getByRole('textbox').id).toMatch(/^ngp-textarea-\d+$/);
  });

  it('adds data-hover on mouse enter and removes it on mouse leave', async () => {
    const { getByRole } = await render(`<textarea app-textarea></textarea>`, {
      imports: [TextareaFixture],
    });

    const textarea = getByRole('textbox');
    expect(textarea).not.toHaveAttribute('data-hover');
    fireEvent.mouseEnter(textarea);
    expect(textarea).toHaveAttribute('data-hover');
    fireEvent.mouseLeave(textarea);
    expect(textarea).not.toHaveAttribute('data-hover');
  });

  it('adds data-press on pointer down and removes it on pointer up', async () => {
    const { getByRole } = await render(`<textarea app-textarea></textarea>`, {
      imports: [TextareaFixture],
    });

    const textarea = getByRole('textbox');
    expect(textarea).not.toHaveAttribute('data-press');
    fireEvent.pointerDown(textarea);
    expect(textarea).toHaveAttribute('data-press');
    fireEvent.pointerUp(textarea);
    expect(textarea).not.toHaveAttribute('data-press');
  });

  it('sets the disabled and data-disabled attributes when disabled', async () => {
    const { getByRole } = await render(`<textarea app-textarea disabled></textarea>`, {
      imports: [TextareaFixture],
    });

    const textarea = getByRole('textbox');
    expect(textarea).toBeDisabled();
    expect(textarea).toHaveAttribute('data-disabled', '');
  });

  it('does not add data-hover when disabled', async () => {
    const { getByRole } = await render(`<textarea app-textarea disabled></textarea>`, {
      imports: [TextareaFixture],
    });

    const textarea = getByRole('textbox');
    fireEvent.mouseEnter(textarea);
    expect(textarea).not.toHaveAttribute('data-hover');
  });

  it('allows typing text', async () => {
    const user = userEvent.setup();
    const { getByRole } = await render(`<textarea app-textarea></textarea>`, {
      imports: [TextareaFixture],
    });

    const textarea = getByRole('textbox');
    await user.click(textarea);
    await user.type(textarea, 'Hello World');
    expect(textarea).toHaveValue('Hello World');
  });
});
