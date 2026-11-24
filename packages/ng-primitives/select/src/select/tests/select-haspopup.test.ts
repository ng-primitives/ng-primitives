import { Component, signal } from '@angular/core';
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
const listTemplate = `<div ngpSelectList>${optionTemplate}</div>`;
const searchableTemplate = `<input ngpSelectInput data-testid="select-input" />${listTemplate}`;

/** Renders a select with `host` as its host's attributes and `dropdown` as its dropdown's content. */
function renderSelect(host: string, dropdown = optionTemplate, componentProperties = {}) {
  return render(
    `<div ngpSelect ${host} data-testid="select">
      <div *ngpSelectPortal ngpSelectDropdown data-testid="dropdown">${dropdown}</div>
    </div>`,
    { imports, componentProperties },
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

  it.each([
    ['options', optionTemplate],
    ['a list', listTemplate],
    ['a search input', searchableTemplate],
  ])('sets no aria-haspopup with %s in the dropdown', async (_, dropdown) => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await renderSelect('', dropdown);

    expect(screen.getByTestId('select')).not.toHaveAttribute('aria-haspopup');

    const select = await open();
    expect(select).not.toHaveAttribute('aria-haspopup');

    await close();
    expect(select).not.toHaveAttribute('aria-haspopup');
  });

  it.each([
    ['a listbox', optionTemplate],
    ['a search input', searchableTemplate],
  ])("keeps the host's static aria-haspopup with %s in the dropdown", async (_, dropdown) => {
    await renderSelect('aria-haspopup="dialog"', dropdown);

    expect(screen.getByTestId('select')).toHaveAttribute('aria-haspopup', 'dialog');

    const select = await open();
    expect(select).toHaveAttribute('aria-haspopup', 'dialog');

    await close();
    expect(select).toHaveAttribute('aria-haspopup', 'dialog');
  });

  it("keeps the host's bound aria-haspopup and follows its changes", async () => {
    const popup = signal<string | undefined>('dialog');
    const { fixture } = await renderSelect('[attr.aria-haspopup]="popup()"', searchableTemplate, {
      popup,
    });
    const select = screen.getByTestId('select');
    expect(select).toHaveAttribute('aria-haspopup', 'dialog');

    await openSearchable();
    expect(select).toHaveAttribute('aria-haspopup', 'dialog');

    await close();
    expect(select).toHaveAttribute('aria-haspopup', 'dialog');

    popup.set('listbox');
    fixture.detectChanges();
    expect(select).toHaveAttribute('aria-haspopup', 'listbox');

    popup.set(undefined);
    fixture.detectChanges();
    expect(select).not.toHaveAttribute('aria-haspopup');
  });

  it("keeps an aria-haspopup set through a wrapper's host metadata", async () => {
    await renderWrappedSelect();

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
      ['static', 'aria-haspopup="dialog"'],
      ['bound', '[attr.aria-haspopup]="\'dialog\'"'],
    ])("stays silent when the host's %s aria-haspopup announces the dialog", async (_, host) => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      await renderSelect(host, searchableTemplate);

      await openSearchable();

      expect(warn).not.toHaveBeenCalledWith(hasPopupWarning);
    });

    it("stays silent when a wrapper's host metadata announces the dialog", async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      await renderWrappedSelect();

      await openSearchable();

      expect(warn).not.toHaveBeenCalledWith(hasPopupWarning);
    });
  });
});
