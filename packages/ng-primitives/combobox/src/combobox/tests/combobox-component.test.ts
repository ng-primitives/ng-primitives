import { render, screen, waitFor } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { ComboboxFixture } from './combobox-forms.fixture';

const options = ['Apple', 'Banana', 'Cherry', 'Dragon Fruit', 'Elderberry'];

afterEach(() => {
  // the dropdown may linger due to waiting for animations - remove it so it
  // does not interfere with subsequent tests
  const dropdown = screen.queryByRole('listbox');
  if (dropdown) {
    dropdown.remove();
  }
});

describe('Combobox (reusable component) — standalone', () => {
  it('renders the input with role combobox', async () => {
    await render(`<app-combobox [options]="options" />`, {
      imports: [ComboboxFixture],
      componentProperties: { options },
    });

    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('opens the dropdown when the toggle button is clicked', async () => {
    await render(`<app-combobox [options]="options" />`, {
      imports: [ComboboxFixture],
      componentProperties: { options },
    });

    await userEvent.click(screen.getByTestId('combobox-button'));

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Elderberry')).toBeInTheDocument();
  });

  it('selects an option on click and closes the dropdown', async () => {
    await render(`<app-combobox [options]="options" />`, {
      imports: [ComboboxFixture],
      componentProperties: { options },
    });

    await userEvent.click(screen.getByTestId('combobox-button'));
    await userEvent.click(screen.getByText('Cherry'));

    const input = screen.getByRole('combobox') as HTMLInputElement;
    expect(input.value).toBe('Cherry');

    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  it('filters the visible options as the user types', async () => {
    await render(`<app-combobox [options]="options" />`, {
      imports: [ComboboxFixture],
      componentProperties: { options },
    });

    await userEvent.type(screen.getByRole('combobox'), 'an');

    // Banana and Mango-like matches - only options containing "an"
    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    expect(screen.queryByText('Cherry')).not.toBeInTheDocument();
  });

  it('shows the empty message when no options match the filter', async () => {
    await render(`<app-combobox [options]="options" />`, {
      imports: [ComboboxFixture],
      componentProperties: { options },
    });

    await userEvent.type(screen.getByRole('combobox'), 'zzz');

    expect(screen.getByTestId('empty-message')).toBeInTheDocument();
  });

  it('supports keyboard selection with arrow keys and Enter', async () => {
    await render(`<app-combobox [options]="options" />`, {
      imports: [ComboboxFixture],
      componentProperties: { options },
    });

    const input = screen.getByRole('combobox') as HTMLInputElement;
    input.focus();

    await userEvent.keyboard('{arrowdown}{arrowdown}{enter}');

    expect(input.value).toBe('Banana');
  });

  it('does not open the dropdown when disabled', async () => {
    await render(`<app-combobox [options]="options" [disabled]="true" />`, {
      imports: [ComboboxFixture],
      componentProperties: { options },
    });

    expect(screen.getByRole('combobox')).toBeDisabled();

    await userEvent.click(screen.getByTestId('combobox-button'));

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('renders the placeholder on the input', async () => {
    await render(`<app-combobox [options]="options" placeholder="Pick a fruit" />`, {
      imports: [ComboboxFixture],
      componentProperties: { options },
    });

    expect(screen.getByRole('combobox')).toHaveAttribute('placeholder', 'Pick a fruit');
  });
});
