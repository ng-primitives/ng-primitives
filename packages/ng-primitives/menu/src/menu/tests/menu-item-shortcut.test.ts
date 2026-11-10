import { Component, Directive, signal } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import {
  NgpContextMenu,
  NgpContextMenuItem,
  NgpContextMenuItemCheckbox,
  NgpContextMenuItemRadio,
  NgpContextMenuItemRadioGroup,
  NgpContextMenuSubmenuTrigger,
  NgpContextMenuTrigger,
} from 'ng-primitives/context-menu';
import {
  NgpMenu,
  NgpMenuItem,
  NgpMenuItemCheckbox,
  NgpMenuItemRadio,
  NgpMenuItemRadioGroup,
  NgpMenuItemShortcut,
  NgpMenuTrigger,
  NgpSubmenuTrigger,
  ngpMenuItemShortcut,
  provideMenuItemShortcutState,
} from 'ng-primitives/menu';
import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

@Component({
  template: `
    <button [ngpMenuTrigger]="menu" data-testid="trigger">Edit</button>

    <ng-template #menu>
      <div ngpMenu data-testid="menu">
        <button ngpMenuItem data-testid="duplicate">
          Duplicate
          @if (showShortcut()) {
            <span
              [ngpMenuItemShortcutKeys]="keys()"
              ngpMenuItemShortcut
              data-testid="duplicate-keys"
            >
              ⌘D
            </span>
          }
        </button>
        <button ngpMenuItem aria-describedby="archive-hint" data-testid="archive">
          Archive
          <span id="archive-keys" ngpMenuItemShortcut>⌘E</span>
        </button>
        <span id="archive-hint">Moves it out of the list</span>
        <button ngpMenuItem aria-keyshortcuts="Meta+S" data-testid="save">
          Save
          <span [ngpMenuItemShortcutKeys]="saveKeys()" ngpMenuItemShortcut>⌘S</span>
        </button>
        <button ngpMenuItem aria-keyshortcuts="Meta+P" data-testid="print">
          Print
          <span ngpMenuItemShortcut>⌘P</span>
        </button>
        <button
          [attr.aria-describedby]="hint()"
          [attr.aria-keyshortcuts]="hintKeys()"
          ngpMenuItem
          data-testid="delete"
        >
          Delete
        </button>
        <span id="delete-hint">Cannot be undone</span>
        <span id="delete-hint-2">Moves it to the bin</span>
        <button [attr.aria-describedby]="hint()" ngpMenuItem data-testid="rename">
          Rename
          <span id="rename-keys" ngpMenuItemShortcut>⌘R</span>
        </button>
        <button ngpMenuItem data-testid="copy">
          Copy
          @if (showFirstCopyShortcut()) {
            <span ngpMenuItemShortcut ngpMenuItemShortcutKeys="Meta+C">⌘C</span>
          }
          <span ngpMenuItemShortcut ngpMenuItemShortcutKeys="Meta+C">⌘C</span>
        </button>
        <button ngpMenuItem data-testid="find">
          Find
          @if (showFirstFindShortcut()) {
            <span ngpMenuItemShortcut ngpMenuItemShortcutKeys="Control+F">Ctrl+F</span>
          }
          <span ngpMenuItemShortcut ngpMenuItemShortcutKeys="F3">F3</span>
        </button>
        <button ngpMenuItemCheckbox data-testid="wrap">
          Wrap lines
          <span ngpMenuItemShortcut ngpMenuItemShortcutKeys="Alt+Z">⌥Z</span>
        </button>
        <div ngpMenuItemRadioGroup>
          <button ngpMenuItemRadio ngpMenuItemRadioValue="list" data-testid="list">
            List
            <span ngpMenuItemShortcut>⌘1</span>
          </button>
        </div>
        <button [ngpSubmenuTrigger]="submenu" ngpMenuItem data-testid="share">Share</button>
      </div>
    </ng-template>

    <ng-template #submenu>
      <div ngpMenu data-testid="submenu">
        <button ngpMenuItemCheckbox data-testid="notify">
          Notify me
          <span [ngpMenuItemShortcutKeys]="notifyKeys()" ngpMenuItemShortcut>⌘N</span>
        </button>
        <button ngpMenuItemCheckbox data-testid="mute">Mute</button>
        <button ngpMenuItem data-testid="email">
          Email
          <span [ngpMenuItemShortcutKeys]="emailKeys()" ngpMenuItemShortcut>⌘M</span>
        </button>
        <button ngpMenuItem data-testid="link">
          Copy link
          <span ngpMenuItemShortcut>⌘L</span>
        </button>
      </div>
    </ng-template>
  `,
  imports: [
    NgpMenuTrigger,
    NgpMenu,
    NgpMenuItem,
    NgpMenuItemCheckbox,
    NgpMenuItemRadioGroup,
    NgpMenuItemRadio,
    NgpMenuItemShortcut,
    NgpSubmenuTrigger,
  ],
})
class MenuComponent {
  readonly showShortcut = signal(true);
  readonly keys = signal<string | undefined>('Meta+D');
  readonly emailKeys = signal<string | undefined>(undefined);
  readonly saveKeys = signal<string | undefined>('Meta+S');
  readonly showFirstFindShortcut = signal(true);
  readonly showFirstCopyShortcut = signal(true);
  readonly hint = signal<string | null>('delete-hint');
  readonly hintKeys = signal<string | null>('Meta+Backspace');
  readonly notifyKeys = signal<string | undefined>(undefined);
}

@Component({
  template: `
    <div [ngpContextMenuTrigger]="menu" data-testid="area">Right-click me</div>

    <ng-template #menu>
      <div ngpContextMenu data-testid="menu">
        <button ngpContextMenuItem data-testid="copy">
          Copy
          <span ngpMenuItemShortcut ngpMenuItemShortcutKeys="Control+C">Ctrl+C</span>
        </button>
        <button ngpContextMenuItemCheckbox data-testid="ruler">
          Show ruler
          <span ngpMenuItemShortcut>⌘R</span>
        </button>
        <div ngpContextMenuItemRadioGroup>
          <button ngpContextMenuItemRadio ngpContextMenuItemRadioValue="fit" data-testid="fit">
            Fit
            <span ngpMenuItemShortcut>⌘0</span>
          </button>
        </div>
        <button [ngpContextMenuSubmenuTrigger]="submenu" ngpContextMenuItem data-testid="share">
          Share
        </button>
      </div>
    </ng-template>

    <ng-template #submenu>
      <div ngpContextMenu data-testid="submenu">
        <button ngpContextMenuItem data-testid="email">
          Email
          <span [ngpMenuItemShortcutKeys]="emailKeys()" ngpMenuItemShortcut>⌘M</span>
        </button>
        <button ngpContextMenuItem data-testid="link">Copy link</button>
      </div>
    </ng-template>
  `,
  imports: [
    NgpContextMenuTrigger,
    NgpContextMenu,
    NgpContextMenuItem,
    NgpContextMenuItemCheckbox,
    NgpContextMenuItemRadioGroup,
    NgpContextMenuItemRadio,
    NgpContextMenuSubmenuTrigger,
    NgpMenuItemShortcut,
  ],
})
class ContextMenuComponent {
  readonly emailKeys = signal<string | undefined>(undefined);
}

/** A shortcut built on the state alone, without an id. */
@Directive({ selector: '[appShortcut]', providers: [provideMenuItemShortcutState()] })
class Shortcut {
  constructor() {
    ngpMenuItemShortcut({});
  }
}

@Component({
  template: `
    <button [ngpMenuTrigger]="menu" data-testid="trigger">Edit</button>
    <ng-template #menu>
      <div ngpMenu data-testid="menu">
        <button ngpMenuItem data-testid="undo">
          Undo
          <span appShortcut>⌘Z</span>
        </button>
        <button ngpMenuItem data-testid="redo">
          Redo
          <span appShortcut>⇧⌘Z</span>
          <span id="redo-keys" ngpMenuItemShortcut>⇧⌘Z</span>
        </button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem, NgpMenuItemShortcut, Shortcut],
})
class StateShortcutComponent {}

const byId = (id: string) => screen.getByTestId(id);
const present = (id: string) => !!screen.queryByTestId(id);

async function openMenu(): Promise<void> {
  await userEvent.click(byId('trigger'));
  await waitFor(() => expect(present('menu')).toBe(true));
}

describe('NgpMenuItemShortcut', () => {
  afterEach(async () => {
    document.querySelectorAll('[ngpMenu], [ngpContextMenu]').forEach(el => el.remove());

    // the real pointer stays where a test left it, across files: park it away from fixtures
    const corner = document.body.appendChild(document.createElement('div'));
    corner.style.cssText = 'position: fixed; right: 0; bottom: 0; width: 4px; height: 4px;';
    await userEvent.hover(corner);
    corner.remove();
  });

  it('describes nothing without an id', async () => {
    await render(StateShortcutComponent);
    await openMenu();

    await new Promise(resolve => setTimeout(resolve, 50));
    expect(byId('undo')).not.toHaveAttribute('aria-describedby');
    expect(byId('redo')).toHaveAttribute('aria-describedby', 'redo-keys');
  });

  it('describes its item and leaves the item named by its label', async () => {
    await render(MenuComponent);
    await openMenu();

    await waitFor(() => expect(byId('duplicate')).toHaveAccessibleDescription('⌘D'));
    expect(byId('duplicate')).toHaveAccessibleName('Duplicate');
    expect(byId('duplicate-keys')).toHaveAttribute('aria-hidden', 'true');
  });

  it('sets the keys on the item as aria-keyshortcuts', async () => {
    await render(MenuComponent);
    await openMenu();

    await waitFor(() => expect(byId('duplicate')).toHaveAttribute('aria-keyshortcuts', 'Meta+D'));
    expect(byId('archive')).not.toHaveAttribute('aria-keyshortcuts');
  });

  it('follows a change of keys and drops them with the shortcut', async () => {
    const { fixture } = await render(MenuComponent);
    await openMenu();

    fixture.componentInstance.keys.set('Control+D');
    await waitFor(() =>
      expect(byId('duplicate')).toHaveAttribute('aria-keyshortcuts', 'Control+D'),
    );

    fixture.componentInstance.keys.set(undefined);
    await waitFor(() => expect(byId('duplicate')).not.toHaveAttribute('aria-keyshortcuts'));

    fixture.componentInstance.keys.set('Meta+D');
    await waitFor(() => expect(byId('duplicate')).toHaveAttribute('aria-keyshortcuts', 'Meta+D'));
    fixture.componentInstance.showShortcut.set(false);
    await waitFor(() => expect(byId('duplicate')).not.toHaveAttribute('aria-describedby'));
    expect(byId('duplicate')).not.toHaveAttribute('aria-keyshortcuts');
  });

  it('drops each of the alternative keys a shortcut no longer has', async () => {
    const { fixture } = await render(MenuComponent);
    await openMenu();

    fixture.componentInstance.keys.set('Control+D Meta+D');
    await waitFor(() =>
      expect(byId('duplicate')).toHaveAttribute('aria-keyshortcuts', 'Control+D Meta+D'),
    );

    fixture.componentInstance.keys.set('Meta+D');
    await waitFor(() => expect(byId('duplicate')).toHaveAttribute('aria-keyshortcuts', 'Meta+D'));
  });

  it('keeps keys set on the item when a shortcut with the same keys changes', async () => {
    const { fixture } = await render(MenuComponent);
    await openMenu();
    await waitFor(() => expect(byId('save')).toHaveAccessibleDescription('⌘S'));
    expect(byId('save')).toHaveAttribute('aria-keyshortcuts', 'Meta+S');

    fixture.componentInstance.saveKeys.set('Control+S');

    await waitFor(() =>
      expect(byId('save').getAttribute('aria-keyshortcuts')?.split(' ').sort()).toEqual([
        'Control+S',
        'Meta+S',
      ]),
    );
  });

  it('keeps an aria-keyshortcuts set on the item', async () => {
    await render(MenuComponent);
    await openMenu();

    await waitFor(() => expect(byId('print')).toHaveAccessibleDescription('⌘P'));
    expect(byId('print')).toHaveAttribute('aria-keyshortcuts', 'Meta+P');
  });

  it('keeps the keys of the shortcut that remains when another one goes', async () => {
    const { fixture } = await render(MenuComponent);
    await openMenu();
    await waitFor(() =>
      expect(byId('find').getAttribute('aria-keyshortcuts')?.split(' ').sort()).toEqual([
        'Control+F',
        'F3',
      ]),
    );

    fixture.componentInstance.showFirstFindShortcut.set(false);

    await waitFor(() => expect(byId('find')).toHaveAccessibleDescription('F3'));
    expect(byId('find')).toHaveAttribute('aria-keyshortcuts', 'F3');
  });

  it('leaves the aria attributes a consumer binds on an item without a shortcut', async () => {
    const { fixture } = await render(MenuComponent);
    await openMenu();

    await waitFor(() => expect(byId('delete')).toHaveAttribute('aria-describedby', 'delete-hint'));
    expect(byId('delete')).toHaveAttribute('aria-keyshortcuts', 'Meta+Backspace');

    fixture.componentInstance.hint.set('delete-hint-2');
    fixture.componentInstance.hintKeys.set(null);

    await waitFor(() =>
      expect(byId('delete')).toHaveAttribute('aria-describedby', 'delete-hint-2'),
    );
    expect(byId('delete')).not.toHaveAttribute('aria-keyshortcuts');
  });

  it('adds the shortcut to an aria-describedby the consumer binds', async () => {
    await render(MenuComponent);
    await openMenu();

    await waitFor(() =>
      expect(byId('rename').getAttribute('aria-describedby')?.split(' ').sort()).toEqual([
        'delete-hint',
        'rename-keys',
      ]),
    );
  });

  it('keeps the shortcut when the aria-describedby the consumer binds changes', async () => {
    const { fixture } = await render(MenuComponent);
    await openMenu();
    const describedBy = () => byId('rename').getAttribute('aria-describedby')?.split(' ').sort();
    await waitFor(() => expect(describedBy()).toEqual(['delete-hint', 'rename-keys']));

    fixture.componentInstance.hint.set('delete-hint-2');
    await waitFor(() => expect(describedBy()).toEqual(['delete-hint-2', 'rename-keys']));

    fixture.componentInstance.hint.set(null);
    await waitFor(() => expect(describedBy()).toEqual(['rename-keys']));
  });

  it('lists keys two shortcuts share once and keeps them when one goes', async () => {
    const { fixture } = await render(MenuComponent);
    await openMenu();
    await waitFor(() => expect(byId('copy')).toHaveAttribute('aria-keyshortcuts', 'Meta+C'));

    fixture.componentInstance.showFirstCopyShortcut.set(false);

    await waitFor(() => expect(byId('copy')).toHaveAccessibleDescription('⌘C'));
    expect(byId('copy')).toHaveAttribute('aria-keyshortcuts', 'Meta+C');
  });

  it('keeps an aria-describedby set on the item', async () => {
    await render(MenuComponent);
    await openMenu();

    await waitFor(() =>
      expect(byId('archive')).toHaveAttribute('aria-describedby', 'archive-hint archive-keys'),
    );
  });

  it('works in checkbox and radio items', async () => {
    await render(MenuComponent);
    await openMenu();

    await waitFor(() => expect(byId('wrap')).toHaveAccessibleDescription('⌥Z'));
    expect(byId('wrap')).toHaveAttribute('aria-keyshortcuts', 'Alt+Z');
    expect(byId('list')).toHaveAccessibleDescription('⌘1');
  });

  it('describes its own item in a submenu', async () => {
    await render(MenuComponent);
    await openMenu();
    await userEvent.hover(byId('share'));
    await waitFor(() => expect(present('submenu')).toBe(true));

    await waitFor(() => expect(byId('email')).toHaveAccessibleDescription('⌘M'));
    expect(byId('link')).toHaveAccessibleDescription('⌘L');
    expect(byId('share')).not.toHaveAttribute('aria-describedby');
  });

  it('sets the keys of a submenu item on that item', async () => {
    const { fixture } = await render(MenuComponent);
    await openMenu();
    await userEvent.hover(byId('share'));
    await waitFor(() => expect(present('submenu')).toBe(true));

    fixture.componentInstance.emailKeys.set('Meta+M');

    await waitFor(() => expect(byId('email')).toHaveAttribute('aria-keyshortcuts', 'Meta+M'));
    expect(byId('link')).not.toHaveAttribute('aria-keyshortcuts');
    expect(byId('share')).not.toHaveAttribute('aria-keyshortcuts');
  });

  it('sets the keys of a submenu checkbox item on that item', async () => {
    const { fixture } = await render(MenuComponent);
    await openMenu();
    await userEvent.hover(byId('share'));
    await waitFor(() => expect(present('submenu')).toBe(true));

    fixture.componentInstance.notifyKeys.set('Meta+N');

    await waitFor(() => expect(byId('notify')).toHaveAttribute('aria-keyshortcuts', 'Meta+N'));
    expect(byId('mute')).not.toHaveAttribute('aria-keyshortcuts');
    expect(byId('email')).not.toHaveAttribute('aria-keyshortcuts');
  });

  it('works in a context menu item', async () => {
    await render(ContextMenuComponent);
    await userEvent.click(byId('area'), { button: 'right' });
    await waitFor(() => expect(present('menu')).toBe(true));

    await waitFor(() => expect(byId('copy')).toHaveAccessibleDescription('Ctrl+C'));
    expect(byId('copy')).toHaveAttribute('aria-keyshortcuts', 'Control+C');
    expect(byId('ruler')).toHaveAccessibleDescription('⌘R');
    expect(byId('fit')).toHaveAccessibleDescription('⌘0');
  });

  it('sets the keys of a context submenu item on that item', async () => {
    const { fixture } = await render(ContextMenuComponent);
    await userEvent.click(byId('area'), { button: 'right' });
    await waitFor(() => expect(present('menu')).toBe(true));
    await userEvent.hover(byId('share'));
    await waitFor(() => expect(present('submenu')).toBe(true));

    fixture.componentInstance.emailKeys.set('Meta+M');

    await waitFor(() => expect(byId('email')).toHaveAttribute('aria-keyshortcuts', 'Meta+M'));
    expect(byId('link')).not.toHaveAttribute('aria-keyshortcuts');
  });
});
