import { Component, signal } from '@angular/core';
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

@Component({
  template: `
    <div ngpSelect data-testid="select">
      <div *ngpSelectPortal ngpSelectDropdown data-testid="dropdown">
        <div ngpSelectOption ngpSelectOptionValue="Apple">Apple</div>
      </div>
    </div>
  `,
  imports: [NgpSelect, NgpSelectDropdown, NgpSelectOption, NgpSelectPortal],
})
class ListboxSelectComponent {}

@Component({
  template: `
    <div ngpSelect ngpSelectHasPopup="dialog" data-testid="select">
      <div *ngpSelectPortal ngpSelectDropdown data-testid="dropdown">
        <input ngpSelectInput data-testid="select-input" />
        <div ngpSelectList>
          <div ngpSelectOption ngpSelectOptionValue="Apple">Apple</div>
        </div>
      </div>
    </div>
  `,
  imports: [
    NgpSelect,
    NgpSelectDropdown,
    NgpSelectInput,
    NgpSelectList,
    NgpSelectOption,
    NgpSelectPortal,
  ],
})
class DialogSelectComponent {}

@Component({
  template: `
    <div ngpSelect data-testid="select">
      <div *ngpSelectPortal ngpSelectDropdown data-testid="dropdown">
        <div ngpSelectList>
          <div ngpSelectOption ngpSelectOptionValue="Apple">Apple</div>
        </div>
      </div>
    </div>
  `,
  imports: [NgpSelect, NgpSelectDropdown, NgpSelectList, NgpSelectOption, NgpSelectPortal],
})
class ListWithoutInputSelectComponent {}

@Component({
  template: `
    <div ngpSelect aria-haspopup="dialog" data-testid="select">
      <div *ngpSelectPortal ngpSelectDropdown data-testid="dropdown">
        <div ngpSelectOption ngpSelectOptionValue="Apple">Apple</div>
      </div>
    </div>
  `,
  imports: [NgpSelect, NgpSelectDropdown, NgpSelectOption, NgpSelectPortal],
})
class StaticAttributeSelectComponent {}

@Component({
  template: `
    <div [ngpSelectHasPopup]="hasPopup()" ngpSelect data-testid="select">
      <div *ngpSelectPortal ngpSelectDropdown data-testid="dropdown">
        <div ngpSelectOption ngpSelectOptionValue="Apple">Apple</div>
      </div>
    </div>
  `,
  imports: [NgpSelect, NgpSelectDropdown, NgpSelectOption, NgpSelectPortal],
})
class BoundSelectComponent {
  readonly hasPopup = signal<NgpSelectHasPopup | undefined>('listbox');
}

@Component({
  template: `
    <div ngpSelect data-testid="select">
      <div *ngpSelectPortal ngpSelectDropdown data-testid="dropdown">
        <input ngpSelectInput data-testid="select-input" />
        <div ngpSelectList>
          <div ngpSelectOption ngpSelectOptionValue="Apple">Apple</div>
        </div>
      </div>
    </div>
  `,
  imports: [
    NgpSelect,
    NgpSelectDropdown,
    NgpSelectInput,
    NgpSelectList,
    NgpSelectOption,
    NgpSelectPortal,
  ],
})
class UnannouncedDialogSelectComponent {}

@Component({
  template: `
    <div ngpSelect aria-haspopup="dialog" data-testid="select">
      <div *ngpSelectPortal ngpSelectDropdown data-testid="dropdown">
        <input ngpSelectInput data-testid="select-input" />
        <div ngpSelectList>
          <div ngpSelectOption ngpSelectOptionValue="Apple">Apple</div>
        </div>
      </div>
    </div>
  `,
  imports: [
    NgpSelect,
    NgpSelectDropdown,
    NgpSelectInput,
    NgpSelectList,
    NgpSelectOption,
    NgpSelectPortal,
  ],
})
class StaticAttributeDialogSelectComponent {}

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
    await render(ListboxSelectComponent);

    expect(screen.getByTestId('select')).not.toHaveAttribute('aria-haspopup');

    const select = await open();

    expect(screen.getByTestId('dropdown')).toHaveAttribute('role', 'listbox');
    expect(select).not.toHaveAttribute('aria-haspopup');
  });

  it('sets no aria-haspopup for a list without a search input', async () => {
    await render(ListWithoutInputSelectComponent);

    expect(screen.getByTestId('select')).not.toHaveAttribute('aria-haspopup');

    const select = await open();

    expect(select).toHaveAttribute('role', 'combobox');
    expect(select).not.toHaveAttribute('aria-haspopup');
  });

  it("keeps the host's own aria-haspopup while the input is unset", async () => {
    await render(StaticAttributeSelectComponent);

    expect(screen.getByTestId('select')).toHaveAttribute('aria-haspopup', 'dialog');

    const select = await open();
    expect(select).toHaveAttribute('aria-haspopup', 'dialog');

    await close();
    expect(select).toHaveAttribute('aria-haspopup', 'dialog');
  });

  it('follows the input as it changes', async () => {
    const { fixture } = await render(BoundSelectComponent);
    const select = screen.getByTestId('select');
    expect(select).toHaveAttribute('aria-haspopup', 'listbox');

    fixture.componentInstance.hasPopup.set('dialog');
    fixture.detectChanges();
    expect(select).toHaveAttribute('aria-haspopup', 'dialog');

    fixture.componentInstance.hasPopup.set(undefined);
    fixture.detectChanges();
    expect(select).not.toHaveAttribute('aria-haspopup');
  });

  it('announces a dialog popup before the first opening', async () => {
    await render(DialogSelectComponent);

    expect(screen.getByTestId('select')).toHaveAttribute('aria-haspopup', 'dialog');
  });

  it('drops aria-haspopup while the search input is the combobox', async () => {
    await render(DialogSelectComponent);
    const select = await open();

    expect(screen.getByTestId('dropdown')).toHaveAttribute('role', 'dialog');
    await waitFor(() => expect(select).not.toHaveAttribute('role'));
    expect(select).not.toHaveAttribute('aria-haspopup');
  });

  it('announces a dialog popup again after closing', async () => {
    await render(DialogSelectComponent);
    const select = await open();

    await close();

    await waitFor(() => expect(select).toHaveAttribute('role', 'combobox'));
    expect(select).toHaveAttribute('aria-haspopup', 'dialog');
  });

  describe('in dev mode', () => {
    afterEach(() => vi.restoreAllMocks());

    it('warns when a search input is composed without ngpSelectHasPopup="dialog"', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      await render(UnannouncedDialogSelectComponent);

      await open();

      await waitFor(() => expect(warn).toHaveBeenCalledWith(hasPopupWarning));
    });

    it('stays silent when the select announces the dialog', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      await render(DialogSelectComponent);

      const select = await open();
      await waitFor(() => expect(select).not.toHaveAttribute('role'));

      expect(warn).not.toHaveBeenCalledWith(hasPopupWarning);
    });

    it("stays silent when the host's own aria-haspopup announces the dialog", async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      await render(StaticAttributeDialogSelectComponent);

      const select = await open();
      await waitFor(() => expect(select).not.toHaveAttribute('role'));

      expect(warn).not.toHaveBeenCalledWith(hasPopupWarning);
    });
  });
});
