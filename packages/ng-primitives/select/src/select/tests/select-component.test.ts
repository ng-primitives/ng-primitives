import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SelectFixture } from './select-forms.fixture';

describe('Select (reusable component) — standalone', () => {
  afterEach(() => {
    // Dropdown is portalled to the body, so fixture.destroy() alone can leave
    // it lingering between tests. Mirror the cleanup pattern used by
    // select-primitive.test.ts.
    const dropdown = screen.queryByRole('listbox');
    if (dropdown) {
      dropdown.remove();
    }
  });

  it('renders the placeholder when no value is selected', async () => {
    await render(`<app-select [options]="options" placeholder="Pick one" />`, {
      imports: [SelectFixture],
      componentProperties: { options: ['Apple', 'Banana'] },
    });

    expect(screen.getByTestId('select-placeholder')).toHaveTextContent('Pick one');
    expect(screen.queryByTestId('select-value')).not.toBeInTheDocument();
  });

  it('opens the dropdown on click and selects an option', async () => {
    const user = userEvent.setup();

    await render(`<app-select [options]="options" />`, {
      imports: [SelectFixture],
      componentProperties: { options: ['Apple', 'Banana', 'Cherry'] },
    });

    await user.click(screen.getByTestId('select'));
    expect(screen.getByTestId('select-dropdown')).toBeInTheDocument();

    await user.click(screen.getByTestId('option-Banana'));

    expect(screen.getByTestId('select-value')).toHaveTextContent('Banana');
  });

  it('closes the dropdown after selecting an option in single mode', async () => {
    const user = userEvent.setup();

    await render(`<app-select [options]="options" />`, {
      imports: [SelectFixture],
      componentProperties: { options: ['Apple', 'Banana'] },
    });

    await user.click(screen.getByTestId('select'));
    await user.click(screen.getByTestId('option-Apple'));

    expect(screen.queryByTestId('select-dropdown')).not.toBeInTheDocument();
  });

  it('does not open the dropdown when disabled', async () => {
    const user = userEvent.setup();

    await render(`<app-select [options]="options" [disabled]="true" />`, {
      imports: [SelectFixture],
      componentProperties: { options: ['Apple', 'Banana'] },
    });

    await user.click(screen.getByTestId('select'));

    expect(screen.queryByTestId('select-dropdown')).not.toBeInTheDocument();
    expect(screen.getByTestId('select')).toHaveAttribute('data-disabled');
  });

  it('emits valueChange when the user selects an option', async () => {
    const user = userEvent.setup();
    const valueChange = vi.fn();

    await render(
      `<app-select [options]="options" (valueChange)="valueChange($event)" />`,
      {
        imports: [SelectFixture],
        componentProperties: { options: ['Apple', 'Banana'], valueChange },
      },
    );

    await user.click(screen.getByTestId('select'));
    await user.click(screen.getByTestId('option-Apple'));

    expect(valueChange).toHaveBeenCalledTimes(1);
    expect(valueChange).toHaveBeenCalledWith('Apple');
  });

  it('allows multiple selection when [multiple] is true', async () => {
    const user = userEvent.setup();
    const valueChange = vi.fn();

    await render(
      `<app-select
         [options]="options"
         [multiple]="true"
         (valueChange)="valueChange($event)"
       />`,
      {
        imports: [SelectFixture],
        componentProperties: { options: ['Apple', 'Banana', 'Cherry'], valueChange },
      },
    );

    await user.click(screen.getByTestId('select'));
    await user.click(screen.getByTestId('option-Apple'));
    // Multi-select does not auto-close the dropdown, so the second option is
    // selected without re-opening.
    await user.click(screen.getByTestId('option-Cherry'));

    expect(valueChange).toHaveBeenCalledTimes(2);
    expect(valueChange).toHaveBeenLastCalledWith(['Apple', 'Cherry']);
    expect(screen.getByTestId('select-value')).toHaveTextContent('Apple, Cherry');
  });

  it('renders an empty message when no options are provided', async () => {
    const user = userEvent.setup();

    await render(`<app-select [options]="[]" />`, {
      imports: [SelectFixture],
    });

    await user.click(screen.getByTestId('select'));

    expect(screen.getByTestId('select-empty')).toBeInTheDocument();
  });

  it('reflects an externally bound [value] input', async () => {
    const { fixture, rerender } = await render(
      `<app-select [options]="options" [value]="value" />`,
      {
        imports: [SelectFixture],
        componentProperties: {
          options: ['Apple', 'Banana'],
          value: 'Apple' as string | undefined,
        },
      },
    );

    expect(screen.getByTestId('select-value')).toHaveTextContent('Apple');

    await rerender({
      componentProperties: { options: ['Apple', 'Banana'], value: 'Banana' },
    });
    await fixture.whenStable();
    expect(screen.getByTestId('select-value')).toHaveTextContent('Banana');
  });

  it('closes the dropdown on outside click and re-opens cleanly', async () => {
    const user = userEvent.setup();

    await render(`<app-select [options]="options" />`, {
      imports: [SelectFixture],
      componentProperties: { options: ['Apple', 'Banana'] },
    });

    await user.click(screen.getByTestId('select'));
    expect(screen.getByTestId('select-dropdown')).toBeInTheDocument();

    await user.click(document.body);
    await waitFor(() =>
      expect(screen.queryByTestId('select-dropdown')).not.toBeInTheDocument(),
    );

    await user.click(screen.getByTestId('select'));
    expect(screen.getByTestId('select-dropdown')).toBeInTheDocument();
  });
});
