import { Component } from '@angular/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/angular';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  NgpSelect,
  NgpSelectDropdown,
  NgpSelectInput,
  NgpSelectList,
  NgpSelectOption,
  NgpSelectPortal,
} from '../../index';

const imports = [
  NgpSelect,
  NgpSelectDropdown,
  NgpSelectInput,
  NgpSelectList,
  NgpSelectOption,
  NgpSelectPortal,
];

const optionTemplate = `<div ngpSelectOption ngpSelectOptionValue="Apple">Apple</div>`;
const inputTemplate = `<input ngpSelectInput data-testid="select-input" />`;
const searchableTemplate = `${inputTemplate}<div ngpSelectList>${optionTemplate}</div>`;

/** Renders a select with `host` as its host's attributes and `dropdown` as its dropdown's content. */
function renderSelect(host: string, dropdown: string) {
  return render(
    `<div ngpSelect ${host} data-testid="select">
      <div *ngpSelectPortal ngpSelectDropdown data-testid="dropdown">${dropdown}</div>
    </div>`,
    { imports },
  );
}

/** A reusable searchable select that announces its dialog through its own host metadata. */
@Component({
  selector: 'app-dialog-select',
  hostDirectives: [NgpSelect],
  host: { 'aria-haspopup': 'dialog' },
  template: `
    <div *ngpSelectPortal ngpSelectDropdown data-testid="dropdown">
      <input ngpSelectInput data-testid="select-input" />
      <div ngpSelectList>
        <div ngpSelectOption ngpSelectOptionValue="Apple">Apple</div>
      </div>
    </div>
  `,
  imports: [NgpSelectDropdown, NgpSelectInput, NgpSelectList, NgpSelectOption, NgpSelectPortal],
})
class WrappedSelectComponent {}

function renderWrappedSelect() {
  return render(`<app-dialog-select data-testid="select" />`, {
    imports: [WrappedSelectComponent],
  });
}

const hasPopupWarning = expect.stringContaining('aria-haspopup="dialog"');

async function open(): Promise<HTMLElement> {
  const select = screen.getByTestId('select');
  fireEvent.click(select);
  await waitFor(() => expect(screen.getByTestId('dropdown')).toHaveAttribute('role'));
  return select;
}

/** Opens a select whose dropdown holds a search input, and waits for the input to take the combobox role over. */
async function openSearchable(): Promise<HTMLElement> {
  const select = await open();
  await waitFor(() => expect(select).not.toHaveAttribute('role'));
  return select;
}

async function close(): Promise<void> {
  if (screen.queryByTestId('dropdown')) {
    fireEvent.keyDown(screen.getByTestId('dropdown'), { key: 'Escape' });
  }
  await waitFor(() => expect(screen.queryByTestId('dropdown')).not.toBeInTheDocument());
}

describe('NgpSelect aria-haspopup', () => {
  afterEach(async () => {
    await close();
    vi.restoreAllMocks();
  });

  it('sets no aria-haspopup with a search input in the dropdown', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await renderSelect('', searchableTemplate);

    expect(screen.getByTestId('select')).not.toHaveAttribute('aria-haspopup');

    const select = await openSearchable();
    expect(select).not.toHaveAttribute('aria-haspopup');

    await close();
    expect(select).not.toHaveAttribute('aria-haspopup');
  });

  it("keeps the host's static aria-haspopup with a search input in the dropdown", async () => {
    await renderSelect('aria-haspopup="dialog"', searchableTemplate);

    expect(screen.getByTestId('select')).toHaveAttribute('aria-haspopup', 'dialog');

    const select = await openSearchable();
    expect(select).toHaveAttribute('aria-haspopup', 'dialog');

    await close();
    expect(select).toHaveAttribute('aria-haspopup', 'dialog');
  });

  describe('in dev mode', () => {
    it.each([
      ['no aria-haspopup', ''],
      ['aria-haspopup="listbox"', 'aria-haspopup="listbox"'],
    ])('warns when a search input is composed with %s on the select', async (_, host) => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      await renderSelect(host, searchableTemplate);

      await open();

      await waitFor(() => expect(warn).toHaveBeenCalledWith(hasPopupWarning));
    });

    it.each([
      ['a static attribute', () => renderSelect('aria-haspopup="dialog"', searchableTemplate)],
      ['a binding', () => renderSelect('[attr.aria-haspopup]="\'dialog\'"', searchableTemplate)],
      ["a wrapper's host metadata", renderWrappedSelect],
    ])('stays silent when %s announces the dialog', async (_, renderAnnounced) => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      await renderAnnounced();

      await openSearchable();

      expect(warn).not.toHaveBeenCalledWith(hasPopupWarning);
    });

    it('stays silent without an ngpSelectList, where the dropdown is a listbox', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      await renderSelect('', `${inputTemplate}${optionTemplate}`);

      await open();

      await waitFor(() =>
        expect(error).toHaveBeenCalledWith(expect.stringContaining('ngpSelectList')),
      );
      expect(screen.getByTestId('dropdown')).toHaveAttribute('role', 'listbox');
      expect(warn).not.toHaveBeenCalledWith(hasPopupWarning);
    });
  });
});
