import { Component, signal } from '@angular/core';
import { fireEvent, render, waitFor } from '@testing-library/angular';
import { NgpListboxOption } from '../listbox-option/listbox-option';
import { NgpListbox } from './listbox';

@Component({
  template: `
    <div ngpListbox data-testid="listbox">
      @for (item of items(); track item) {
        <div [ngpListboxOptionValue]="item" [attr.data-testid]="'option-' + item" ngpListboxOption>
          {{ item }}
        </div>
      }
    </div>
  `,
  imports: [NgpListbox, NgpListboxOption],
})
class TestListboxDynamicOptionsComponent {
  readonly items = signal(['One', 'Two', 'Three']);

  addItem(value: string): void {
    this.items.update(items => [...items, value]);
  }
}

describe('NgpListbox', () => {
  it('should initialise correctly', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const container = await render(`<div ngpListbox></div>`, {
      imports: [NgpListbox],
    });
  });

  it('should preserve the active option when items are appended', async () => {
    const { getByTestId, fixture } = await render(TestListboxDynamicOptionsComponent);

    const listbox = getByTestId('listbox');
    const optionOne = getByTestId('option-One');
    const optionThree = getByTestId('option-Three');

    fireEvent.focusIn(listbox);
    await waitFor(() => expect(optionOne).toHaveAttribute('data-active'));

    fireEvent.keyDown(listbox, { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40, which: 40 });
    fireEvent.keyDown(listbox, { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40, which: 40 });

    await waitFor(() => expect(optionThree).toHaveAttribute('data-active'));
    expect(optionOne).not.toHaveAttribute('data-active');

    const activeId = optionThree.getAttribute('id');
    expect(listbox.getAttribute('aria-activedescendant')).toBe(activeId);

    fixture.componentInstance.addItem('Four');
    fixture.detectChanges();

    await waitFor(() => expect(optionThree).toHaveAttribute('data-active'));
    expect(listbox.getAttribute('aria-activedescendant')).toBe(activeId);
  });
});
