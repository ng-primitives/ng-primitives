import { render } from '@testing-library/angular';
import { NgpInput } from 'ng-primitives/input';
import { NgpSearchClear } from '../search-clear/search-clear';
import { NgpSearch } from './search';

describe('NgpSearch', () => {
  it('should clear the input field on escape key press', async () => {
    const { getByTestId } = await render(
      `
      <div data-testid="search" ngpSearch>
        <input data-testid="input" ngpInput type="search" placeholder="Search for a customer" />
      </div>
    `,
      {
        imports: [NgpSearch, NgpInput],
      },
    );

    const input = getByTestId('input') as HTMLInputElement;
    const search = getByTestId('search');

    await input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(input.value).toBe('');
    expect(search).toHaveAttribute('data-empty', '');
  });

  it('should clear the input field on clear button click', async () => {
    const { getByTestId } = await render(
      `
      <div data-testid="search" ngpSearch>
        <input data-testid="input" ngpInput type="search" placeholder="Search for a customer" />
        <button data-testid="clear" ngpSearchClear></button>
      </div>
    `,
      {
        imports: [NgpSearch, NgpInput, NgpSearchClear],
      },
    );

    const input = getByTestId('input') as HTMLInputElement;
    const clearButton = getByTestId('clear');

    await input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await clearButton.click();

    expect(input.value).toBe('');
  });

  it('should remove the data-empty attribute when the input is not empty', async () => {
    const { getByTestId, detectChanges } = await render(
      `
      <div data-testid="search" ngpSearch>
        <input data-testid="input" ngpInput type="search" placeholder="Search for a customer" />
        <button data-testid="clear" ngpSearchClear>Clear</button>
      </div>
    `,
      {
        imports: [NgpSearch, NgpSearchClear, NgpInput],
      },
    );

    const input = getByTestId('input') as HTMLInputElement;
    const search = getByTestId('search');
    const clearButton = getByTestId('clear');
    expect(input.value).toBe('');
    expect(search).toHaveAttribute('data-empty', '');
    expect(clearButton).toHaveAttribute('data-empty', '');

    input.value = 'test';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    detectChanges();
    expect(input.value).toBe('test');

    expect(search).not.toHaveAttribute('data-empty');
    expect(clearButton).not.toHaveAttribute('data-empty');
  });
});
