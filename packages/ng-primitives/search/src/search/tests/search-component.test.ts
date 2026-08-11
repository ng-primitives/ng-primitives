import { fireEvent, render } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { SearchFixture } from './search-forms.fixture';

describe('Search (reusable component) — standalone', () => {
  it('renders a searchbox', async () => {
    const { getByRole } = await render(`<app-search></app-search>`, {
      imports: [SearchFixture],
    });
    expect(getByRole('searchbox')).toBeInTheDocument();
  });

  it('projects the placeholder input onto the field', async () => {
    const { getByRole } = await render(`<app-search placeholder="Search customers"></app-search>`, {
      imports: [SearchFixture],
    });
    expect(getByRole('searchbox')).toHaveAttribute('placeholder', 'Search customers');
  });

  it('exposes an accessible clear button', async () => {
    const { getByRole } = await render(`<app-search></app-search>`, {
      imports: [SearchFixture],
    });
    const clear = getByRole('button', { name: 'Clear search' });
    expect(clear).toBeInTheDocument();
    expect(clear).toHaveAttribute('tabindex', '-1');
  });

  it('tracks typed input on the field', async () => {
    const { getByRole } = await render(`<app-search></app-search>`, {
      imports: [SearchFixture],
    });
    const input = getByRole('searchbox') as HTMLInputElement;

    input.value = 'hello';
    fireEvent.input(input);

    expect(input.value).toBe('hello');
  });

  it('clears the field when the clear button is pressed', async () => {
    const { getByRole } = await render(`<app-search></app-search>`, {
      imports: [SearchFixture],
    });
    const input = getByRole('searchbox') as HTMLInputElement;

    input.value = 'hello';
    fireEvent.input(input);
    expect(input.value).toBe('hello');

    fireEvent.click(getByRole('button', { name: 'Clear search' }));
    expect(input.value).toBe('');
  });
});
