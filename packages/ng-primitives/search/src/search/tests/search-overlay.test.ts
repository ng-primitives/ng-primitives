import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/angular';
import {
  NgpDialog,
  NgpDialogManager,
  NgpDialogOverlay,
  NgpDialogTrigger,
} from 'ng-primitives/dialog';
import { NgpInput } from 'ng-primitives/input';
import { NgpSearch } from 'ng-primitives/search';
import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

@Component({
  imports: [NgpDialogTrigger, NgpDialogOverlay, NgpDialog, NgpSearch, NgpInput],
  template: `
    <button [ngpDialogTrigger]="dialog" data-testid="trigger">Open</button>
    <ng-template #dialog>
      <div ngpDialogOverlay>
        <div ngpDialog data-testid="dialog">
          <div ngpSearch>
            <input [readOnly]="readOnly()" ngpInput type="search" data-testid="query" />
          </div>
          <button data-testid="other">Other</button>
        </div>
      </div>
    </ng-template>
  `,
})
class DialogHost {
  readonly readOnly = signal(false);
}

async function openDialog(value: string, readOnly = false): Promise<HTMLInputElement> {
  const { fixture } = await render(DialogHost);
  fixture.componentInstance.readOnly.set(readOnly);
  fireEvent.click(screen.getByTestId('trigger'));
  const input = (await screen.findByTestId('query')) as HTMLInputElement;
  await fixture.whenStable();
  input.focus();
  input.value = value;
  fireEvent.input(input);
  return input;
}

const dialogClosed = () => waitFor(() => expect(screen.queryByTestId('dialog')).toBeNull());

describe('NgpSearch inside an overlay', () => {
  afterEach(async () => {
    TestBed.inject(NgpDialogManager).closeAll();
    await waitFor(() => expect(document.querySelector('[ngpDialogOverlay]')).toBeNull());
  });

  it('keeps the dialog open when Escape clears the text, and closes it on the next Escape', async () => {
    const input = await openDialog('abc');

    fireEvent.keyDown(input, { key: 'Escape' });
    expect(input.value).toBe('');
    // give a wrongly dismissed dialog time to leave the DOM
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(screen.queryByTestId('dialog')).not.toBeNull();

    fireEvent.keyDown(input, { key: 'Escape' });
    await dialogClosed();
  });

  it('behaves the same with real typing and key presses', async () => {
    const input = await openDialog('');

    await userEvent.type(input, 'abc');
    expect(input.value).toBe('abc');

    await userEvent.keyboard('{Escape}');
    expect(input.value).toBe('');
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(screen.queryByTestId('dialog')).not.toBeNull();

    await userEvent.keyboard('{Escape}');
    await dialogClosed();
  });

  it('closes the dialog on Escape when the field is empty', async () => {
    const input = await openDialog('');

    fireEvent.keyDown(input, { key: 'Escape' });
    await dialogClosed();
  });

  it('closes the dialog on Escape when the field is read-only', async () => {
    const input = await openDialog('abc', true);

    fireEvent.keyDown(input, { key: 'Escape' });
    await dialogClosed();
    expect(input.value).toBe('abc');
  });

  it('closes the dialog on Escape from outside the search, even with text in it', async () => {
    await openDialog('abc');

    fireEvent.keyDown(screen.getByTestId('other'), { key: 'Escape' });
    await dialogClosed();
  });
});
