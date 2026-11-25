import { Component, Directive, inject, signal } from '@angular/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { HOVER_BRIDGE_TIMEOUT_MS } from 'ng-primitives/internal';
import {
  NgpMenu,
  NgpMenuItem,
  NgpMenuTrigger,
  NgpSubmenuTrigger,
  injectMenuState,
  injectSubmenuTriggerState,
} from 'ng-primitives/menu';
import { describe, expect, it, vi } from 'vitest';

@Directive({ selector: '[captureSoftDisabledTrigger]' })
class CaptureSoftDisabledTriggerDirective {
  constructor() {
    const host = inject(SoftDisabledMenuComponent);
    host.trigger = injectSubmenuTriggerState();
    host.menu = injectMenuState();
  }
}

@Directive({ selector: '[recordSubmenuMount]' })
class RecordSubmenuMountDirective {
  constructor() {
    inject(SoftDisabledMenuComponent).submenuMounts++;
  }
}

@Component({
  template: `
    <button [ngpMenuTrigger]="menu" data-testid="root-trigger">Open menu</button>
    <ng-template #menu>
      <div ngpMenu data-testid="root-menu">
        <button ngpMenuItem data-testid="first">First</button>
        <button ngpMenuItem ngpMenuItemSoftDisabled data-testid="soft-item">Soft item</button>
        <button
          [ngpMenuItemDisabled]="disabled()"
          [ngpMenuItemSoftDisabled]="softDisabled()"
          [ngpSubmenuTrigger]="submenu"
          captureSoftDisabledTrigger
          ngpMenuItem
          data-testid="submenu-trigger"
        >
          Open submenu
        </button>
        <button ngpMenuItem data-testid="last">Last</button>
      </div>
    </ng-template>

    <ng-template #submenu>
      <div ngpMenu recordSubmenuMount data-testid="submenu">
        <button ngpMenuItem ngpMenuItemSoftDisabled data-testid="submenu-item">Child</button>
        <button [ngpSubmenuTrigger]="grandchild" ngpMenuItem data-testid="nested-trigger">
          Open grandchild
        </button>
      </div>
    </ng-template>

    <ng-template #grandchild>
      <div ngpMenu data-testid="grandchild">
        <button ngpMenuItem data-testid="leaf">Leaf</button>
      </div>
    </ng-template>
  `,
  imports: [
    NgpMenuTrigger,
    NgpMenu,
    NgpMenuItem,
    NgpSubmenuTrigger,
    CaptureSoftDisabledTriggerDirective,
    RecordSubmenuMountDirective,
  ],
})
class SoftDisabledMenuComponent {
  readonly softDisabled = signal(false);
  readonly disabled = signal(false);
  trigger!: ReturnType<typeof injectSubmenuTriggerState>;
  menu!: ReturnType<typeof injectMenuState>;
  submenuMounts = 0;
}

async function openMenu() {
  const { fixture } = await render(SoftDisabledMenuComponent);
  const button = screen.getByTestId('root-trigger');
  button.focus();
  await userEvent.keyboard('{Enter}');
  const first = await screen.findByTestId('first');
  await waitFor(() => expect(first).toHaveFocus());
  return fixture;
}

describe('soft-disabled menu items', () => {
  it.each(['queued descendant', 'already exiting'] as const)(
    'closes and preserves trigger focus on a soft-disable round trip with %s',
    async phase => {
      const fixture = await openMenu();
      const { softDisabled, trigger } = fixture.componentInstance;
      const element = screen.getByTestId('submenu-trigger');
      trigger().show();
      const panel = await screen.findByTestId('submenu');
      const nested = screen.getByTestId('nested-trigger');
      nested.focus();

      const animation = panel.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 10000 });
      animation.pause();
      try {
        if (phase === 'queued descendant') {
          nested.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
        } else {
          trigger().hide();
          await waitFor(() => expect(panel).toHaveAttribute('data-exit'));
        }

        softDisabled.set(true);
        fixture.detectChanges();
        softDisabled.set(false);
        fixture.detectChanges();
        await new Promise<void>(resolve => setTimeout(resolve, 0));
        expect(panel).toHaveAttribute('data-exit');
        expect(screen.queryByTestId('grandchild')).not.toBeInTheDocument();
        expect(element).toHaveFocus();
      } finally {
        animation.finish();
      }
      await waitFor(() => expect(panel).not.toBeInTheDocument());
    },
  );

  it('keeps a soft-disabled item in roving focus without selecting it', async () => {
    await openMenu();
    const item = screen.getByTestId('soft-item');

    await userEvent.keyboard('{ArrowDown}');
    expect(item).toHaveFocus();
    expect(item).toHaveAttribute('aria-disabled', 'true');
    expect(item).not.toBeDisabled();

    await userEvent.keyboard('{Enter} ');
    fireEvent.click(item);
    expect(screen.getByTestId('root-menu')).toBeInTheDocument();

    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    expect(screen.getByTestId('last')).toHaveFocus();
  });

  it.each(['click', 'hover', 'opening arrow', 'show', 'toggle'] as const)(
    'blocks %s on a soft-disabled trigger',
    async method => {
      const fixture = await openMenu();
      const { softDisabled, trigger } = fixture.componentInstance;
      const element = screen.getByTestId('submenu-trigger');

      softDisabled.set(true);
      fixture.detectChanges();
      await userEvent.keyboard('{ArrowDown}{ArrowDown}');
      expect(element).toHaveFocus();

      const activate = {
        click: () => fireEvent.click(element),
        hover: () => fireEvent.pointerEnter(element, { pointerType: 'mouse' }),
        'opening arrow': () => userEvent.keyboard('{ArrowRight}'),
        show: () => trigger().show(),
        toggle: () => trigger().toggle(new MouseEvent('click')),
      }[method];
      await activate();
      await fixture.whenStable();

      expect(element).toHaveAttribute('aria-disabled', 'true');
      expect(trigger().open()).toBe(false);
      expect(fixture.componentInstance.submenuMounts).toBe(0);

      softDisabled.set(false);
      fixture.detectChanges();
      await activate();
      await waitFor(() => expect(element).toHaveAttribute('aria-expanded', 'true'));
    },
  );

  it.each([true, false])(
    'rechecks soft disable before a deferred hover opens (locked=%s)',
    async lock => {
      const fixture = await openMenu();
      const { menu, softDisabled, trigger } = fixture.componentInstance;
      const element = screen.getByTestId('submenu-trigger');
      const transitSource = screen.getByTestId('first');

      menu().setTransitSource(transitSource);
      expect(menu().isTransitBlocked(element)).toBe(true);
      fireEvent.pointerEnter(element, { pointerType: 'mouse' });
      expect(trigger().open()).toBe(false);

      softDisabled.set(lock);
      fixture.detectChanges();
      menu().clearTransitSource(transitSource);

      if (lock) {
        // Wait past the hover-transit window. Count mounts to
        // catch an overlay that is created and immediately closed.
        await new Promise(resolve => setTimeout(resolve, HOVER_BRIDGE_TIMEOUT_MS + 100));
        expect(fixture.componentInstance.submenuMounts).toBe(0);
      } else {
        await waitFor(() => expect(fixture.componentInstance.submenuMounts).toBe(1));
      }
    },
  );

  it('cancels a submenu mount already scheduled by hover when soft-disabled', async () => {
    const fixture = await openMenu();
    const { softDisabled, trigger } = fixture.componentInstance;
    const element = screen.getByTestId('submenu-trigger');

    fireEvent.pointerEnter(element, { pointerType: 'mouse' });
    expect(trigger().open()).toBe(false);

    softDisabled.set(true);
    fixture.detectChanges();

    // Let the overlay's zero-delay mount timer run if it was not cancelled.
    await new Promise<void>(resolve => setTimeout(resolve, 0));
    expect(fixture.componentInstance.submenuMounts).toBe(0);
    expect(element).toHaveAttribute('aria-expanded', 'false');

    softDisabled.set(false);
    fixture.detectChanges();
    fireEvent.pointerEnter(element, { pointerType: 'mouse' });
    await waitFor(() => expect(fixture.componentInstance.submenuMounts).toBe(1));
  });

  it('cancels a transit hover retry even after clearing soft disable', async () => {
    const fixture = await openMenu();
    const { menu, softDisabled } = fixture.componentInstance;
    const element = screen.getByTestId('submenu-trigger');
    const sibling = screen.getByTestId('first');

    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    try {
      menu().setTransitSource(sibling);
      fireEvent.pointerEnter(element, { pointerType: 'mouse' });
      softDisabled.set(true);
      fixture.detectChanges();
      softDisabled.set(false);
      fixture.detectChanges();
      menu().clearTransitSource(sibling);
      vi.advanceTimersByTime(HOVER_BRIDGE_TIMEOUT_MS + 1);
    } finally {
      vi.useRealTimers();
    }

    expect(fixture.componentInstance.submenuMounts).toBe(0);
    expect(element).toHaveAttribute('aria-expanded', 'false');
    fireEvent.pointerEnter(element, { pointerType: 'mouse' });
    await waitFor(() => expect(fixture.componentInstance.submenuMounts).toBe(1));
  });

  it('cancels initial focus when soft-disabled after the submenu mounts', async () => {
    const fixture = await openMenu();
    const { softDisabled } = fixture.componentInstance;
    const element = screen.getByTestId('submenu-trigger');
    element.focus();

    let focusAtMount: Element | null = null;
    let enteredAtMount = false;
    const observer = new MutationObserver(() => {
      const submenu = screen.queryByTestId('submenu');
      if (!submenu) {
        return;
      }

      observer.disconnect();
      focusAtMount = document.activeElement;
      enteredAtMount = submenu.hasAttribute('data-enter');
      softDisabled.set(true);
      fixture.detectChanges();
    });

    try {
      observer.observe(document.body, { childList: true, subtree: true });
      fireEvent.pointerEnter(element, { pointerType: 'mouse' });
      await waitFor(() => {
        expect(focusAtMount).toBe(element);
        expect(enteredAtMount).toBe(false);
        expect(element).toHaveAttribute('aria-disabled', 'true');
        expect(element).toHaveAttribute('aria-expanded', 'false');
        expect(screen.queryByTestId('submenu')).not.toBeInTheDocument();
        expect(element).toHaveFocus();
      });
    } finally {
      observer.disconnect();
    }
  });

  it('closes on soft disable, returns focus and preserves an independent trigger disable', async () => {
    const fixture = await openMenu();
    const { softDisabled, trigger } = fixture.componentInstance;
    const element = screen.getByTestId('submenu-trigger');

    element.focus();
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(screen.getByTestId('submenu-item')).toHaveFocus());

    softDisabled.set(true);
    await waitFor(() => {
      expect(element).toHaveAttribute('aria-expanded', 'false');
      expect(element).toHaveFocus();
      expect(screen.queryByTestId('submenu')).not.toBeInTheDocument();
    });

    trigger().setDisabled(true);
    softDisabled.set(false);
    fixture.detectChanges();
    trigger().show();
    expect(trigger().disabled()).toBe(true);
    expect(trigger().open()).toBe(false);

    trigger().setDisabled(false);
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(screen.getByTestId('submenu-item')).toHaveFocus());

    await userEvent.keyboard('{ArrowLeft}');
    await waitFor(() => {
      expect(element).toHaveAttribute('aria-expanded', 'false');
      expect(element).toHaveFocus();
    });
  });

  it('gives hard disable precedence over soft disable', async () => {
    const fixture = await openMenu();
    const { disabled, softDisabled, trigger } = fixture.componentInstance;
    disabled.set(true);
    softDisabled.set(true);
    fixture.detectChanges();

    const element = screen.getByTestId('submenu-trigger');
    expect(element).toBeDisabled();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    expect(screen.getByTestId('last')).toHaveFocus();
    trigger().show();
    expect(trigger().open()).toBe(false);
  });
});
