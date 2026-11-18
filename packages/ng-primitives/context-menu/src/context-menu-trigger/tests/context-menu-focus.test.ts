import { Component, signal } from '@angular/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/angular';
import {
  NgpContextMenu,
  NgpContextMenuItem,
  NgpContextMenuTrigger,
} from 'ng-primitives/context-menu';
import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

@Component({
  template: `
    <button data-testid="elsewhere">Elsewhere</button>
    <div [ngpContextMenuTrigger]="menu" tabindex="0" data-testid="area">Right-click me</div>
    <div [ngpContextMenuTrigger]="menu" tabindex="0" data-testid="other-area">Other area</div>
    <div [ngpContextMenuTrigger]="menu" data-testid="plain-area">Not focusable</div>
    <div [ngpContextMenuTrigger]="menu" data-testid="toolbar">
      <button data-testid="bold">Bold</button>
    </div>

    <ng-template #menu>
      <div [ngpContextMenuFinalFocus]="finalFocus()" ngpContextMenu data-testid="menu">
        <button ngpContextMenuItem data-testid="cut">Cut</button>
        <button ngpContextMenuItem data-testid="copy">Copy</button>
      </div>
    </ng-template>
  `,
  imports: [NgpContextMenuTrigger, NgpContextMenu, NgpContextMenuItem],
})
class ContextMenuComponent {
  readonly finalFocus = signal<false | null>(null);
}

const byId = (id: string) => screen.getByTestId(id);
const present = (id: string) => !!screen.queryByTestId(id);

async function openWithKeyboard(): Promise<void> {
  byId('area').focus();
  await userEvent.keyboard('{ContextMenu}');
  await waitFor(() => expect(present('menu')).toBe(true));
  await waitFor(() => expect(document.activeElement).toBe(byId('cut')));
}

async function openWithMouse(id: string): Promise<void> {
  await userEvent.click(byId(id), { button: 'right' });
  await waitFor(() => expect(present('menu')).toBe(true));
}

describe('NgpContextMenu focus', () => {
  afterEach(async () => {
    document.querySelectorAll('[ngpContextMenu]').forEach(el => el.remove());

    // the real pointer stays where a test left it, across files: park it away from fixtures
    const corner = document.body.appendChild(document.createElement('div'));
    corner.style.cssText = 'position: fixed; right: 0; bottom: 0; width: 4px; height: 4px;';
    await userEvent.hover(corner);
    corner.remove();
  });

  it('shows the focus ring on the first item when opened with the keyboard', async () => {
    await render(ContextMenuComponent);

    await openWithKeyboard();

    expect(byId('cut')).toHaveAttribute('data-focus-visible');
  });

  it('shows no focus ring when opened with a right-click', async () => {
    await render(ContextMenuComponent);

    await openWithMouse('area');

    await waitFor(() => expect(byId('menu').contains(document.activeElement)).toBe(true));
    expect(document.activeElement).not.toHaveAttribute('data-focus-visible');
  });

  it('returns focus to the area on Escape', async () => {
    await render(ContextMenuComponent);
    await openWithKeyboard();

    await userEvent.keyboard('{Escape}');

    await waitFor(() => expect(present('menu')).toBe(false));
    expect(document.activeElement).toBe(byId('area'));
  });

  it('returns focus to the area when an item is selected with the keyboard', async () => {
    await render(ContextMenuComponent);
    await openWithKeyboard();

    await userEvent.keyboard('{ArrowDown}{Enter}');

    await waitFor(() => expect(present('menu')).toBe(false));
    expect(document.activeElement).toBe(byId('area'));
  });

  it('returns focus to the focusable area it was right-clicked on', async () => {
    await render(ContextMenuComponent);
    await openWithMouse('area');

    await userEvent.click(byId('copy'));

    await waitFor(() => expect(present('menu')).toBe(false));
    expect(document.activeElement).toBe(byId('area'));
  });

  it('leaves focus on the control an outside click lands on', async () => {
    await render(ContextMenuComponent);
    await openWithKeyboard();

    await userEvent.click(byId('elsewhere'));

    await waitFor(() => expect(present('menu')).toBe(false));
    expect(document.activeElement).toBe(byId('elsewhere'));
  });

  it('moves no focus after a mouse close when nothing was focused before', async () => {
    await render(ContextMenuComponent);
    await openWithMouse('plain-area');

    await userEvent.click(byId('copy'));

    await waitFor(() => expect(present('menu')).toBe(false));
    expect(document.activeElement).toBe(document.body);
  });

  it('returns focus to the area a second right-click opened it from', async () => {
    await render(ContextMenuComponent);
    await openWithMouse('area');

    await userEvent.click(byId('other-area'), { button: 'right' });
    await waitFor(() => expect(byId('menu').contains(document.activeElement)).toBe(true));
    await userEvent.keyboard('{Escape}');

    await waitFor(() => expect(present('menu')).toBe(false));
    expect(document.activeElement).toBe(byId('other-area'));
  });

  it('returns no focus to the first area after a right-click on one that cannot take focus', async () => {
    await render(ContextMenuComponent);
    await openWithMouse('area');

    await userEvent.click(byId('plain-area'), { button: 'right' });
    await waitFor(() => expect(byId('menu').contains(document.activeElement)).toBe(true));
    await userEvent.click(byId('copy'));

    await waitFor(() => expect(present('menu')).toBe(false));
    expect(document.activeElement).toBe(document.body);
  });

  it('returns focus to the control inside the area that was right-clicked', async () => {
    await render(ContextMenuComponent);
    await openWithMouse('bold');

    await userEvent.click(byId('copy'));

    await waitFor(() => expect(present('menu')).toBe(false));
    expect(document.activeElement).toBe(byId('bold'));
  });

  it('returns focus to the area a long press opened it from', async () => {
    await render(ContextMenuComponent);
    byId('elsewhere').focus();
    fireEvent.pointerDown(byId('area'), { pointerType: 'touch', clientX: 10, clientY: 10 });
    await waitFor(() => expect(present('menu')).toBe(true), { timeout: 2000 });
    fireEvent.pointerUp(byId('area'), { pointerType: 'touch' });

    await userEvent.keyboard('{Escape}');

    await waitFor(() => expect(present('menu')).toBe(false));
    expect(document.activeElement).toBe(byId('area'));
  });

  it('leaves focus alone when ngpContextMenuFinalFocus is false', async () => {
    const { fixture } = await render(ContextMenuComponent);
    fixture.componentInstance.finalFocus.set(false);
    fixture.detectChanges();
    await openWithKeyboard();

    await userEvent.keyboard('{Escape}');

    await waitFor(() => expect(present('menu')).toBe(false));
    expect(document.activeElement).toBe(document.body);
  });
});
