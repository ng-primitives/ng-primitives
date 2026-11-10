import { Component, CUSTOM_ELEMENTS_SCHEMA, input } from '@angular/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/angular';
import { NgpMenu, NgpMenuItem, NgpMenuTrigger } from 'ng-primitives/menu';
import { NgpPlacement } from 'ng-primitives/portal';
import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

@Component({
  template: `
    <button
      [ngpMenuTrigger]="menu"
      [ngpMenuTriggerPlacement]="placement()"
      [ngpMenuTriggerOpenTriggers]="['click', 'arrowkey']"
      data-testid="trigger"
    >
      Actions
    </button>

    <ng-template #menu>
      <div ngpMenu data-testid="menu">
        <button ngpMenuItem data-testid="rename">Rename</button>
        <button ngpMenuItem data-testid="duplicate">Duplicate</button>
        <button [ngpMenuItemDisabled]="lastDisabled()" ngpMenuItem data-testid="archive">
          Archive
        </button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem],
})
class MenuComponent {
  readonly placement = input<NgpPlacement>('bottom-start');
  readonly lastDisabled = input(false);
}

@Component({
  template: `
    <button
      [ngpMenuTrigger]="menu"
      [ngpMenuTriggerOpenTriggers]="['arrowkey']"
      ngpMenuTriggerScrollBehavior="reposition"
      data-testid="trigger"
    >
      Actions
    </button>
    <div style="height: 4000px"></div>

    <ng-template #menu>
      <div ngpMenu style="position: absolute" data-testid="menu">
        <button ngpMenuItem data-testid="rename">Rename</button>
        <button ngpMenuItem data-testid="archive">Archive</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem],
})
class TallPageComponent {}

@Component({
  template: `
    <button
      [ngpMenuTrigger]="menu"
      [ngpMenuTriggerOpenTriggers]="['arrowkey']"
      data-testid="trigger"
    >
      Actions
    </button>

    <ng-template #menu>
      <div ngpMenu data-testid="menu">
        <!-- eslint-disable-next-line @angular-eslint/template/no-autofocus -->
        <input aria-label="Filter" autofocus data-testid="filter" />
        <button ngpMenuItem data-testid="rename">Rename</button>
        <button ngpMenuItem data-testid="archive">Archive</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem],
})
class AutofocusComponent {}

@Component({
  template: `
    <button
      [ngpMenuTrigger]="menu"
      [ngpMenuTriggerOpenTriggers]="['arrowkey']"
      data-testid="trigger"
    >
      Actions
    </button>

    <ng-template #menu>
      <div ngpMenu data-testid="menu">
        <button ngpMenuItem data-testid="rename">Rename</button>
        <button style="display: none" ngpMenuItem data-testid="archive">Archive</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem],
})
class HiddenLastItemComponent {}

@Component({
  template: `
    <button
      [ngpMenuTrigger]="menu"
      [ngpMenuTriggerOpenTriggers]="['arrowkey']"
      data-testid="trigger"
    >
      Actions
    </button>

    <ng-template #menu>
      <div ngpMenu data-testid="menu">
        <button ngpMenuItem ngpMenuItemDisabled data-testid="rename">Rename</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem],
})
class NoEnabledItemComponent {}

/** A menu item that hands focus to a button in its shadow root. */
class TestDelegatingMenuItemElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open', delegatesFocus: true }).innerHTML =
      '<button type="button">Archive</button>';
  }
}

if (!customElements.get('test-delegating-menu-item')) {
  customElements.define('test-delegating-menu-item', TestDelegatingMenuItemElement);
}

@Component({
  template: `
    <button
      [ngpMenuTrigger]="menu"
      [ngpMenuTriggerOpenTriggers]="['arrowkey']"
      data-testid="trigger"
    >
      Actions
    </button>

    <ng-template #menu>
      <div ngpMenu data-testid="menu">
        <button ngpMenuItem data-testid="rename">Rename</button>
        <test-delegating-menu-item ngpMenuItem data-testid="archive" />
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
class DelegatingLastItemComponent {}

const byId = (id: string) => screen.getByTestId(id);
const present = (id: string) => !!screen.queryByTestId(id);

async function press(key: string): Promise<void> {
  byId('trigger').focus();
  await userEvent.keyboard(`{${key}}`);
}

describe('NgpMenuTrigger arrow keys', () => {
  afterEach(() => {
    document.querySelectorAll('[ngpMenu]').forEach(el => el.remove());
  });

  it('opens a menu below the trigger on its last item on Up Arrow', async () => {
    await render(MenuComponent);

    await press('ArrowUp');

    await waitFor(() => expect(document.activeElement).toBe(byId('archive')));
    expect(byId('archive')).toHaveAttribute('data-focus-visible');
  });

  it('opens a menu below the trigger on its first item on Down Arrow', async () => {
    await render(MenuComponent);

    await press('ArrowDown');

    await waitFor(() => expect(document.activeElement).toBe(byId('rename')));
    expect(byId('rename')).toHaveAttribute('data-focus-visible');
  });

  it('opens a menu above the trigger on its first item on Down Arrow', async () => {
    await render(MenuComponent, { inputs: { placement: 'top-start' } });

    await press('ArrowDown');

    await waitFor(() => expect(document.activeElement).toBe(byId('rename')));
  });

  it('opens a menu above the trigger on its last item on Up Arrow', async () => {
    await render(MenuComponent, { inputs: { placement: 'top-start' } });

    await press('ArrowUp');

    await waitFor(() => expect(document.activeElement).toBe(byId('archive')));
  });

  it('keeps the arrow that opens the menu from scrolling the page', async () => {
    await render(MenuComponent);

    // fireEvent returns false when a listener called preventDefault
    const notCancelled = fireEvent.keyDown(byId('trigger'), { key: 'ArrowUp' });

    expect(notCancelled).toBe(false);
    await waitFor(() => expect(present('menu')).toBe(true));
  });

  it('skips a disabled last item', async () => {
    await render(MenuComponent, { inputs: { lastDisabled: true } });

    await press('ArrowUp');

    await waitFor(() => expect(document.activeElement).toBe(byId('duplicate')));
  });

  it('keeps Up and Down closed for a menu to the side', async () => {
    await render(MenuComponent, { inputs: { placement: 'right-start' } });

    await press('ArrowUp');
    await press('ArrowDown');

    await new Promise(resolve => setTimeout(resolve, 50));
    expect(present('menu')).toBe(false);
  });

  it('opens on the first item again after a menu opened on its last', async () => {
    await render(MenuComponent);
    await press('ArrowUp');
    await waitFor(() => expect(document.activeElement).toBe(byId('archive')));
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(present('menu')).toBe(false));

    await press('Enter');

    await waitFor(() => expect(document.activeElement).toBe(byId('rename')));
  });

  it('moves focus straight to the last item', async () => {
    await render(MenuComponent);
    const focused: string[] = [];
    const record = (event: FocusEvent) =>
      focused.push((event.target as HTMLElement).dataset['testid'] ?? '');
    document.addEventListener('focusin', record);

    try {
      await press('ArrowUp');
      await waitFor(() => expect(document.activeElement).toBe(byId('archive')));
    } finally {
      document.removeEventListener('focusin', record);
    }

    expect(focused).toEqual(['trigger', 'archive']);
  });

  it('does not scroll the page to reach the last item', async () => {
    await render(TallPageComponent);
    window.scrollTo(0, 0);

    await press('ArrowUp');

    await waitFor(() => expect(document.activeElement).toBe(byId('archive')));
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(window.scrollY).toBe(0);
    expect(present('menu')).toBe(true);
  });

  it('lets an autofocus element in the menu take focus', async () => {
    await render(AutofocusComponent);

    await press('ArrowUp');

    await waitFor(() => expect(present('menu')).toBe(true));
    await waitFor(() => expect(document.activeElement).toBe(byId('filter')));
  });

  it('focuses the first item when the last one cannot take focus', async () => {
    await render(HiddenLastItemComponent);

    await press('ArrowUp');

    await waitFor(() => expect(document.activeElement).toBe(byId('rename')));
  });

  it('opens a menu with no enabled item without focusing a disabled one', async () => {
    await render(NoEnabledItemComponent);

    await press('ArrowUp');

    await waitFor(() => expect(present('menu')).toBe(true));
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(document.activeElement).not.toBe(byId('rename'));
  });

  it('keeps focus in a last item that delegates it to its shadow root', async () => {
    await render(DelegatingLastItemComponent);

    await press('ArrowUp');

    await waitFor(() => expect(present('menu')).toBe(true));
    await waitFor(() => expect(document.activeElement).toBe(byId('archive')));
    // still there once a fallback to the first item would have run
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(document.activeElement).toBe(byId('archive'));
    expect(byId('archive').shadowRoot!.activeElement).toBe(
      byId('archive').shadowRoot!.querySelector('button'),
    );
  });
});
