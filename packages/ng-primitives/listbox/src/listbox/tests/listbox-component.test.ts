import { fireEvent, render } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { Listbox, ListboxOption } from './listbox-forms.fixture';

describe('Listbox (reusable component) — standalone', () => {
  it('renders with role="listbox" and options with role="option"', async () => {
    const { getByRole, getAllByRole } = await render(
      `
      <app-listbox aria-label="Fruit">
        <app-listbox-option value="apple">Apple</app-listbox-option>
        <app-listbox-option value="banana">Banana</app-listbox-option>
      </app-listbox>
      `,
      { imports: [Listbox, ListboxOption] },
    );

    expect(getByRole('listbox')).toBeTruthy();
    expect(getAllByRole('option')).toHaveLength(2);
  });

  it('forwards aria-label onto the listbox element', async () => {
    const { getByRole } = await render(
      `
      <app-listbox aria-label="Fruit">
        <app-listbox-option value="apple">Apple</app-listbox-option>
      </app-listbox>
      `,
      { imports: [Listbox, ListboxOption] },
    );

    expect(getByRole('listbox')).toHaveAttribute('aria-label', 'Fruit');
  });

  it('renders with initial unselected state', async () => {
    const { getByRole } = await render(
      `
      <app-listbox aria-label="Fruit">
        <app-listbox-option value="apple">Apple</app-listbox-option>
        <app-listbox-option value="banana">Banana</app-listbox-option>
      </app-listbox>
      `,
      { imports: [Listbox, ListboxOption] },
    );

    expect(getByRole('option', { name: 'Apple' })).not.toHaveAttribute('data-selected');
    expect(getByRole('option', { name: 'Banana' })).not.toHaveAttribute('data-selected');
  });

  it('selects an option on click', async () => {
    const { getByRole } = await render(
      `
      <app-listbox aria-label="Fruit">
        <app-listbox-option value="apple">Apple</app-listbox-option>
        <app-listbox-option value="banana">Banana</app-listbox-option>
      </app-listbox>
      `,
      { imports: [Listbox, ListboxOption] },
    );

    const apple = getByRole('option', { name: 'Apple' });
    fireEvent.click(apple);

    expect(apple).toHaveAttribute('data-selected', '');
    expect(getByRole('option', { name: 'Banana' })).not.toHaveAttribute('data-selected');
  });

  it('moves selection when a different option is clicked (single mode)', async () => {
    const { getByRole } = await render(
      `
      <app-listbox aria-label="Fruit">
        <app-listbox-option value="apple">Apple</app-listbox-option>
        <app-listbox-option value="banana">Banana</app-listbox-option>
      </app-listbox>
      `,
      { imports: [Listbox, ListboxOption] },
    );

    const apple = getByRole('option', { name: 'Apple' });
    const banana = getByRole('option', { name: 'Banana' });

    fireEvent.click(apple);
    expect(apple).toHaveAttribute('data-selected', '');

    fireEvent.click(banana);
    expect(banana).toHaveAttribute('data-selected', '');
    expect(apple).not.toHaveAttribute('data-selected');
  });

  it('accumulates selection in multiple mode', async () => {
    const { getByRole } = await render(
      `
      <app-listbox aria-label="Fruit" mode="multiple">
        <app-listbox-option value="apple">Apple</app-listbox-option>
        <app-listbox-option value="banana">Banana</app-listbox-option>
      </app-listbox>
      `,
      { imports: [Listbox, ListboxOption] },
    );

    const apple = getByRole('option', { name: 'Apple' });
    const banana = getByRole('option', { name: 'Banana' });

    fireEvent.click(apple);
    fireEvent.click(banana);

    expect(apple).toHaveAttribute('data-selected', '');
    expect(banana).toHaveAttribute('data-selected', '');
    expect(getByRole('listbox')).toHaveAttribute('aria-multiselectable', 'true');
  });

  it('does not select a disabled option on click', async () => {
    const { getByRole } = await render(
      `
      <app-listbox aria-label="Fruit">
        <app-listbox-option value="apple">Apple</app-listbox-option>
        <app-listbox-option value="banana" disabled="true">Banana</app-listbox-option>
      </app-listbox>
      `,
      { imports: [Listbox, ListboxOption] },
    );

    const banana = getByRole('option', { name: 'Banana' });
    expect(banana).toHaveAttribute('data-disabled', '');

    fireEvent.click(banana);
    expect(banana).not.toHaveAttribute('data-selected');
  });
});
