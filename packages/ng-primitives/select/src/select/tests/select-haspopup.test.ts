import { Component, Directive, ElementRef, inject, signal } from '@angular/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/angular';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  NgpSelect,
  type NgpSelectHasPopup,
  NgpSelectDropdown,
  NgpSelectInput,
  NgpSelectList,
  NgpSelectOption,
  NgpSelectPortal,
} from '../../index';

/** Leaves the host as hydration finds it: holding the `aria-haspopup` the server render wrote. */
@Directive({ selector: '[serverRenderedHasPopup]' })
class ServerRenderedHasPopup {
  constructor() {
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.setAttribute(
      'aria-haspopup',
      'dialog',
    );
  }
}

const imports = [
  // the server-rendered attribute has to be on the host before the select is created
  ServerRenderedHasPopup,
  NgpSelect,
  NgpSelectDropdown,
  NgpSelectInput,
  NgpSelectList,
  NgpSelectOption,
  NgpSelectPortal,
];

const option = `<div ngpSelectOption ngpSelectOptionValue="Apple">Apple</div>`;
const list = `<div ngpSelectList>${option}</div>`;
const searchable = `<input ngpSelectInput data-testid="select-input" />${list}`;

/** Renders a select with `host` as its host's attributes and `dropdown` as its dropdown's content. */
function renderSelect(host: string, dropdown = option, componentProperties = {}) {
  return render(
    `<div ngpSelect ${host} data-testid="select">
      <div *ngpSelectPortal ngpSelectDropdown data-testid="dropdown">${dropdown}</div>
    </div>`,
    { imports, componentProperties },
  );
}

/** A reusable select that announces its popup through its own host metadata. */
@Component({
  selector: 'app-dialog-select',
  hostDirectives: [NgpSelect],
  host: { 'aria-haspopup': 'dialog' },
  template: `
    <div *ngpSelectPortal ngpSelectDropdown data-testid="dropdown">
      <div ngpSelectOption ngpSelectOptionValue="Apple">Apple</div>
    </div>
  `,
  imports: [NgpSelectDropdown, NgpSelectOption, NgpSelectPortal],
})
class WrappedSelectComponent {}

const hasPopupWarning = expect.stringContaining('ngpSelectHasPopup="dialog"');

async function open(): Promise<HTMLElement> {
  const select = screen.getByTestId('select');
  fireEvent.click(select);
  await waitFor(() => expect(screen.getByTestId('dropdown')).toBeInTheDocument());
  return select;
}

async function close(): Promise<void> {
  if (screen.queryByTestId('dropdown')) {
    fireEvent.keyDown(screen.getByTestId('dropdown'), { key: 'Escape' });
  }
  await waitFor(() => expect(screen.queryByTestId('dropdown')).not.toBeInTheDocument());
}

describe('NgpSelect aria-haspopup', () => {
  afterEach(close);

  it('sets no aria-haspopup by default, leaving the combobox its implicit listbox', async () => {
    await renderSelect('');

    expect(screen.getByTestId('select')).not.toHaveAttribute('aria-haspopup');

    const select = await open();

    expect(screen.getByTestId('dropdown')).toHaveAttribute('role', 'listbox');
    expect(select).not.toHaveAttribute('aria-haspopup');
  });

  it('sets no aria-haspopup for a list without a search input', async () => {
    await renderSelect('', list);

    expect(screen.getByTestId('select')).not.toHaveAttribute('aria-haspopup');

    const select = await open();

    expect(select).toHaveAttribute('role', 'combobox');
    expect(select).not.toHaveAttribute('aria-haspopup');
  });

  it('sets no aria-haspopup for an empty input', async () => {
    await renderSelect('ngpSelectHasPopup');

    expect(screen.getByTestId('select')).not.toHaveAttribute('aria-haspopup');
  });

  describe('while the input is unset', () => {
    it.each([
      ['a listbox', option],
      ['a search input', searchable],
    ])("keeps the host's static aria-haspopup with %s in the dropdown", async (_, dropdown) => {
      await renderSelect('aria-haspopup="dialog"', dropdown);

      expect(screen.getByTestId('select')).toHaveAttribute('aria-haspopup', 'dialog');

      const select = await open();
      await waitFor(() => expect(screen.getByTestId('dropdown')).toHaveAttribute('role'));
      expect(select).toHaveAttribute('aria-haspopup', 'dialog');

      await close();
      expect(select).toHaveAttribute('aria-haspopup', 'dialog');
    });

    it("keeps an aria-haspopup set through a wrapper's host metadata", async () => {
      const { fixture } = await render(WrappedSelectComponent);

      expect(fixture.nativeElement).toHaveAttribute('aria-haspopup', 'dialog');
    });

    it("keeps the host's bound aria-haspopup as it changes", async () => {
      const popup = signal('dialog');
      const { fixture } = await renderSelect('[attr.aria-haspopup]="popup()"', option, { popup });
      const select = screen.getByTestId('select');
      expect(select).toHaveAttribute('aria-haspopup', 'dialog');

      popup.set('listbox');
      fixture.detectChanges();
      expect(select).toHaveAttribute('aria-haspopup', 'listbox');
    });
  });

  it('follows the input as it changes', async () => {
    const hasPopup = signal<NgpSelectHasPopup | undefined>('listbox');
    const { fixture } = await renderSelect('[ngpSelectHasPopup]="hasPopup()"', option, {
      hasPopup,
    });
    const select = screen.getByTestId('select');
    expect(select).toHaveAttribute('aria-haspopup', 'listbox');

    hasPopup.set('dialog');
    fixture.detectChanges();
    expect(select).toHaveAttribute('aria-haspopup', 'dialog');

    hasPopup.set(undefined);
    fixture.detectChanges();
    expect(select).not.toHaveAttribute('aria-haspopup');
  });

  it.each<NgpSelectHasPopup>(['dialog', 'listbox'])(
    "hands the host's static aria-haspopup back once the input %s is unset",
    async initial => {
      const hasPopup = signal<NgpSelectHasPopup | undefined>(initial);
      const { fixture } = await renderSelect(
        'aria-haspopup="dialog" [ngpSelectHasPopup]="hasPopup()"',
        option,
        { hasPopup },
      );
      const select = screen.getByTestId('select');
      expect(select).toHaveAttribute('aria-haspopup', initial);

      hasPopup.set(undefined);
      fixture.detectChanges();

      expect(select).toHaveAttribute('aria-haspopup', 'dialog');
    },
  );

  it('keeps an aria-haspopup the consumer bound over its own once the input is unset', async () => {
    const hasPopup = signal<NgpSelectHasPopup | undefined>('listbox');
    const popup = signal<string | undefined>(undefined);
    const { fixture } = await renderSelect(
      '[ngpSelectHasPopup]="hasPopup()" [attr.aria-haspopup]="popup()"',
      option,
      { hasPopup, popup },
    );
    const select = screen.getByTestId('select');
    expect(select).toHaveAttribute('aria-haspopup', 'listbox');

    popup.set('dialog');
    fixture.detectChanges();
    expect(select).toHaveAttribute('aria-haspopup', 'dialog');

    hasPopup.set(undefined);
    fixture.detectChanges();

    expect(select).toHaveAttribute('aria-haspopup', 'dialog');
  });

  it('removes an aria-haspopup the server render wrote once the input is unset', async () => {
    const hasPopup = signal<NgpSelectHasPopup | undefined>('dialog');
    const { fixture } = await renderSelect(
      '[ngpSelectHasPopup]="hasPopup()" serverRenderedHasPopup',
      option,
      { hasPopup },
    );
    const select = screen.getByTestId('select');
    expect(select).toHaveAttribute('aria-haspopup', 'dialog');

    hasPopup.set(undefined);
    fixture.detectChanges();

    expect(select).not.toHaveAttribute('aria-haspopup');
  });

  it('announces a dialog popup before the first opening', async () => {
    await renderSelect('ngpSelectHasPopup="dialog"', searchable);

    expect(screen.getByTestId('select')).toHaveAttribute('aria-haspopup', 'dialog');
  });

  it('drops its aria-haspopup while the search input is the combobox', async () => {
    await renderSelect('ngpSelectHasPopup="dialog"', searchable);
    const select = await open();

    expect(screen.getByTestId('dropdown')).toHaveAttribute('role', 'dialog');
    await waitFor(() => expect(select).not.toHaveAttribute('role'));
    expect(select).not.toHaveAttribute('aria-haspopup');
  });

  it('announces a dialog popup again after closing', async () => {
    await renderSelect('ngpSelectHasPopup="dialog"', searchable);
    const select = await open();

    await close();

    await waitFor(() => expect(select).toHaveAttribute('role', 'combobox'));
    expect(select).toHaveAttribute('aria-haspopup', 'dialog');
  });

  describe('in dev mode', () => {
    afterEach(() => vi.restoreAllMocks());

    it('warns when a search input is composed without ngpSelectHasPopup="dialog"', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      await renderSelect('', searchable);

      await open();

      await waitFor(() => expect(warn).toHaveBeenCalledWith(hasPopupWarning));
    });

    it.each([
      ['the select announces the dialog', 'ngpSelectHasPopup="dialog"'],
      ["the host's static aria-haspopup announces the dialog", 'aria-haspopup="dialog"'],
      ["the host's bound aria-haspopup announces the dialog", '[attr.aria-haspopup]="\'dialog\'"'],
    ])('stays silent when %s', async (_, host) => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      await renderSelect(host, searchable);

      const select = await open();
      await waitFor(() => expect(select).not.toHaveAttribute('role'));

      expect(warn).not.toHaveBeenCalledWith(hasPopupWarning);
    });
  });
});
