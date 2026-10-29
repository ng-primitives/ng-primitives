import { Component, signal } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { NgpSelect, NgpSelectDropdown, NgpSelectOption, NgpSelectPortal } from '../../index';

@Component({
  template: `
    <div [(ngpSelectValue)]="value" ngpSelect data-testid="select">
      {{ value() ?? 'Pick one' }}

      <div *ngpSelectPortal ngpSelectDropdown data-testid="dropdown">
        @for (option of options; track option) {
          <div
            [ngpSelectOptionValue]="option"
            [attr.data-testid]="'option-' + option"
            ngpSelectOption
          >
            {{ option }}
          </div>
        }
      </div>
    </div>
    <input data-testid="outside-input" />
    <div style="height: 40px" data-testid="empty"></div>
  `,
  imports: [NgpSelect, NgpSelectDropdown, NgpSelectOption, NgpSelectPortal],
})
class SelectFocusComponent {
  readonly value = signal<string | undefined>(undefined);
  readonly options = ['Apple', 'Banana'];
}

async function open() {
  await render(SelectFocusComponent);
  const select = screen.getByTestId('select');
  await userEvent.click(select);
  await waitFor(() => expect(screen.getByTestId('dropdown')).toBeInTheDocument());
  return select;
}

async function closed() {
  await waitFor(() => expect(screen.queryByTestId('dropdown')).not.toBeInTheDocument());
}

describe('NgpSelect focus on close', () => {
  it('returns focus to the select after a mouse pick', async () => {
    const select = await open();

    await userEvent.click(screen.getByTestId('option-Banana'));
    await closed();

    expect(select).toHaveFocus();
  });

  it('returns focus to the select on Escape', async () => {
    const select = await open();

    await userEvent.keyboard('{Escape}');
    await closed();

    expect(select).toHaveFocus();
  });

  it('returns focus to the select on an outside click on empty space', async () => {
    const select = await open();

    await userEvent.click(screen.getByTestId('empty'));
    await closed();

    expect(select).toHaveFocus();
  });

  it('leaves focus on a control the outside click landed on', async () => {
    await open();
    const input = screen.getByTestId('outside-input');

    await userEvent.click(input);
    await closed();

    expect(input).toHaveFocus();
  });
});
