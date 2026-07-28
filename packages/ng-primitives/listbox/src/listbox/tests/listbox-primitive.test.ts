import { Component, signal } from '@angular/core';
import { fireEvent, render, waitFor } from '@testing-library/angular';
import {
  NgpListbox,
  NgpListboxHeader,
  NgpListboxOption,
  NgpListboxSection,
} from 'ng-primitives/listbox';
import { describe, expect, it, vi } from 'vitest';

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

@Component({
  template: `
    <div
      [ngpListboxValue]="[{ id: 2 }]"
      [ngpListboxCompareWith]="compareWith"
      ngpListbox
      data-testid="listbox"
    >
      <div [ngpListboxOptionValue]="{ id: 1 }" ngpListboxOption data-testid="opt-a">A</div>
      <div [ngpListboxOptionValue]="{ id: 2 }" ngpListboxOption data-testid="opt-b">B</div>
    </div>
  `,
  imports: [NgpListbox, NgpListboxOption],
})
class TestListboxCompareWithComponent {
  readonly compareWith = (a: { id: number }, b: { id: number }): boolean => a.id === b.id;
}

const imports = [NgpListbox, NgpListboxOption, NgpListboxSection, NgpListboxHeader];

const arrowDown = { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40, which: 40 };
const arrowUp = { key: 'ArrowUp', code: 'ArrowUp', keyCode: 38, which: 38 };

describe('NgpListbox', () => {
  describe('roles & attributes', () => {
    it('should initialise correctly', async () => {
      const container = await render(`<div ngpListbox data-testid="listbox"></div>`, {
        imports: [NgpListbox],
      });
      expect(container.getByTestId('listbox')).toBeTruthy();
    });

    it('should set role="listbox" on the container', async () => {
      const container = await render(`<div ngpListbox data-testid="listbox"></div>`, {
        imports: [NgpListbox],
      });
      expect(container.getByTestId('listbox')).toHaveAttribute('role', 'listbox');
    });

    it('should set role="option" on each option', async () => {
      const container = await render(
        `<div ngpListbox>
          <div ngpListboxOption ngpListboxOptionValue="a" data-testid="opt-a">A</div>
          <div ngpListboxOption ngpListboxOptionValue="b" data-testid="opt-b">B</div>
        </div>`,
        { imports },
      );
      expect(container.getByTestId('opt-a')).toHaveAttribute('role', 'option');
      expect(container.getByTestId('opt-b')).toHaveAttribute('role', 'option');
    });

    it('should set tabindex="0" when not disabled', async () => {
      const container = await render(`<div ngpListbox data-testid="listbox"></div>`, {
        imports: [NgpListbox],
      });
      expect(container.getByTestId('listbox')).toHaveAttribute('tabindex', '0');
    });

    it('should set tabindex="-1" when disabled', async () => {
      const container = await render(
        `<div ngpListbox ngpListboxDisabled data-testid="listbox"></div>`,
        { imports: [NgpListbox] },
      );
      expect(container.getByTestId('listbox')).toHaveAttribute('tabindex', '-1');
    });

    it('should set aria-disabled when disabled', async () => {
      const container = await render(
        `<div ngpListbox ngpListboxDisabled data-testid="listbox"></div>`,
        { imports: [NgpListbox] },
      );
      expect(container.getByTestId('listbox')).toHaveAttribute('aria-disabled', 'true');
    });

    it('should set aria-multiselectable when mode is multiple', async () => {
      const container = await render(
        `<div ngpListbox ngpListboxMode="multiple" data-testid="listbox"></div>`,
        { imports: [NgpListbox] },
      );
      expect(container.getByTestId('listbox')).toHaveAttribute('aria-multiselectable', 'true');
    });

    it('should set aria-multiselectable to false in single mode', async () => {
      const container = await render(
        `<div ngpListbox ngpListboxMode="single" data-testid="listbox"></div>`,
        { imports: [NgpListbox] },
      );
      expect(container.getByTestId('listbox')).toHaveAttribute('aria-multiselectable', 'false');
    });

    it('should assign a unique id to the listbox', async () => {
      const container = await render(`<div ngpListbox data-testid="listbox"></div>`, {
        imports: [NgpListbox],
      });
      expect(container.getByTestId('listbox').getAttribute('id')).toBeTruthy();
    });
  });

  describe('keyboard navigation', () => {
    it('should set aria-activedescendant to the active option', async () => {
      const container = await render(
        `<div ngpListbox data-testid="listbox">
          <div ngpListboxOption ngpListboxOptionValue="a" data-testid="opt-a">A</div>
          <div ngpListboxOption ngpListboxOptionValue="b" data-testid="opt-b">B</div>
        </div>`,
        { imports },
      );
      const listbox = container.getByTestId('listbox');
      fireEvent.focusIn(listbox);

      await waitFor(() => {
        const optA = container.getByTestId('opt-a');
        expect(optA).toHaveAttribute('data-active');
        expect(listbox.getAttribute('aria-activedescendant')).toBe(optA.getAttribute('id'));
      });
    });

    it('should navigate options with ArrowDown', async () => {
      const container = await render(
        `<div ngpListbox data-testid="listbox">
          <div ngpListboxOption ngpListboxOptionValue="a" data-testid="opt-a">A</div>
          <div ngpListboxOption ngpListboxOptionValue="b" data-testid="opt-b">B</div>
          <div ngpListboxOption ngpListboxOptionValue="c" data-testid="opt-c">C</div>
        </div>`,
        { imports },
      );
      const listbox = container.getByTestId('listbox');
      fireEvent.focusIn(listbox);
      await waitFor(() => expect(container.getByTestId('opt-a')).toHaveAttribute('data-active'));

      fireEvent.keyDown(listbox, arrowDown);
      await waitFor(() => expect(container.getByTestId('opt-b')).toHaveAttribute('data-active'));

      fireEvent.keyDown(listbox, arrowDown);
      await waitFor(() => expect(container.getByTestId('opt-c')).toHaveAttribute('data-active'));
    });

    it('should navigate options with ArrowUp', async () => {
      const container = await render(
        `<div ngpListbox data-testid="listbox">
          <div ngpListboxOption ngpListboxOptionValue="a" data-testid="opt-a">A</div>
          <div ngpListboxOption ngpListboxOptionValue="b" data-testid="opt-b">B</div>
          <div ngpListboxOption ngpListboxOptionValue="c" data-testid="opt-c">C</div>
        </div>`,
        { imports },
      );
      const listbox = container.getByTestId('listbox');
      fireEvent.focusIn(listbox);
      await waitFor(() => expect(container.getByTestId('opt-a')).toHaveAttribute('data-active'));

      fireEvent.keyDown(listbox, arrowDown);
      fireEvent.keyDown(listbox, arrowDown);
      await waitFor(() => expect(container.getByTestId('opt-c')).toHaveAttribute('data-active'));

      fireEvent.keyDown(listbox, arrowUp);
      await waitFor(() => expect(container.getByTestId('opt-b')).toHaveAttribute('data-active'));
    });

    it('should navigate to first option with Home key', async () => {
      const container = await render(
        `<div ngpListbox data-testid="listbox">
          <div ngpListboxOption ngpListboxOptionValue="a" data-testid="opt-a">A</div>
          <div ngpListboxOption ngpListboxOptionValue="b" data-testid="opt-b">B</div>
          <div ngpListboxOption ngpListboxOptionValue="c" data-testid="opt-c">C</div>
        </div>`,
        { imports },
      );
      const listbox = container.getByTestId('listbox');
      fireEvent.focusIn(listbox);
      fireEvent.keyDown(listbox, arrowDown);
      fireEvent.keyDown(listbox, arrowDown);
      await waitFor(() => expect(container.getByTestId('opt-c')).toHaveAttribute('data-active'));

      fireEvent.keyDown(listbox, { key: 'Home', code: 'Home', keyCode: 36, which: 36 });
      await waitFor(() => expect(container.getByTestId('opt-a')).toHaveAttribute('data-active'));
    });

    it('should navigate to last option with End key', async () => {
      const container = await render(
        `<div ngpListbox data-testid="listbox">
          <div ngpListboxOption ngpListboxOptionValue="a" data-testid="opt-a">A</div>
          <div ngpListboxOption ngpListboxOptionValue="b" data-testid="opt-b">B</div>
          <div ngpListboxOption ngpListboxOptionValue="c" data-testid="opt-c">C</div>
        </div>`,
        { imports },
      );
      const listbox = container.getByTestId('listbox');
      fireEvent.focusIn(listbox);
      await waitFor(() => expect(container.getByTestId('opt-a')).toHaveAttribute('data-active'));

      fireEvent.keyDown(listbox, { key: 'End', code: 'End', keyCode: 35, which: 35 });
      await waitFor(() => expect(container.getByTestId('opt-c')).toHaveAttribute('data-active'));
    });

    it('should prevent default on arrow keys to stop the page scrolling', async () => {
      const container = await render(
        `<div ngpListbox data-testid="listbox">
          <div ngpListboxOption ngpListboxOptionValue="a" data-testid="opt-a">A</div>
          <div ngpListboxOption ngpListboxOptionValue="b" data-testid="opt-b">B</div>
        </div>`,
        { imports },
      );
      const listbox = container.getByTestId('listbox');
      fireEvent.focusIn(listbox);
      await waitFor(() => expect(container.getByTestId('opt-a')).toHaveAttribute('data-active'));

      const prevented = !fireEvent.keyDown(listbox, arrowDown);
      expect(prevented).toBe(true);
    });

    it('should move the active option using typeahead', async () => {
      const container = await render(
        `<div ngpListbox data-testid="listbox">
          <div ngpListboxOption ngpListboxOptionValue="a" data-testid="opt-a">Apple</div>
          <div ngpListboxOption ngpListboxOptionValue="b" data-testid="opt-b">Banana</div>
          <div ngpListboxOption ngpListboxOptionValue="c" data-testid="opt-c">Cherry</div>
        </div>`,
        { imports },
      );
      const listbox = container.getByTestId('listbox');
      fireEvent.focusIn(listbox);
      await waitFor(() => expect(container.getByTestId('opt-a')).toHaveAttribute('data-active'));

      // typing the first letter of an option jumps to it (case-insensitive)
      fireEvent.keyDown(listbox, { key: 'C' });
      await waitFor(() => expect(container.getByTestId('opt-c')).toHaveAttribute('data-active'));
      expect(listbox.getAttribute('aria-activedescendant')).toBe(
        container.getByTestId('opt-c').getAttribute('id'),
      );
    });

    it('should cycle through matches when a typeahead character is repeated', async () => {
      const container = await render(
        `<div ngpListbox data-testid="listbox">
          <div ngpListboxOption ngpListboxOptionValue="a" data-testid="opt-a">Apple</div>
          <div ngpListboxOption ngpListboxOptionValue="b" data-testid="opt-b">Apricot</div>
          <div ngpListboxOption ngpListboxOptionValue="c" data-testid="opt-c">Banana</div>
        </div>`,
        { imports },
      );
      const listbox = container.getByTestId('listbox');
      fireEvent.focusIn(listbox);
      await waitFor(() => expect(container.getByTestId('opt-a')).toHaveAttribute('data-active'));

      // Apple is active; pressing "a" moves to the next label starting with "a"
      fireEvent.keyDown(listbox, { key: 'a' });
      await waitFor(() => expect(container.getByTestId('opt-b')).toHaveAttribute('data-active'));

      // repeating "a" wraps back to Apple
      fireEvent.keyDown(listbox, { key: 'a' });
      await waitFor(() => expect(container.getByTestId('opt-a')).toHaveAttribute('data-active'));
    });

    it('should skip disabled options during typeahead', async () => {
      const container = await render(
        `<div ngpListbox data-testid="listbox">
          <div ngpListboxOption ngpListboxOptionValue="a" data-testid="opt-a">Apple</div>
          <div ngpListboxOption ngpListboxOptionValue="b" ngpListboxOptionDisabled data-testid="opt-b">
            Banana
          </div>
          <div ngpListboxOption ngpListboxOptionValue="c" data-testid="opt-c">Blueberry</div>
        </div>`,
        { imports },
      );
      const listbox = container.getByTestId('listbox');
      fireEvent.focusIn(listbox);
      await waitFor(() => expect(container.getByTestId('opt-a')).toHaveAttribute('data-active'));

      // "b" matches disabled Banana and enabled Blueberry — the disabled one is skipped
      fireEvent.keyDown(listbox, { key: 'b' });
      await waitFor(() => expect(container.getByTestId('opt-c')).toHaveAttribute('data-active'));
      expect(container.getByTestId('opt-b')).not.toHaveAttribute('data-active');
    });

    it('should not wrap past the last option with ArrowDown', async () => {
      const container = await render(
        `<div ngpListbox data-testid="listbox">
          <div ngpListboxOption ngpListboxOptionValue="a" data-testid="opt-a">A</div>
          <div ngpListboxOption ngpListboxOptionValue="b" data-testid="opt-b">B</div>
        </div>`,
        { imports },
      );
      const listbox = container.getByTestId('listbox');
      fireEvent.focusIn(listbox);
      fireEvent.keyDown(listbox, arrowDown);
      await waitFor(() => expect(container.getByTestId('opt-b')).toHaveAttribute('data-active'));

      // already on the last option — ArrowDown must not wrap to the first
      fireEvent.keyDown(listbox, arrowDown);
      await waitFor(() => expect(container.getByTestId('opt-b')).toHaveAttribute('data-active'));
      expect(container.getByTestId('opt-a')).not.toHaveAttribute('data-active');
    });

    it('should not wrap before the first option with ArrowUp', async () => {
      const container = await render(
        `<div ngpListbox data-testid="listbox">
          <div ngpListboxOption ngpListboxOptionValue="a" data-testid="opt-a">A</div>
          <div ngpListboxOption ngpListboxOptionValue="b" data-testid="opt-b">B</div>
        </div>`,
        { imports },
      );
      const listbox = container.getByTestId('listbox');
      fireEvent.focusIn(listbox);
      await waitFor(() => expect(container.getByTestId('opt-a')).toHaveAttribute('data-active'));

      // already on the first option — ArrowUp must not wrap to the last
      fireEvent.keyDown(listbox, arrowUp);
      await waitFor(() => expect(container.getByTestId('opt-a')).toHaveAttribute('data-active'));
      expect(container.getByTestId('opt-b')).not.toHaveAttribute('data-active');
    });

    it('should make the selected option the active descendant on init', async () => {
      const container = await render(
        `<div [ngpListboxValue]="['b']" ngpListbox data-testid="listbox">
          <div ngpListboxOption ngpListboxOptionValue="a" data-testid="opt-a">A</div>
          <div ngpListboxOption ngpListboxOptionValue="b" data-testid="opt-b">B</div>
          <div ngpListboxOption ngpListboxOptionValue="c" data-testid="opt-c">C</div>
        </div>`,
        { imports },
      );
      const listbox = container.getByTestId('listbox');
      fireEvent.focusIn(listbox);

      // the selected option (B), not the first option, becomes active
      await waitFor(() => expect(container.getByTestId('opt-b')).toHaveAttribute('data-active'));
      expect(listbox.getAttribute('aria-activedescendant')).toBe(
        container.getByTestId('opt-b').getAttribute('id'),
      );
      expect(container.getByTestId('opt-a')).not.toHaveAttribute('data-active');
    });
  });

  describe('single selection', () => {
    it('should select option on Enter key', async () => {
      const valueChange = vi.fn();
      const container = await render(
        `<div ngpListbox (ngpListboxValueChange)="valueChange($event)" data-testid="listbox">
          <div ngpListboxOption ngpListboxOptionValue="a" data-testid="opt-a">A</div>
          <div ngpListboxOption ngpListboxOptionValue="b" data-testid="opt-b">B</div>
        </div>`,
        { imports, componentProperties: { valueChange } },
      );
      const listbox = container.getByTestId('listbox');
      fireEvent.focusIn(listbox);
      await waitFor(() => expect(container.getByTestId('opt-a')).toHaveAttribute('data-active'));

      fireEvent.keyDown(listbox, { key: 'Enter' });
      expect(valueChange).toHaveBeenCalledWith(['a']);
    });

    it('should select option on Space key', async () => {
      const valueChange = vi.fn();
      const container = await render(
        `<div ngpListbox (ngpListboxValueChange)="valueChange($event)" data-testid="listbox">
          <div ngpListboxOption ngpListboxOptionValue="a" data-testid="opt-a">A</div>
        </div>`,
        { imports, componentProperties: { valueChange } },
      );
      const listbox = container.getByTestId('listbox');
      fireEvent.focusIn(listbox);
      await waitFor(() => expect(container.getByTestId('opt-a')).toHaveAttribute('data-active'));

      fireEvent.keyDown(listbox, { key: ' ' });
      expect(valueChange).toHaveBeenCalledWith(['a']);
    });

    it('should select option on click', async () => {
      const valueChange = vi.fn();
      const container = await render(
        `<div ngpListbox (ngpListboxValueChange)="valueChange($event)" data-testid="listbox">
          <div ngpListboxOption ngpListboxOptionValue="a" data-testid="opt-a">A</div>
          <div ngpListboxOption ngpListboxOptionValue="b" data-testid="opt-b">B</div>
        </div>`,
        { imports, componentProperties: { valueChange } },
      );
      fireEvent.click(container.getByTestId('opt-b'));
      expect(valueChange).toHaveBeenCalledWith(['b']);
    });

    it('should replace the selection when a different option is clicked', async () => {
      const valueChange = vi.fn();
      const container = await render(
        `<div ngpListbox (ngpListboxValueChange)="valueChange($event)" data-testid="listbox">
          <div ngpListboxOption ngpListboxOptionValue="a" data-testid="opt-a">A</div>
          <div ngpListboxOption ngpListboxOptionValue="b" data-testid="opt-b">B</div>
        </div>`,
        { imports, componentProperties: { valueChange } },
      );
      fireEvent.click(container.getByTestId('opt-a'));
      expect(valueChange).toHaveBeenLastCalledWith(['a']);

      fireEvent.click(container.getByTestId('opt-b'));
      expect(valueChange).toHaveBeenLastCalledWith(['b']);
    });

    it('should reflect data-selected from the value input', async () => {
      const container = await render(
        `<div ngpListbox [ngpListboxValue]="['b']" data-testid="listbox">
          <div ngpListboxOption ngpListboxOptionValue="a" data-testid="opt-a">A</div>
          <div ngpListboxOption ngpListboxOptionValue="b" data-testid="opt-b">B</div>
        </div>`,
        { imports },
      );
      expect(container.getByTestId('opt-b')).toHaveAttribute('data-selected');
      expect(container.getByTestId('opt-a')).not.toHaveAttribute('data-selected');
    });
  });

  describe('multiple selection', () => {
    it('should accumulate selected values', async () => {
      const valueChange = vi.fn();
      const container = await render(
        `<div ngpListbox ngpListboxMode="multiple" (ngpListboxValueChange)="valueChange($event)" data-testid="listbox">
          <div ngpListboxOption ngpListboxOptionValue="a" data-testid="opt-a">A</div>
          <div ngpListboxOption ngpListboxOptionValue="b" data-testid="opt-b">B</div>
          <div ngpListboxOption ngpListboxOptionValue="c" data-testid="opt-c">C</div>
        </div>`,
        { imports, componentProperties: { valueChange } },
      );
      fireEvent.click(container.getByTestId('opt-a'));
      expect(valueChange).toHaveBeenCalledWith(['a']);

      fireEvent.click(container.getByTestId('opt-c'));
      expect(valueChange).toHaveBeenCalledWith(['a', 'c']);
    });

    it('should deselect an already-selected value on click', async () => {
      const valueChange = vi.fn();
      const container = await render(
        `<div ngpListbox ngpListboxMode="multiple" (ngpListboxValueChange)="valueChange($event)" data-testid="listbox">
          <div ngpListboxOption ngpListboxOptionValue="a" data-testid="opt-a">A</div>
          <div ngpListboxOption ngpListboxOptionValue="b" data-testid="opt-b">B</div>
        </div>`,
        { imports, componentProperties: { valueChange } },
      );
      fireEvent.click(container.getByTestId('opt-a'));
      fireEvent.click(container.getByTestId('opt-b'));
      expect(valueChange).toHaveBeenLastCalledWith(['a', 'b']);

      fireEvent.click(container.getByTestId('opt-a'));
      expect(valueChange).toHaveBeenLastCalledWith(['b']);
    });
  });

  describe('disabled options', () => {
    it('should set data-disabled on disabled options', async () => {
      const container = await render(
        `<div ngpListbox data-testid="listbox">
          <div ngpListboxOption ngpListboxOptionValue="a" ngpListboxOptionDisabled data-testid="opt-a">A</div>
          <div ngpListboxOption ngpListboxOptionValue="b" data-testid="opt-b">B</div>
        </div>`,
        { imports },
      );
      expect(container.getByTestId('opt-a')).toHaveAttribute('data-disabled');
      expect(container.getByTestId('opt-b')).not.toHaveAttribute('data-disabled');
    });

    it('should set aria-disabled on disabled options', async () => {
      const container = await render(
        `<div ngpListbox data-testid="listbox">
          <div ngpListboxOption ngpListboxOptionValue="a" ngpListboxOptionDisabled data-testid="opt-a">A</div>
        </div>`,
        { imports },
      );
      expect(container.getByTestId('opt-a')).toHaveAttribute('aria-disabled', 'true');
    });

    it('should not select disabled options on click', async () => {
      const valueChange = vi.fn();
      const container = await render(
        `<div ngpListbox (ngpListboxValueChange)="valueChange($event)" data-testid="listbox">
          <div ngpListboxOption ngpListboxOptionValue="a" ngpListboxOptionDisabled data-testid="opt-a">A</div>
          <div ngpListboxOption ngpListboxOptionValue="b" data-testid="opt-b">B</div>
        </div>`,
        { imports, componentProperties: { valueChange } },
      );
      fireEvent.click(container.getByTestId('opt-a'));
      expect(valueChange).not.toHaveBeenCalled();
    });

    it('should skip disabled options during keyboard navigation', async () => {
      const container = await render(
        `<div ngpListbox data-testid="listbox">
          <div ngpListboxOption ngpListboxOptionValue="a" data-testid="opt-a">A</div>
          <div ngpListboxOption ngpListboxOptionValue="b" ngpListboxOptionDisabled data-testid="opt-b">B</div>
          <div ngpListboxOption ngpListboxOptionValue="c" data-testid="opt-c">C</div>
        </div>`,
        { imports },
      );
      const listbox = container.getByTestId('listbox');
      fireEvent.focusIn(listbox);
      await waitFor(() => expect(container.getByTestId('opt-a')).toHaveAttribute('data-active'));

      // ArrowDown should skip the disabled option B and go to C
      fireEvent.keyDown(listbox, arrowDown);
      await waitFor(() => expect(container.getByTestId('opt-c')).toHaveAttribute('data-active'));
    });

    it('should not activate a disabled option on mouseenter', async () => {
      const container = await render(
        `<div ngpListbox data-testid="listbox">
          <div ngpListboxOption ngpListboxOptionValue="a" data-testid="opt-a">A</div>
          <div ngpListboxOption ngpListboxOptionValue="b" ngpListboxOptionDisabled data-testid="opt-b">B</div>
        </div>`,
        { imports },
      );
      const listbox = container.getByTestId('listbox');
      fireEvent.focusIn(listbox);
      await waitFor(() => expect(container.getByTestId('opt-a')).toHaveAttribute('data-active'));

      fireEvent.mouseEnter(container.getByTestId('opt-b'));
      await waitFor(() => expect(container.getByTestId('opt-a')).toHaveAttribute('data-active'));
      expect(container.getByTestId('opt-b')).not.toHaveAttribute('data-active');
    });
  });

  describe('disabled listbox', () => {
    it('should not select an option on click when the listbox is disabled', async () => {
      const valueChange = vi.fn();
      const container = await render(
        `<div ngpListbox ngpListboxDisabled (ngpListboxValueChange)="valueChange($event)" data-testid="listbox">
          <div ngpListboxOption ngpListboxOptionValue="a" data-testid="opt-a">A</div>
          <div ngpListboxOption ngpListboxOptionValue="b" data-testid="opt-b">B</div>
        </div>`,
        { imports, componentProperties: { valueChange } },
      );
      fireEvent.click(container.getByTestId('opt-a'));
      expect(valueChange).not.toHaveBeenCalled();
    });

    it('should not select an option via keyboard when the listbox is disabled', async () => {
      const valueChange = vi.fn();
      const container = await render(
        `<div ngpListbox ngpListboxDisabled (ngpListboxValueChange)="valueChange($event)" data-testid="listbox">
          <div ngpListboxOption ngpListboxOptionValue="a" data-testid="opt-a">A</div>
          <div ngpListboxOption ngpListboxOptionValue="b" data-testid="opt-b">B</div>
        </div>`,
        { imports, componentProperties: { valueChange } },
      );
      const listbox = container.getByTestId('listbox');
      fireEvent.focusIn(listbox);

      fireEvent.keyDown(listbox, { key: 'Enter' });
      fireEvent.keyDown(listbox, { key: ' ' });
      expect(valueChange).not.toHaveBeenCalled();
    });

    it('cascades data-disabled onto options when the listbox is disabled', async () => {
      const container = await render(
        `<div ngpListbox ngpListboxDisabled data-testid="listbox">
          <div ngpListboxOption ngpListboxOptionValue="a" data-testid="opt-a">A</div>
          <div ngpListboxOption ngpListboxOptionValue="b" data-testid="opt-b">B</div>
        </div>`,
        { imports },
      );
      await waitFor(() =>
        expect(container.getByTestId('listbox')).toHaveAttribute('aria-disabled', 'true'),
      );
      // a disabled listbox marks its options disabled for styling and AT
      expect(container.getByTestId('opt-a')).toHaveAttribute('data-disabled', '');
      expect(container.getByTestId('opt-a')).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('sections and headers', () => {
    it('should set role="group" on sections', async () => {
      const container = await render(
        `<div ngpListbox>
          <div ngpListboxSection data-testid="section">
            <div ngpListboxOption ngpListboxOptionValue="a">A</div>
          </div>
        </div>`,
        { imports },
      );
      expect(container.getByTestId('section')).toHaveAttribute('role', 'group');
    });

    it('should set role="presentation" on headers', async () => {
      const container = await render(
        `<div ngpListbox>
          <div ngpListboxSection>
            <div ngpListboxHeader data-testid="header">Fruits</div>
            <div ngpListboxOption ngpListboxOptionValue="a">A</div>
          </div>
        </div>`,
        { imports },
      );
      expect(container.getByTestId('header')).toHaveAttribute('role', 'presentation');
    });

    it('should link section aria-labelledby to header id', async () => {
      const container = await render(
        `<div ngpListbox>
          <div ngpListboxSection data-testid="section">
            <div ngpListboxHeader data-testid="header">Fruits</div>
            <div ngpListboxOption ngpListboxOptionValue="a">A</div>
          </div>
        </div>`,
        { imports },
      );
      const header = container.getByTestId('header');
      const section = container.getByTestId('section');
      const headerId = header.getAttribute('id');
      expect(headerId).toBeTruthy();
      expect(section.getAttribute('aria-labelledby')).toBe(headerId);
    });
  });

  describe('dynamic options', () => {
    it('should preserve the active option when items are appended', async () => {
      const { getByTestId, fixture } = await render(TestListboxDynamicOptionsComponent);

      const listbox = getByTestId('listbox');
      const optionOne = getByTestId('option-One');
      const optionThree = getByTestId('option-Three');

      fireEvent.focusIn(listbox);
      await waitFor(() => expect(optionOne).toHaveAttribute('data-active'));

      fireEvent.keyDown(listbox, arrowDown);
      fireEvent.keyDown(listbox, arrowDown);

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

  describe('mouse activation', () => {
    it('should activate option on mouseenter', async () => {
      const container = await render(
        `<div ngpListbox data-testid="listbox">
          <div ngpListboxOption ngpListboxOptionValue="a" data-testid="opt-a">A</div>
          <div ngpListboxOption ngpListboxOptionValue="b" data-testid="opt-b">B</div>
        </div>`,
        { imports },
      );
      const listbox = container.getByTestId('listbox');
      fireEvent.focusIn(listbox);

      fireEvent.mouseEnter(container.getByTestId('opt-b'));
      await waitFor(() => {
        expect(container.getByTestId('opt-b')).toHaveAttribute('data-active');
      });
    });
  });

  describe('compareWith', () => {
    it('should use the compareWith function to determine the selected option', async () => {
      const container = await render(TestListboxCompareWithComponent);
      // opt-b should be selected even though the value object is a different reference
      expect(container.getByTestId('opt-b')).toHaveAttribute('data-selected');
      expect(container.getByTestId('opt-a')).not.toHaveAttribute('data-selected');
    });
  });

  describe('controlled mode', () => {
    it('should reflect a controlled value binding', async () => {
      const container = await render(
        `<div ngpListbox [ngpListboxValue]="['b']" data-testid="listbox">
          <div ngpListboxOption ngpListboxOptionValue="a" data-testid="opt-a">A</div>
          <div ngpListboxOption ngpListboxOptionValue="b" data-testid="opt-b">B</div>
        </div>`,
        { imports },
      );

      expect(container.getByTestId('opt-b')).toHaveAttribute('data-selected');
      expect(container.getByTestId('opt-a')).not.toHaveAttribute('data-selected');
    });

    it('should update the DOM when a controlled value changes via two-way binding on click', async () => {
      const container = await render(
        `<div ngpListbox [(ngpListboxValue)]="value" data-testid="listbox">
          <div ngpListboxOption ngpListboxOptionValue="a" data-testid="opt-a">A</div>
          <div ngpListboxOption ngpListboxOptionValue="b" data-testid="opt-b">B</div>
        </div>`,
        { imports, componentProperties: { value: [] as string[] } },
      );

      fireEvent.click(container.getByTestId('opt-a'));
      expect(container.getByTestId('opt-a')).toHaveAttribute('data-selected');

      fireEvent.click(container.getByTestId('opt-b'));
      expect(container.getByTestId('opt-b')).toHaveAttribute('data-selected');
      expect(container.getByTestId('opt-a')).not.toHaveAttribute('data-selected');
    });

    it('should emit valueChange on click but not update the DOM when the parent does not update the binding', async () => {
      const valueChange = vi.fn();
      const container = await render(
        `<div
          ngpListbox
          [ngpListboxValue]="value"
          (ngpListboxValueChange)="valueChange($event)"
          data-testid="listbox"
        >
          <div ngpListboxOption ngpListboxOptionValue="a" data-testid="opt-a">A</div>
          <div ngpListboxOption ngpListboxOptionValue="b" data-testid="opt-b">B</div>
        </div>`,
        { imports, componentProperties: { value: ['a'] as string[], valueChange } },
      );

      // "a" is the controlled selection.
      expect(container.getByTestId('opt-a')).toHaveAttribute('data-selected');

      // Clicking another option notifies the consumer through valueChange, but
      // because the parent never writes the new value back, the controlled
      // selection must stay put — the internal value must not drift.
      fireEvent.click(container.getByTestId('opt-b'));

      expect(valueChange).toHaveBeenCalledWith(['b']);
      expect(container.getByTestId('opt-a')).toHaveAttribute('data-selected');
      expect(container.getByTestId('opt-b')).not.toHaveAttribute('data-selected');
    });
  });

  describe('defaultValue (uncontrolled)', () => {
    it('should select the default value on init', async () => {
      const container = await render(
        `<div ngpListbox [ngpListboxDefaultValue]="['b']" data-testid="listbox">
          <div ngpListboxOption ngpListboxOptionValue="a" data-testid="opt-a">A</div>
          <div ngpListboxOption ngpListboxOptionValue="b" data-testid="opt-b">B</div>
        </div>`,
        { imports },
      );

      expect(container.getByTestId('opt-b')).toHaveAttribute('data-selected');
      expect(container.getByTestId('opt-a')).not.toHaveAttribute('data-selected');
    });

    it('should let a click override the default value (uncontrolled)', async () => {
      const container = await render(
        `<div ngpListbox [ngpListboxDefaultValue]="['b']" data-testid="listbox">
          <div ngpListboxOption ngpListboxOptionValue="a" data-testid="opt-a">A</div>
          <div ngpListboxOption ngpListboxOptionValue="b" data-testid="opt-b">B</div>
        </div>`,
        { imports },
      );

      fireEvent.click(container.getByTestId('opt-a'));

      expect(container.getByTestId('opt-a')).toHaveAttribute('data-selected');
      expect(container.getByTestId('opt-b')).not.toHaveAttribute('data-selected');
    });

    it('should prefer a controlled value over the default value when both are provided', async () => {
      const container = await render(
        `<div
          ngpListbox
          [ngpListboxValue]="['a']"
          [ngpListboxDefaultValue]="['b']"
          data-testid="listbox"
        >
          <div ngpListboxOption ngpListboxOptionValue="a" data-testid="opt-a">A</div>
          <div ngpListboxOption ngpListboxOptionValue="b" data-testid="opt-b">B</div>
        </div>`,
        { imports },
      );

      expect(container.getByTestId('opt-a')).toHaveAttribute('data-selected');
      expect(container.getByTestId('opt-b')).not.toHaveAttribute('data-selected');
    });
  });
});
