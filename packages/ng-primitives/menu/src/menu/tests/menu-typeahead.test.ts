import { Component, input } from '@angular/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/angular';
import {
  NgpContextMenu,
  NgpContextMenuItem,
  NgpContextMenuTrigger,
} from 'ng-primitives/context-menu';
import { NgpMenu, NgpMenuItem, NgpMenuTrigger, NgpSubmenuTrigger } from 'ng-primitives/menu';
import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

@Component({
  template: `
    <button [ngpMenuTrigger]="menu" data-testid="trigger">Actions</button>

    <ng-template #menu>
      <div ngpMenu data-testid="menu">
        <button ngpMenuItem data-testid="rename">Rename</button>
        <button [ngpMenuItemDisabled]="deleteDisabled()" ngpMenuItem data-testid="delete">
          Delete
        </button>
        <button ngpMenuItem data-testid="duplicate">Duplicate</button>
        <button ngpMenuItem data-testid="archive">Archive</button>
        <div ngpMenuItem data-testid="name-item">
          Name
          <input aria-label="Name" data-testid="name" />
        </div>
        <button [ngpSubmenuTrigger]="submenu" ngpMenuItem data-testid="share">Share</button>
      </div>
    </ng-template>

    <ng-template #submenu>
      <div ngpMenu data-testid="submenu">
        <button ngpMenuItem>Email</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem, NgpSubmenuTrigger],
})
class MenuComponent {
  readonly deleteDisabled = input(false);
}

@Component({
  template: `
    <div [ngpContextMenuTrigger]="menu" tabindex="0" data-testid="area">Right-click me</div>

    <ng-template #menu>
      <div ngpContextMenu data-testid="menu">
        <button ngpContextMenuItem data-testid="cut">Cut</button>
        <button ngpContextMenuItem data-testid="paste">Paste</button>
      </div>
    </ng-template>
  `,
  imports: [NgpContextMenuTrigger, NgpContextMenu, NgpContextMenuItem],
})
class ContextMenuComponent {}

@Component({
  template: `
    <button [ngpMenuTrigger]="menu" data-testid="trigger">File</button>

    <ng-template #menu>
      <div ngpMenu data-testid="menu">
        <button ngpMenuItem data-testid="rename">Open</button>
        <button (click)="clicked.push('new file')" ngpMenuItem data-testid="new-file">
          New file
        </button>
        <button (click)="clicked.push('new folder')" ngpMenuItem data-testid="new-folder">
          New folder
        </button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem],
})
class SpacedLabelsComponent {
  readonly clicked: string[] = [];
}

const byId = (id: string) => screen.getByTestId(id);
const present = (id: string) => !!screen.queryByTestId(id);
const pause = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function openMenu(): Promise<void> {
  byId('trigger').focus();
  await userEvent.keyboard('{Enter}');
  await waitFor(() => expect(document.activeElement).toBe(byId('rename')));
}

describe('Menu typeahead', () => {
  afterEach(() => {
    document.querySelectorAll('[ngpMenu], [ngpContextMenu]').forEach(el => el.remove());
  });

  it('moves focus to the next item that starts with the typed character', async () => {
    await render(MenuComponent);
    await openMenu();

    await userEvent.keyboard('d');

    expect(document.activeElement).toBe(byId('delete'));
    expect(byId('delete')).toHaveAttribute('data-focus-visible');
  });

  it('matches the characters typed in quick succession as one prefix', async () => {
    await render(MenuComponent);
    await openMenu();

    await userEvent.keyboard('du');

    expect(document.activeElement).toBe(byId('duplicate'));
  });

  it('cycles through the items that start with a repeated character', async () => {
    await render(MenuComponent);
    await openMenu();

    await userEvent.keyboard('dd');

    expect(document.activeElement).toBe(byId('duplicate'));
  });

  it('wraps around to the first items', async () => {
    await render(MenuComponent);
    await openMenu();
    await userEvent.keyboard('{End}');
    expect(document.activeElement).toBe(byId('share'));

    await userEvent.keyboard('r');

    expect(document.activeElement).toBe(byId('rename'));
  });

  it('ignores case', async () => {
    await render(MenuComponent);
    await openMenu();

    await userEvent.keyboard('A');

    expect(document.activeElement).toBe(byId('archive'));
  });

  it('skips disabled items', async () => {
    await render(MenuComponent, { inputs: { deleteDisabled: true } });
    await openMenu();

    await userEvent.keyboard('d');

    expect(document.activeElement).toBe(byId('duplicate'));
  });

  it('starts a new search after a pause', async () => {
    await render(MenuComponent);
    await openMenu();
    await userEvent.keyboard('d');
    await pause(600);

    await userEvent.keyboard('a');

    expect(document.activeElement).toBe(byId('archive'));
  });

  it('leaves focus where it is when nothing matches', async () => {
    await render(MenuComponent);
    await openMenu();

    await userEvent.keyboard('z');

    expect(document.activeElement).toBe(byId('rename'));
  });

  it('cancels the default action of a character it handles', async () => {
    await render(MenuComponent);
    await openMenu();

    // fireEvent returns false when a listener called preventDefault
    const notCancelled = fireEvent.keyDown(byId('rename'), { key: 'd' });

    expect(notCancelled).toBe(false);
  });

  it('lets Space activate the focused item once a search is over', async () => {
    await render(MenuComponent);
    await openMenu();
    await userEvent.keyboard('d');
    await pause(600);

    await userEvent.keyboard(' ');

    await waitFor(() => expect(present('menu')).toBe(false));
  });

  it.each(['ctrlKey', 'metaKey', 'altKey'])('leaves a character typed with %s alone', async key => {
    await render(MenuComponent);
    await openMenu();

    const notCancelled = fireEvent.keyDown(byId('rename'), { key: 'd', [key]: true });

    expect(notCancelled).toBe(true);
    expect(document.activeElement).toBe(byId('rename'));
  });

  it('continues a search with Space', async () => {
    const { fixture } = await render(SpacedLabelsComponent);
    await openMenu();

    await userEvent.keyboard('new fo');

    expect(document.activeElement).toBe(byId('new-folder'));
    expect(present('menu')).toBe(true);
    expect(fixture.componentInstance.clicked).toEqual([]);
  });

  it('leaves typing in a field inside an item alone', async () => {
    await render(MenuComponent);
    await openMenu();
    byId('name').focus();

    await userEvent.keyboard('ad');

    expect(document.activeElement).toBe(byId('name'));
    expect(byId('name')).toHaveValue('ad');
  });

  it('types a character entered with AltGr', async () => {
    await render(MenuComponent);
    await openMenu();

    fireEvent.keyDown(byId('rename'), {
      key: 'a',
      ctrlKey: true,
      altKey: true,
      modifierAltGraph: true,
    });

    expect(document.activeElement).toBe(byId('archive'));
  });

  it('leaves keys that type no character alone', async () => {
    await render(MenuComponent);
    await openMenu();

    const notCancelled = fireEvent.keyDown(byId('rename'), { key: 'Shift' });

    expect(notCancelled).toBe(true);
    expect(document.activeElement).toBe(byId('rename'));
  });

  it('focuses a submenu trigger without opening its submenu', async () => {
    await render(MenuComponent);
    await openMenu();

    await userEvent.keyboard('s');

    expect(document.activeElement).toBe(byId('share'));
    await pause(50);
    expect(present('submenu')).toBe(false);
  });

  it('works in a context menu', async () => {
    await render(ContextMenuComponent);
    byId('area').focus();
    await userEvent.keyboard('{ContextMenu}');
    await waitFor(() => expect(document.activeElement).toBe(byId('cut')));

    await userEvent.keyboard('p');

    expect(document.activeElement).toBe(byId('paste'));
  });
});
