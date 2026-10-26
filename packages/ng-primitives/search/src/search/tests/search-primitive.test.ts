import { Component, signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { fireEvent, render } from '@testing-library/angular';
import { NgpButton } from 'ng-primitives/button';
import { NgpInput } from 'ng-primitives/input';
import { NgpSearch, NgpSearchClear } from 'ng-primitives/search';
import { describe, expect, it, vi } from 'vitest';

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

  describe('programmatic values', () => {
    @Component({
      imports: [NgpSearch, NgpInput, NgpSearchClear],
      template: `
        <div data-testid="search" ngpSearch>
          <input [value]="value()" ngpInput type="search" />
          <button data-testid="clear" ngpSearchClear>Clear</button>
        </div>
      `,
    })
    class BoundValue {
      readonly value = signal('hello');
    }

    it('should not have data-empty when the initial value comes from a binding', async () => {
      const { getByTestId, fixture } = await render(BoundValue);
      await fixture.whenStable();

      expect(getByTestId('search')).not.toHaveAttribute('data-empty');
      expect(getByTestId('clear')).not.toHaveAttribute('data-empty');
    });

    it('should track a bound value that changes without an input event', async () => {
      const { getByTestId, fixture } = await render(BoundValue);
      await fixture.whenStable();

      fixture.componentInstance.value.set('');
      await fixture.whenStable();
      expect(getByTestId('search')).toHaveAttribute('data-empty', '');

      fixture.componentInstance.value.set('world');
      await fixture.whenStable();
      expect(getByTestId('search')).not.toHaveAttribute('data-empty');
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

    describe('disabled and read-only inputs', () => {
      @Component({
        imports: [NgpSearch, NgpInput, NgpSearchClear],
        template: `
          <div ngpSearch>
            <input
              [disabled]="disabled()"
              [readOnly]="readOnly()"
              ngpInput
              type="search"
              value="hello"
            />
            <button data-testid="clear" ngpSearchClear>Clear</button>
          </div>
        `,
      })
      class Host {
        readonly disabled = signal(false);
        readonly readOnly = signal(false);
      }

      it('should be enabled while the input is editable', async () => {
        const { getByTestId, fixture } = await render(Host);
        await fixture.whenStable();

        expect(getByTestId('clear')).not.toBeDisabled();
        expect(getByTestId('clear')).not.toHaveAttribute('data-disabled');
      });

      it('should be disabled while the input is disabled', async () => {
        const { getByTestId, fixture } = await render(Host);

        fixture.componentInstance.disabled.set(true);
        await fixture.whenStable();
        expect(getByTestId('clear')).toBeDisabled();
        expect(getByTestId('clear')).toHaveAttribute('data-disabled', '');

        fixture.componentInstance.disabled.set(false);
        await fixture.whenStable();
        expect(getByTestId('clear')).not.toBeDisabled();
        expect(getByTestId('clear')).not.toHaveAttribute('data-disabled');
      });

      it('should be disabled while the input is read-only', async () => {
        const { getByTestId, fixture } = await render(Host);

        fixture.componentInstance.readOnly.set(true);
        await fixture.whenStable();
        expect(getByTestId('clear')).toBeDisabled();
        expect(getByTestId('clear')).toHaveAttribute('data-disabled', '');

        fixture.componentInstance.readOnly.set(false);
        await fixture.whenStable();
        expect(getByTestId('clear')).not.toBeDisabled();
        expect(getByTestId('clear')).not.toHaveAttribute('data-disabled');
      });

      it('should keep a natively disabled button disabled once the input unlocks', async () => {
        @Component({
          imports: [NgpSearch, NgpInput, NgpSearchClear],
          template: `
            <div ngpSearch>
              <input [readOnly]="readOnly()" ngpInput type="search" value="hello" />
              <button [disabled]="buttonDisabled()" data-testid="clear" ngpSearchClear>Clear</button>
            </div>
          `,
        })
        class NativeHost {
          readonly readOnly = signal(false);
          readonly buttonDisabled = signal(true);
        }
        const { getByTestId, fixture } = await render(NativeHost);
        await fixture.whenStable();

        fixture.componentInstance.readOnly.set(true);
        await fixture.whenStable();
        fixture.componentInstance.readOnly.set(false);
        await fixture.whenStable();

        expect(getByTestId('clear')).toBeDisabled();
      });

      describe('with ngpButton', () => {
        @Component({
          imports: [NgpSearch, NgpInput, NgpSearchClear, NgpButton],
          template: `
            <div ngpSearch>
              <input [readOnly]="readOnly()" ngpInput type="search" value="hello" />
              <button [disabled]="buttonDisabled()" data-testid="clear" ngpSearchClear ngpButton>
                Clear
              </button>
            </div>
          `,
        })
        class ButtonHost {
          readonly readOnly = signal(false);
          readonly buttonDisabled = signal<boolean | 'soft'>(false);
        }

        it('should keep a button the consumer disabled disabled while the input is editable', async () => {
          const { getByTestId, getByRole, fixture } = await render(ButtonHost);
          fixture.componentInstance.buttonDisabled.set(true);
          await fixture.whenStable();

          // lock and unlock the input, which must not re-enable the button
          fixture.componentInstance.readOnly.set(true);
          await fixture.whenStable();
          fixture.componentInstance.readOnly.set(false);
          await fixture.whenStable();

          expect(getByTestId('clear')).toBeDisabled();
          expect(getByTestId('clear')).toHaveAttribute('data-disabled', '');
          fireEvent.click(getByTestId('clear'));
          expect(getByRole('searchbox')).toHaveValue('hello');
        });

        it('should not clear the field when the consumer soft-disables the button', async () => {
          const { getByTestId, getByRole, fixture } = await render(ButtonHost);
          fixture.componentInstance.buttonDisabled.set('soft');
          await fixture.whenStable();

          // soft-disabled buttons stay clickable
          fireEvent.click(getByTestId('clear'));

          expect(getByRole('searchbox')).toHaveValue('hello');
        });

        it('should stay disabled while the input is locked, even if the consumer enables it', async () => {
          const { getByTestId, fixture } = await render(ButtonHost);
          fixture.componentInstance.buttonDisabled.set(true);
          fixture.componentInstance.readOnly.set(true);
          await fixture.whenStable();

          fixture.componentInstance.buttonDisabled.set(false);
          await fixture.whenStable();
          expect(getByTestId('clear')).toBeDisabled();

          fixture.componentInstance.readOnly.set(false);
          await fixture.whenStable();
          expect(getByTestId('clear')).not.toBeDisabled();
          expect(getByTestId('clear')).not.toHaveAttribute('data-disabled');
        });
      });

      it('should not clear a read-only input when clicked', async () => {
        const { getByTestId, getByRole, fixture } = await render(Host);
        fixture.componentInstance.readOnly.set(true);
        await fixture.whenStable();

        // the native disabled attribute blocks real clicks, so bypass it
        getByTestId('clear').removeAttribute('disabled');
        fireEvent.click(getByTestId('clear'));

        expect(getByRole('searchbox')).toHaveValue('hello');
      });
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

    it('should not clear a read-only input on Escape', async () => {
      const { getByTestId, getByRole } = await render(
        `
        <div data-testid="search" ngpSearch>
          <input ngpInput type="search" value="hello" readonly />
        </div>
        `,
        { imports: [NgpSearch, NgpInput] },
      );

      fireEvent.keyDown(getByRole('searchbox'), { key: 'Escape' });

      expect(getByRole('searchbox')).toHaveValue('hello');
      expect(getByTestId('search')).not.toHaveAttribute('data-empty');
    });

    it('should not dispatch an input event when the field is already empty', async () => {
      const onInput = vi.fn();
      const { getByRole } = await render(
        `
        <div ngpSearch>
          <input ngpInput type="search" (input)="onInput()" />
        </div>
        `,
        { imports: [NgpSearch, NgpInput], componentProperties: { onInput } },
      );

      fireEvent.keyDown(getByRole('searchbox'), { key: 'Escape' });

      expect(onInput).not.toHaveBeenCalled();
    });

    it('should dispatch exactly one input event when it clears the field', async () => {
      const onInput = vi.fn();
      const { getByRole } = await render(
        `
        <div ngpSearch>
          <input ngpInput type="search" value="hello" (input)="onInput()" />
        </div>
        `,
        { imports: [NgpSearch, NgpInput], componentProperties: { onInput } },
      );

      fireEvent.keyDown(getByRole('searchbox'), { key: 'Escape' });

      expect(onInput).toHaveBeenCalledTimes(1);
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

    it('should not clear a read-only input via the clear() method', async () => {
      const { fixture, getByRole } = await render(
        `
        <div ngpSearch>
          <input ngpInput type="search" value="hello" readonly />
        </div>
        `,
        { imports: [NgpSearch, NgpInput] },
      );

      fixture.debugElement.query(By.directive(NgpSearch)).injector.get(NgpSearch).clear();

      expect(getByRole('searchbox')).toHaveValue('hello');
    });

    it('should not dispatch an input event when clear() is called on an empty field', async () => {
      const onInput = vi.fn();
      const { fixture } = await render(
        `
        <div ngpSearch>
          <input ngpInput type="search" (input)="onInput()" />
        </div>
        `,
        { imports: [NgpSearch, NgpInput], componentProperties: { onInput } },
      );

      fixture.debugElement.query(By.directive(NgpSearch)).injector.get(NgpSearch).clear();

      expect(onInput).not.toHaveBeenCalled();
    });
  });
});
