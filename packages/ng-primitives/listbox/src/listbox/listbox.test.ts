import { Component, signal } from '@angular/core';
import { fireEvent, render, waitFor } from '@testing-library/angular';
import { describe, expect, it, vi } from 'vitest';
import { NgpListboxHeader } from '../listbox-header/listbox-header';
import { NgpListboxOption } from '../listbox-option/listbox-option';
import { NgpListboxSection } from '../listbox-section/listbox-section';
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

const imports = [NgpListbox, NgpListboxOption, NgpListboxSection, NgpListboxHeader];

describe('NgpListbox', () => {
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

      fireEvent.keyDown(listbox, { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40, which: 40 });
      await waitFor(() => expect(container.getByTestId('opt-b')).toHaveAttribute('data-active'));

      fireEvent.keyDown(listbox, { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40, which: 40 });
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

      fireEvent.keyDown(listbox, { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40, which: 40 });
      fireEvent.keyDown(listbox, { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40, which: 40 });
      await waitFor(() => expect(container.getByTestId('opt-c')).toHaveAttribute('data-active'));

      fireEvent.keyDown(listbox, { key: 'ArrowUp', code: 'ArrowUp', keyCode: 38, which: 38 });
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
      fireEvent.keyDown(listbox, { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40, which: 40 });
      fireEvent.keyDown(listbox, { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40, which: 40 });
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
  });

  describe('selection', () => {
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

    it('should set data-selected on selected options', async () => {
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

    it('should support multiple selection mode', async () => {
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
      fireEvent.keyDown(listbox, { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40, which: 40 });
      await waitFor(() => expect(container.getByTestId('opt-c')).toHaveAttribute('data-active'));
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

  describe('mouseenter', () => {
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
});
