import { Component } from '@angular/core';
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
        <button ngpMenuItem data-testid="duplicate">Duplicate</button>
        <button ngpMenuItem ngpMenuItemDisabled data-testid="delete">Delete</button>
        <button ngpMenuItem data-testid="archive">Archive</button>
        <div ngpMenuItem ngpMenuItemDisabled data-testid="locked">Locked</div>
        <input aria-label="Filter" data-testid="filter" />
        <textarea aria-label="Note" data-testid="note"></textarea>
        <div contenteditable="true" aria-label="Comment" data-testid="comment"></div>
        <input type="checkbox" aria-label="Pin" data-testid="pin" />
        <button [ngpSubmenuTrigger]="submenu" ngpMenuItem data-testid="share">Share</button>
      </div>
    </ng-template>

    <ng-template #submenu>
      <div ngpMenu data-testid="submenu">
        <button ngpMenuItem data-testid="email">Email</button>
        <button ngpMenuItem data-testid="link">Copy link</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem, NgpSubmenuTrigger],
})
class MenuComponent {}

@Component({
  template: `
    <div [ngpContextMenuTrigger]="menu" data-testid="area">Right-click me</div>

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
    <button [ngpMenuTrigger]="menu" data-testid="trigger">Actions</button>

    <ng-template #menu>
      <div ngpMenu data-testid="menu" style="display: flex; flex-direction: column">
        <button
          [ngpSubmenuTrigger]="submenu"
          [ngpSubmenuTriggerOffset]="60"
          ngpMenuItem
          data-testid="share"
          style="width: 100px; height: 32px; padding: 0; margin: 0"
        >
          Share
        </button>
        <button ngpMenuItem data-testid="archive" style="width: 100px; height: 32px">
          Archive
        </button>
      </div>
    </ng-template>

    <ng-template #submenu>
      <div ngpMenu data-testid="submenu" style="width: 140px; height: 80px">
        <button ngpMenuItem data-testid="email">Email</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem, NgpSubmenuTrigger],
})
class SubmenuCorridorComponent {}

const byId = (id: string) => screen.getByTestId(id);
const present = (id: string) => !!screen.queryByTestId(id);

async function openWithClick(): Promise<void> {
  await userEvent.click(byId('trigger'));
  await waitFor(() => expect(document.activeElement).toBe(byId('rename')));
}

describe('NgpMenuItem hover', () => {
  afterEach(async () => {
    document.querySelectorAll('[ngpMenu], [ngpContextMenu]').forEach(el => el.remove());

    // the real pointer stays where a test left it, across files: park it away from fixtures
    const corner = document.body.appendChild(document.createElement('div'));
    corner.style.cssText = 'position: fixed; right: 0; bottom: 0; width: 4px; height: 4px;';
    await userEvent.hover(corner);
    corner.remove();
  });

  it('focuses the hovered item without a focus ring', async () => {
    await render(MenuComponent);
    await openWithClick();

    await userEvent.hover(byId('duplicate'));

    expect(document.activeElement).toBe(byId('duplicate'));
    expect(byId('duplicate')).not.toHaveAttribute('data-focus-visible');
  });

  it('moves the arrow keys on from the hovered item', async () => {
    await render(MenuComponent);
    await openWithClick();
    await userEvent.hover(byId('duplicate'));

    await userEvent.keyboard('{ArrowDown}');

    expect(document.activeElement).toBe(byId('archive'));
  });

  it('follows the mouse again after the keyboard was used', async () => {
    await render(MenuComponent);
    byId('trigger').focus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(document.activeElement).toBe(byId('rename')));

    await userEvent.hover(byId('duplicate'));

    expect(document.activeElement).toBe(byId('duplicate'));
  });

  it('does not focus an item under a pointer that has not moved', async () => {
    await render(MenuComponent);
    byId('trigger').focus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(document.activeElement).toBe(byId('rename')));

    // the menu scrolls or opens under a resting pointer
    fireEvent.pointerMove(byId('duplicate'), { pointerType: 'mouse', movementX: 0, movementY: 0 });

    expect(document.activeElement).toBe(byId('rename'));
  });

  it.each(['filter', 'note', 'comment'])(
    'leaves focus in the text field %s of the menu',
    async id => {
      await render(MenuComponent);
      await openWithClick();
      byId(id).focus();

      await userEvent.hover(byId('duplicate'));

      expect(document.activeElement).toBe(byId(id));
    },
  );

  it('takes focus from a control of the menu that is not a text field', async () => {
    await render(MenuComponent);
    await openWithClick();
    byId('pin').focus();

    await userEvent.hover(byId('duplicate'));

    expect(document.activeElement).toBe(byId('duplicate'));
  });

  it('leaves focus in a submenu while the pointer crosses a sibling toward it', async () => {
    await render(SubmenuCorridorComponent);
    await userEvent.click(byId('trigger'));
    await waitFor(() => expect(present('menu')).toBe(true));
    await userEvent.hover(byId('share'));
    await waitFor(() => expect(present('submenu')).toBe(true));
    byId('email').focus();

    const rect = byId('archive').getBoundingClientRect();
    const ontoArchive = {
      clientX: rect.left + 50,
      clientY: rect.top + 16,
      pointerType: 'mouse',
      movementX: 4,
      movementY: 4,
    };
    fireEvent.pointerLeave(byId('share'), ontoArchive);
    fireEvent.pointerMove(byId('archive'), ontoArchive);

    expect(document.activeElement).toBe(byId('email'));
  });

  it('does not focus a disabled item', async () => {
    await render(MenuComponent);
    await openWithClick();

    await userEvent.hover(byId('delete'));
    await userEvent.hover(byId('locked'));

    expect(document.activeElement).toBe(byId('rename'));
  });

  it('does not focus an item a touch passes over', async () => {
    await render(MenuComponent);
    await openWithClick();

    fireEvent.pointerMove(byId('duplicate'), { pointerType: 'touch', movementX: 4, movementY: 4 });

    expect(document.activeElement).toBe(byId('rename'));
  });

  it('keeps focus in an open submenu when the pointer goes back over its trigger', async () => {
    await render(MenuComponent);
    await openWithClick();
    await userEvent.hover(byId('share'));
    await waitFor(() => expect(present('submenu')).toBe(true));
    await userEvent.hover(byId('link'));
    expect(document.activeElement).toBe(byId('link'));

    await userEvent.hover(byId('share'));

    expect(document.activeElement).toBe(byId('link'));
  });

  it('focuses the hovered item of a context menu', async () => {
    await render(ContextMenuComponent);
    await userEvent.click(byId('area'), { button: 'right' });
    await waitFor(() => expect(present('menu')).toBe(true));

    await userEvent.hover(byId('paste'));

    expect(document.activeElement).toBe(byId('paste'));
  });
});
