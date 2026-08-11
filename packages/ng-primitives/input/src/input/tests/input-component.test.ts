import { Component } from '@angular/core';
import { fireEvent, render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { NgpInput } from 'ng-primitives/input';
import { describe, expect, it } from 'vitest';

/**
 * Inline fixture mirroring the reusable Input component in
 * apps/components/src/app/pages/reusable-components/input/input.ts.
 */
@Component({
  selector: 'input[app-input]',
  hostDirectives: [{ directive: NgpInput, inputs: ['disabled'] }],
  template: '',
})
class InputFixture {}

describe('Input (reusable component) — standalone', () => {
  it('generates an id on the underlying input', async () => {
    const { getByRole } = await render(`<input app-input />`, {
      imports: [InputFixture],
    });

    expect(getByRole('textbox').id).toMatch(/^ngp-input-\d+$/);
  });

  it('adds data-hover on mouse enter and removes it on mouse leave', async () => {
    const { getByRole } = await render(`<input app-input />`, {
      imports: [InputFixture],
    });

    const input = getByRole('textbox');
    expect(input).not.toHaveAttribute('data-hover');
    fireEvent.mouseEnter(input);
    expect(input).toHaveAttribute('data-hover');
    fireEvent.mouseLeave(input);
    expect(input).not.toHaveAttribute('data-hover');
  });

  it('adds data-press on pointer down and removes it on pointer up', async () => {
    const { getByRole } = await render(`<input app-input />`, {
      imports: [InputFixture],
    });

    const input = getByRole('textbox');
    expect(input).not.toHaveAttribute('data-press');
    fireEvent.pointerDown(input);
    expect(input).toHaveAttribute('data-press');
    fireEvent.pointerUp(input);
    expect(input).not.toHaveAttribute('data-press');
  });

  it('sets the disabled and data-disabled attributes when disabled', async () => {
    const { getByRole } = await render(`<input app-input disabled />`, {
      imports: [InputFixture],
    });

    const input = getByRole('textbox');
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute('data-disabled', '');
  });

  it('does not add data-hover when disabled', async () => {
    const { getByRole } = await render(`<input app-input disabled />`, {
      imports: [InputFixture],
    });

    const input = getByRole('textbox');
    fireEvent.mouseEnter(input);
    expect(input).not.toHaveAttribute('data-hover');
  });

  it('allows typing text', async () => {
    const user = userEvent.setup();
    const { getByRole } = await render(`<input app-input />`, {
      imports: [InputFixture],
    });

    const input = getByRole('textbox');
    await user.click(input);
    await user.type(input, 'Hello World');
    expect(input).toHaveValue('Hello World');
  });
});
