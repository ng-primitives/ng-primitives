import { By } from '@angular/platform-browser';
import { fireEvent, render } from '@testing-library/angular';
import { NgpInput } from 'ng-primitives/input';
import { NgpSearch, NgpSearchClear } from 'ng-primitives/search';
import { describe, expect, it } from 'vitest';

/**
 * Convenience helper that types a value into the search input and dispatches a
 * bubbling `input` event so the enclosing `NgpSearch` picks up the change.
 */
function type(input: HTMLInputElement, value: string): void {
  input.value = value;
  fireEvent.input(input);
}

describe('NgpSearch', () => {
  describe('roles & attributes', () => {
    it('should expose the searchbox role via type="search"', async () => {
      const { getByRole } = await render(
        `
        <div ngpSearch>
          <input ngpInput type="search" />
        </div>
        `,
        { imports: [NgpSearch, NgpInput] },
      );

      expect(getByRole('searchbox')).toBeInTheDocument();
    });

    it('should have the data-empty attribute when initially empty', async () => {
      const { getByTestId } = await render(
        `
        <div data-testid="search" ngpSearch>
          <input ngpInput type="search" />
        </div>
        `,
        { imports: [NgpSearch, NgpInput] },
      );

      expect(getByTestId('search')).toHaveAttribute('data-empty', '');
    });

    it('should have the data-empty attribute when rendered with an empty value', async () => {
      const { getByTestId } = await render(
        `
        <div data-testid="search" ngpSearch>
          <input ngpInput type="search" value="" />
        </div>
        `,
        { imports: [NgpSearch, NgpInput] },
      );

      expect(getByTestId('search')).toHaveAttribute('data-empty', '');
    });

    it('should not have the data-empty attribute when rendered with a non-empty value', async () => {
      const { getByTestId } = await render(
        `
        <div data-testid="search" ngpSearch>
          <input ngpInput type="search" value="hello" />
        </div>
        `,
        { imports: [NgpSearch, NgpInput] },
      );

      expect(getByTestId('search')).not.toHaveAttribute('data-empty');
    });
  });

  describe('value / input tracking', () => {
    it('should remove data-empty from the search when the input becomes non-empty', async () => {
      const { getByTestId, getByRole } = await render(
        `
        <div data-testid="search" ngpSearch>
          <input ngpInput type="search" />
        </div>
        `,
        { imports: [NgpSearch, NgpInput] },
      );

      const search = getByTestId('search');
      expect(search).toHaveAttribute('data-empty', '');

      type(getByRole('searchbox') as HTMLInputElement, 'hello');
      expect(search).not.toHaveAttribute('data-empty');
    });

    it('should restore data-empty when the input is emptied again', async () => {
      const { getByTestId, getByRole } = await render(
        `
        <div data-testid="search" ngpSearch>
          <input ngpInput type="search" />
        </div>
        `,
        { imports: [NgpSearch, NgpInput] },
      );

      const search = getByTestId('search');
      const input = getByRole('searchbox') as HTMLInputElement;

      type(input, 'hello');
      expect(search).not.toHaveAttribute('data-empty');

      type(input, '');
      expect(search).toHaveAttribute('data-empty', '');
    });
  });

  describe('clear button (NgpSearchClear)', () => {
    it('should be removed from the tab order', async () => {
      const { getByTestId } = await render(
        `
        <div ngpSearch>
          <input ngpInput type="search" />
          <button data-testid="clear" ngpSearchClear>Clear</button>
        </div>
        `,
        { imports: [NgpSearch, NgpInput, NgpSearchClear] },
      );

      expect(getByTestId('clear')).toHaveAttribute('tabindex', '-1');
    });

    it('should mirror the data-empty state of the search', async () => {
      const { getByTestId, getByRole } = await render(
        `
        <div ngpSearch>
          <input ngpInput type="search" />
          <button data-testid="clear" ngpSearchClear>Clear</button>
        </div>
        `,
        { imports: [NgpSearch, NgpInput, NgpSearchClear] },
      );

      const clear = getByTestId('clear');
      expect(clear).toHaveAttribute('data-empty', '');

      type(getByRole('searchbox') as HTMLInputElement, 'hello');
      expect(clear).not.toHaveAttribute('data-empty');
    });

    it('should clear the input when clicked', async () => {
      const { getByTestId, getByRole } = await render(
        `
        <div data-testid="search" ngpSearch>
          <input ngpInput type="search" />
          <button data-testid="clear" ngpSearchClear>Clear</button>
        </div>
        `,
        { imports: [NgpSearch, NgpInput, NgpSearchClear] },
      );

      const input = getByRole('searchbox') as HTMLInputElement;
      const search = getByTestId('search');

      type(input, 'hello');
      expect(input.value).toBe('hello');
      expect(search).not.toHaveAttribute('data-empty');

      fireEvent.click(getByTestId('clear'));

      expect(input.value).toBe('');
      expect(search).toHaveAttribute('data-empty', '');
    });
  });

  describe('escape key', () => {
    it('should clear a non-empty input on Escape', async () => {
      const { getByTestId, getByRole } = await render(
        `
        <div data-testid="search" ngpSearch>
          <input ngpInput type="search" />
        </div>
        `,
        { imports: [NgpSearch, NgpInput] },
      );

      const input = getByRole('searchbox') as HTMLInputElement;
      const search = getByTestId('search');

      type(input, 'hello');
      expect(search).not.toHaveAttribute('data-empty');

      // the Escape handler lives on the ngpSearch host, so the event must bubble
      fireEvent.keyDown(input, { key: 'Escape' });

      expect(input.value).toBe('');
      expect(search).toHaveAttribute('data-empty', '');
    });
  });

  describe('directive API', () => {
    it('should expose an empty() signal reflecting the current value', async () => {
      const { fixture, getByRole } = await render(
        `
        <div ngpSearch>
          <input ngpInput type="search" />
        </div>
        `,
        { imports: [NgpSearch, NgpInput] },
      );

      const directive = fixture.debugElement.query(By.directive(NgpSearch)).injector.get(NgpSearch);

      expect(directive.empty()).toBe(true);

      type(getByRole('searchbox') as HTMLInputElement, 'hello');
      expect(directive.empty()).toBe(false);
    });

    it('should clear the input via the clear() method', async () => {
      const { fixture, getByRole, getByTestId } = await render(
        `
        <div data-testid="search" ngpSearch>
          <input ngpInput type="search" />
        </div>
        `,
        { imports: [NgpSearch, NgpInput] },
      );

      const input = getByRole('searchbox') as HTMLInputElement;
      type(input, 'hello');

      const directive = fixture.debugElement.query(By.directive(NgpSearch)).injector.get(NgpSearch);

      directive.clear();
      // a direct method call does not trigger change detection; the host
      // `[attr.data-empty]` binding is applied during CD.
      fixture.detectChanges();

      expect(input.value).toBe('');
      expect(getByTestId('search')).toHaveAttribute('data-empty', '');
    });
  });
});
