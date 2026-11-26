import { Component, Directive, OnInit, inject, signal, viewChild } from '@angular/core';
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
import { NgpOverlay } from 'ng-primitives/portal';
import { describe, expect, it, vi } from 'vitest';

@Directive({ selector: '[captureSubmenuTrigger]' })
class CaptureSubmenuTriggerDirective {
  constructor() {
    const host = inject(DisableSubmenuComponent);
    host.trigger = injectSubmenuTriggerState();
    host.menu = injectMenuState();
  }
}

@Directive({ selector: '[countSubmenuMount]' })
class CountSubmenuMountDirective implements OnInit {
  private readonly host = inject(DisableSubmenuComponent);

  constructor() {
    this.host.submenuMounts++;
    this.host.onSubmenuMount?.();
  }

  ngOnInit(): void {
    this.host.onSubmenuInit?.();
  }
}

@Component({
  template: `
    <button [ngpMenuTrigger]="menu" data-testid="root-trigger">Open Menu</button>

    <ng-template #menu>
      <div ngpMenu data-testid="root-menu">
        <button
          [ngpSubmenuTrigger]="replace() ? replacement : submenu"
          [ngpSubmenuTriggerDisabled]="disabled()"
          ngpMenuItem
          captureSubmenuTrigger
          data-testid="submenu-trigger"
        >
          Open Submenu
        </button>
        <button ngpMenuItem data-testid="sibling">Sibling</button>
      </div>
    </ng-template>

    <ng-template #submenu>
      <div [ngpMenuFinalFocus]="finalFocus()" ngpMenu countSubmenuMount data-testid="submenu">
        <button
          #nestedTrigger="ngpSubmenuTrigger"
          [ngpSubmenuTrigger]="grandchild"
          ngpMenuItem
          data-testid="submenu-item"
        >
          Submenu Item
        </button>
      </div>
    </ng-template>

    <ng-template #replacement>
      <div ngpMenu countSubmenuMount data-testid="replacement">
        <button
          #nestedTrigger="ngpSubmenuTrigger"
          [ngpSubmenuTrigger]="grandchild"
          ngpMenuItem
          data-testid="replacement-item"
        >
          Replacement Item
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
    CaptureSubmenuTriggerDirective,
    CountSubmenuMountDirective,
  ],
})
class DisableSubmenuComponent {
  readonly replace = signal(false);
  readonly disabled = signal(false);
  readonly nestedTrigger = viewChild<NgpSubmenuTrigger>('nestedTrigger');
  readonly finalFocus = signal<HTMLElement | null>(null);
  trigger!: ReturnType<typeof injectSubmenuTriggerState>;
  menu!: ReturnType<typeof injectMenuState>;
  submenuMounts = 0;
  onSubmenuMount?: () => void;
  onSubmenuInit?: () => void;
}

describe('NgpSubmenuTrigger disable transitions', () => {
  it.each(
    (['closed', 'scheduled', 'mounting', 'open', 'replacing', 'exiting'] as const).flatMap(phase =>
      [false, true].map(reenable => ({ phase, reenable })),
    ),
  )('closes from $phase when disabled (re-enable: $reenable)', async ({ phase, reenable }) => {
    const { fixture } = await render(DisableSubmenuComponent);
    fireEvent.click(screen.getByTestId('root-trigger'));
    const element = await screen.findByTestId('submenu-trigger');
    const host = fixture.componentInstance;
    const trigger = host.trigger();
    await waitFor(() => expect(element).toHaveFocus());

    function disable(): void {
      trigger.setDisabled(true);
      if (reenable) {
        trigger.setDisabled(false);
      }
    }

    if (phase === 'mounting') {
      host.onSubmenuMount = disable;
      trigger.show();
      await waitFor(() => expect(host.submenuMounts).toBe(1));
      host.onSubmenuMount = undefined;
    } else if (phase === 'replacing') {
      trigger.show();
      await waitFor(() => expect(screen.getByTestId('submenu-item')).toHaveFocus());
      host.onSubmenuMount = disable;
      host.replace.set(true);
      fixture.detectChanges();
      await waitFor(() => expect(host.submenuMounts).toBe(2));
      host.onSubmenuMount = undefined;
      expect(screen.queryByTestId('replacement')).not.toBeInTheDocument();
      expect(element).toHaveAttribute('aria-expanded', 'false');
      host.replace.set(false);
    } else if (phase === 'exiting') {
      trigger.show();
      const panel = await screen.findByTestId('submenu');
      await waitFor(() => expect(screen.getByTestId('submenu-item')).toHaveFocus());
      const animation = panel.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 10000 });
      animation.pause();
      try {
        trigger.hide();
        await waitFor(() => expect(panel).toHaveAttribute('data-exit'));
        disable();
        expect(element).toHaveFocus();
      } finally {
        animation.finish();
      }
    } else {
      if (phase === 'scheduled') {
        trigger.show();
      } else if (phase === 'open') {
        trigger.show();
        await waitFor(() => expect(screen.getByTestId('submenu-item')).toHaveFocus());
      }
      disable();
    }

    await new Promise(requestAnimationFrame);
    await waitFor(() => {
      expect(element).toHaveAttribute('aria-expanded', 'false');
      expect(trigger.open()).toBe(false);
      expect(screen.queryByTestId('submenu')).not.toBeInTheDocument();
    });
    expect(element).toHaveFocus();

    trigger.setDisabled(false);
    trigger.show();
    await waitFor(() => expect(screen.getByTestId('submenu-item')).toHaveFocus());
    expect(element).toHaveAttribute('aria-expanded', 'true');
  });

  it.each(['scheduled', 'open'] as const)(
    'discards the %s descendant of the replaced panel and lets the new panel open its own',
    async phase => {
      const { fixture } = await render(DisableSubmenuComponent);
      fireEvent.click(screen.getByTestId('root-trigger'));
      await screen.findByTestId('submenu-trigger');
      const host = fixture.componentInstance;
      host.trigger().show();
      await waitFor(() => expect(screen.getByTestId('submenu-item')).toHaveFocus());

      host.nestedTrigger()!.show();
      if (phase === 'open') {
        await waitFor(() => expect(screen.getByTestId('leaf')).toHaveFocus());
      }

      host.replace.set(true);
      fixture.detectChanges();
      await waitFor(() => expect(screen.getByTestId('replacement-item')).toHaveFocus());
      expect(screen.queryByTestId('grandchild')).not.toBeInTheDocument();

      host.nestedTrigger()!.show();
      await waitFor(() => expect(screen.getByTestId('leaf')).toHaveFocus());
    },
  );

  it.each(['input', 'state'] as const)(
    'invalidates a descendant show requested before the ancestor starts exiting via %s',
    async source => {
      const { fixture } = await render(DisableSubmenuComponent);
      await openMenuAndSubmenu(fixture);
      const trigger = screen.getByTestId('submenu-trigger');
      const panel = screen.getByTestId('submenu');
      const item = screen.getByTestId('submenu-item');
      await waitFor(() => expect(item).toHaveFocus());

      const { disabled, trigger: state } = fixture.componentInstance;
      const animation = panel.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 10000 });
      animation.pause();
      try {
        item.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
        if (source === 'input') {
          disabled.set(true);
          fixture.detectChanges();
          disabled.set(false);
          fixture.detectChanges();
        } else {
          state().setDisabled(true);
          state().setDisabled(false);
        }
        expect(panel).toHaveAttribute('data-exit');

        // A second request made from already exiting content cannot open either.
        item.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
        await new Promise<void>(resolve => setTimeout(resolve, 0));
        expect(screen.queryByTestId('grandchild')).not.toBeInTheDocument();
        expect(trigger).toHaveFocus();
      } finally {
        animation.finish();
      }
    },
  );

  it('returns focus acquired synchronously during portal attachment', async () => {
    const { fixture } = await render(DisableSubmenuComponent);
    fireEvent.click(screen.getByTestId('root-trigger'));
    const element = await screen.findByTestId('submenu-trigger');
    await waitFor(() => expect(element).toHaveFocus());
    const host = fixture.componentInstance;
    const trigger = host.trigger();

    let focusedDuringAttach = false;
    host.onSubmenuInit = () => {
      const item = screen.getByTestId('submenu-item');
      item.focus();
      focusedDuringAttach = document.activeElement === item;
      trigger.setDisabled(true);
      trigger.setDisabled(false);
    };

    trigger.show();
    await waitFor(() => expect(host.submenuMounts).toBe(1));
    expect(focusedDuringAttach).toBe(true);
    expect(screen.queryByTestId('submenu')).not.toBeInTheDocument();
    expect(element).toHaveFocus();
  });

  it('re-arms initial focus when a fresh show resumes a disabled submenu', async () => {
    const { fixture } = await render(DisableSubmenuComponent);
    await openMenuAndSubmenu(fixture);
    const { trigger } = fixture.componentInstance;
    const panel = screen.getByTestId('submenu');
    const item = screen.getByTestId('submenu-item');
    await waitFor(() => expect(item).toHaveFocus());

    const animation = panel.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 10000 });
    animation.pause();
    try {
      trigger().setDisabled(true);
      expect(screen.getByTestId('submenu-trigger')).toHaveFocus();
      trigger().setDisabled(false);
      trigger().show();

      await waitFor(() => expect(item).toHaveFocus());
      expect(screen.getByTestId('submenu')).toBe(panel);
    } finally {
      animation.cancel();
    }
  });

  it('requires a fresh descendant show when its ancestor resumes a pending close', async () => {
    const { fixture } = await render(DisableSubmenuComponent);
    await openMenuAndSubmenu(fixture);
    const host = fixture.componentInstance;
    const ancestor = host.trigger();
    const descendant = host.nestedTrigger()!;
    const submenu = screen.getByTestId('submenu');

    descendant.show();
    ancestor.hide();
    ancestor.show();

    await new Promise<void>(resolve => setTimeout(resolve, 0));
    expect(screen.getByTestId('submenu')).toBe(submenu);
    expect(screen.queryByTestId('grandchild')).not.toBeInTheDocument();

    descendant.show();
    await waitFor(() => expect(screen.getByTestId('leaf')).toHaveFocus());
  });

  it.each([false, true])(
    'returns focus from a grandchild when its ancestor is disabled (grandchild exiting: %s)',
    async exiting => {
      const { fixture } = await render(DisableSubmenuComponent);
      await openMenuAndSubmenu(fixture);
      const host = fixture.componentInstance;
      host.nestedTrigger()!.show();
      await waitFor(() => expect(screen.getByTestId('leaf')).toHaveFocus());

      const grandchild = screen.getByTestId('grandchild');
      const animation = grandchild.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 10000 });
      animation.pause();
      try {
        if (exiting) {
          host.nestedTrigger()!.hide();
          await waitFor(() => expect(grandchild).toHaveAttribute('data-exit'));
        }

        host.trigger().setDisabled(true);
        expect(screen.getByTestId('submenu-trigger')).toHaveFocus();
      } finally {
        animation.finish();
      }
      await waitFor(() => expect(grandchild).not.toBeInTheDocument());
    },
  );

  it.each(['input', 'state'] as const)(
    'cancels a submenu mount already scheduled by hover when disabled through the %s',
    async source => {
      const { fixture } = await render(DisableSubmenuComponent);
      fireEvent.click(screen.getByTestId('root-trigger'));
      const element = await screen.findByTestId('submenu-trigger');
      const host = fixture.componentInstance;

      const setDisabled = (value: boolean) => {
        if (source === 'input') {
          host.disabled.set(value);
          fixture.detectChanges();
        } else {
          host.trigger().setDisabled(value);
        }
      };

      fireEvent.pointerEnter(element, { pointerType: 'mouse' });
      expect(host.trigger().open()).toBe(false);
      setDisabled(true);
      setDisabled(false);

      // Let the overlay's zero-delay mount timer run if it was not cancelled.
      await new Promise<void>(resolve => setTimeout(resolve, 0));
      expect(host.submenuMounts).toBe(0);
      expect(element).toHaveAttribute('aria-expanded', 'false');

      fireEvent.pointerEnter(element, { pointerType: 'mouse' });
      await waitFor(() => expect(host.submenuMounts).toBe(1));
    },
  );

  it.each(['input', 'state'] as const)(
    'cancels a transit hover retry after disabling and re-enabling through the %s',
    async source => {
      const { fixture } = await render(DisableSubmenuComponent);
      fireEvent.click(screen.getByTestId('root-trigger'));
      const element = await screen.findByTestId('submenu-trigger');
      const sibling = screen.getByTestId('sibling');
      const { disabled, menu, trigger } = fixture.componentInstance;

      function setDisabled(value: boolean): void {
        if (source === 'state') {
          trigger().setDisabled(value);
        } else {
          disabled.set(value);
        }
        fixture.detectChanges();
      }

      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      try {
        menu().setTransitSource(sibling);
        expect(menu().isTransitBlocked(element)).toBe(true);
        fireEvent.pointerEnter(element, { pointerType: 'mouse' });
        setDisabled(true);
        setDisabled(false);
        menu().clearTransitSource(sibling);

        // Run the retry and any resulting overlay mount timer.
        vi.advanceTimersByTime(HOVER_BRIDGE_TIMEOUT_MS + 1);
      } finally {
        vi.useRealTimers();
      }
      expect(fixture.componentInstance.submenuMounts).toBe(0);
      expect(element).toHaveAttribute('aria-expanded', 'false');

      fireEvent.pointerEnter(element, { pointerType: 'mouse' });
      await waitFor(() => expect(fixture.componentInstance.submenuMounts).toBe(1));
    },
  );

  it.each([
    ['input', 'submenu-trigger'],
    ['state', 'submenu-trigger'],
    ['state', 'sibling'],
  ] as const)(
    'cancels initial focus when disabled through the %s after mounting with focus on %s',
    async (source, focusedId) => {
      const { fixture } = await render(DisableSubmenuComponent);
      fireEvent.click(screen.getByTestId('root-trigger'));
      const element = await screen.findByTestId('submenu-trigger');
      const focused = screen.getByTestId(focusedId);
      focused.focus();
      const { disabled, trigger } = fixture.componentInstance;

      let mounted: HTMLElement | null = null;
      let hadEntered = false;
      let focusAtMount: Element | null = null;
      const observer = new MutationObserver(() => {
        const submenu = screen.queryByTestId('submenu');
        if (!submenu) {
          return;
        }

        observer.disconnect();
        mounted = submenu;
        hadEntered = submenu.hasAttribute('data-enter');
        focusAtMount = document.activeElement;

        if (source === 'state') {
          trigger().setDisabled(true);
        } else {
          disabled.set(true);
        }
        fixture.detectChanges();
      });

      try {
        observer.observe(document.body, { childList: true, subtree: true });
        fireEvent.pointerEnter(element, { pointerType: 'mouse' });
        await waitFor(() => {
          expect(mounted).not.toBeNull();
          expect(element).toHaveAttribute('aria-expanded', 'false');
          expect(screen.queryByTestId('submenu')).not.toBeInTheDocument();
          expect(focused).toHaveFocus();
        });

        expect(hadEntered).toBe(false);
        expect(focusAtMount).toBe(focused);
        // Let the portal's queued enter frame run after detaching the panel.
        await new Promise(requestAnimationFrame);
        expect(mounted).not.toHaveAttribute('data-enter');
      } finally {
        observer.disconnect();
      }
    },
  );

  it('cancels a pending focus handoff after a mouse click on an open submenu trigger', async () => {
    const { fixture } = await render(DisableSubmenuComponent);
    await openMenuAndSubmenu(fixture);

    const element = screen.getByTestId('submenu-trigger');
    const item = screen.getByTestId('submenu-item');
    await waitFor(() => expect(item).toHaveFocus());
    element.focus();
    const onFocus = vi.fn();
    item.addEventListener('focusin', onFocus);
    const { trigger } = fixture.componentInstance;

    fireEvent.pointerDown(element, { pointerType: 'mouse', button: 0 });
    fireEvent.click(element, { detail: 1 });
    trigger().setDisabled(true);
    trigger().setDisabled(false);

    await waitFor(() => expect(screen.queryByTestId('submenu')).not.toBeInTheDocument());
    expect(onFocus).not.toHaveBeenCalled();
    expect(element).toHaveFocus();
  });

  it.each(['input', 'state'] as const)(
    'closes an open submenu and returns focus when disabled through the %s',
    async source => {
      const { fixture } = await render(DisableSubmenuComponent);
      await openMenuAndSubmenu(fixture);

      const { disabled, trigger } = fixture.componentInstance;
      const element = screen.getByTestId('submenu-trigger');
      await waitFor(() => expect(screen.getByTestId('submenu-item')).toHaveFocus());
      expect(element).toHaveAttribute('aria-expanded', 'true');

      const setDisabled = (value: boolean) =>
        source === 'input' ? disabled.set(value) : trigger().setDisabled(value);
      setDisabled(true);

      await waitFor(() => {
        expect(screen.queryByTestId('submenu')).not.toBeInTheDocument();
        expect(element).toHaveAttribute('aria-expanded', 'false');
        expect(element).toHaveFocus();
      });

      trigger().show();
      expect(trigger().open()).toBe(false);

      setDisabled(false);
      fixture.detectChanges();
      trigger().show();

      await waitFor(() => expect(element).toHaveAttribute('aria-expanded', 'true'));
    },
  );

  it('keeps focus on another item when the open submenu is disabled', async () => {
    const { fixture } = await render(DisableSubmenuComponent);
    await openMenuAndSubmenu(fixture);

    const sibling = screen.getByTestId('sibling');
    const { finalFocus, trigger } = fixture.componentInstance;
    finalFocus.set(screen.getByTestId('submenu-trigger'));
    fixture.detectChanges();

    sibling.focus();
    trigger().setDisabled(true);

    await waitFor(() => {
      expect(screen.queryByTestId('submenu')).not.toBeInTheDocument();
      expect(sibling).toHaveFocus();
    });
  });
});

@Component({
  template: `
    <button [ngpMenuTrigger]="menu" data-testid="root-trigger">Open Menu</button>

    <ng-template #menu>
      <div ngpMenu data-testid="root-menu">
        <button ngpMenuItem data-testid="item-1">Item 1</button>
        <button [ngpSubmenuTrigger]="submenu" ngpMenuItem data-testid="submenu-trigger">
          Open Submenu
        </button>
      </div>
    </ng-template>

    <ng-template #submenu>
      <div ngpMenu data-testid="submenu">
        <button ngpMenuItem data-testid="submenu-item-1">Submenu Item 1</button>
        <button ngpMenuItem data-testid="submenu-item-2">Submenu Item 2</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem, NgpSubmenuTrigger],
})
class TestSubmenuComponent {}

@Component({
  template: `
    <button [ngpMenuTrigger]="menu" data-testid="root-trigger">Open Menu</button>

    <ng-template #menu>
      <div ngpMenu data-testid="root-menu">
        <button
          [ngpSubmenuTrigger]="submenu"
          [ngpSubmenuTriggerFlip]="false"
          ngpMenuItem
          data-testid="submenu-trigger"
        >
          Open Submenu
        </button>
      </div>
    </ng-template>

    <ng-template #submenu>
      <div ngpMenu data-testid="submenu">
        <button ngpMenuItem data-testid="submenu-item-1">Submenu Item 1</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem, NgpSubmenuTrigger],
})
class TestSubmenuNoFlipComponent {}

@Component({
  template: `
    <button [ngpMenuTrigger]="menu" data-testid="root-trigger">Open Menu</button>

    <ng-template #menu>
      <div ngpMenu data-testid="root-menu">
        <button
          [ngpSubmenuTrigger]="submenu"
          [ngpSubmenuTriggerPlacement]="placement"
          ngpMenuItem
          data-testid="submenu-trigger"
        >
          Open Submenu
        </button>
      </div>
    </ng-template>

    <ng-template #submenu>
      <div ngpMenu data-testid="submenu">
        <button ngpMenuItem data-testid="submenu-item-1">Submenu Item 1</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem, NgpSubmenuTrigger],
})
class TestSubmenuPlacementComponent {
  placement: string = 'right-start';
}

@Component({
  template: `
    <div id="submenu-host"></div>

    <button [ngpMenuTrigger]="menu" data-testid="root-trigger">Open Menu</button>

    <ng-template #menu>
      <div ngpMenu data-testid="root-menu">
        <button
          [ngpSubmenuTrigger]="submenu"
          ngpSubmenuTriggerContainer="#submenu-host"
          ngpMenuItem
          data-testid="submenu-trigger"
        >
          Open Submenu
        </button>
      </div>
    </ng-template>

    <ng-template #submenu>
      <div ngpMenu data-testid="submenu">
        <button ngpMenuItem data-testid="submenu-item-1">Submenu Item 1</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem, NgpSubmenuTrigger],
})
class TestSubmenuContainerComponent {}

@Directive({
  selector: '[setSubmenuContainer]',
})
class SetSubmenuContainerDirective implements OnInit {
  private readonly submenuTrigger = injectSubmenuTriggerState();

  ngOnInit(): void {
    const host = document.querySelector('#submenu-host') as HTMLElement;
    // container should be settable via the state setter method
    this.submenuTrigger().setContainer(host);
  }
}

@Component({
  template: `
    <div id="submenu-host"></div>

    <button [ngpMenuTrigger]="menu" data-testid="root-trigger">Open Menu</button>

    <ng-template #menu>
      <div ngpMenu data-testid="root-menu">
        <button
          [ngpSubmenuTrigger]="submenu"
          setSubmenuContainer
          ngpMenuItem
          data-testid="submenu-trigger"
        >
          Open Submenu
        </button>
      </div>
    </ng-template>

    <ng-template #submenu>
      <div ngpMenu data-testid="submenu">
        <button ngpMenuItem data-testid="submenu-item-1">Submenu Item 1</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem, NgpSubmenuTrigger, SetSubmenuContainerDirective],
})
class TestSubmenuSetContainerComponent {}

@Component({
  template: `
    <div id="submenu-dynamic-a"></div>
    <div id="submenu-dynamic-b"></div>

    <button [ngpMenuTrigger]="menu" data-testid="root-trigger">Open Menu</button>

    <ng-template #menu>
      <div ngpMenu data-testid="root-menu">
        <button
          [ngpSubmenuTrigger]="submenu"
          [ngpSubmenuTriggerContainer]="container()"
          ngpMenuItem
          data-testid="submenu-trigger"
        >
          Open Submenu
        </button>
      </div>
    </ng-template>

    <ng-template #submenu>
      <div ngpMenu data-testid="submenu">
        <button ngpMenuItem data-testid="submenu-item-1">Submenu Item 1</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem, NgpSubmenuTrigger],
})
class TestSubmenuDynamicContainerComponent {
  readonly container = signal<string>('#submenu-dynamic-a');
}

/**
 * Helper to open the root menu and submenu.
 */
async function openMenuAndSubmenu(fixture: {
  autoDetectChanges: (autoDetect: boolean) => void;
  debugElement: { nativeElement: HTMLElement };
}): Promise<void> {
  fixture.autoDetectChanges(true);

  const trigger = fixture.debugElement.nativeElement.querySelector('[data-testid="root-trigger"]')!;

  // Open root menu
  fireEvent.click(trigger);

  await waitFor(() => {
    expect(document.querySelector('[data-testid="submenu-trigger"]')).toBeInTheDocument();
  });

  // Open submenu
  const submenuTrigger = document.querySelector('[data-testid="submenu-trigger"]')!;
  fireEvent.click(submenuTrigger);

  await waitFor(() => {
    expect(document.querySelector('[data-testid="submenu"]')).toBeInTheDocument();
  });
}

function findSubmenuOverlayContext(
  contexts: unknown[],
):
  | { config: { flip?: unknown; placement?: () => string; triggerElement: HTMLElement } }
  | undefined {
  return contexts.find(
    (
      context,
    ): context is {
      config: { flip?: unknown; placement?: () => string; triggerElement: HTMLElement };
    } =>
      !!context &&
      typeof context === 'object' &&
      'config' in context &&
      !!(context as { config?: { triggerElement?: HTMLElement } }).config?.triggerElement &&
      (context as { config: { triggerElement: HTMLElement } }).config.triggerElement.getAttribute(
        'data-testid',
      ) === 'submenu-trigger',
  );
}

describe('NgpSubmenuTrigger viewport awareness', () => {
  describe('data-placement attribute', () => {
    it('should set data-placement on the submenu when opened', async () => {
      const { fixture } = await render(TestSubmenuComponent);
      fixture.autoDetectChanges(true);

      const trigger = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="root-trigger"]',
      );

      // Open root menu
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(document.querySelector('[data-testid="submenu-trigger"]')).toBeInTheDocument();
      });

      // Open submenu
      const submenuTrigger = document.querySelector('[data-testid="submenu-trigger"]')!;
      fireEvent.click(submenuTrigger);

      await waitFor(() => {
        const submenu = document.querySelector('[data-testid="submenu"]');
        expect(submenu).toBeInTheDocument();
        expect(submenu?.getAttribute('data-placement')).toBeTruthy();
      });
    });
  });

  describe('flip configuration', () => {
    it('should pass flip=true to the submenu overlay when flip is enabled by default', async () => {
      const computePositionSpy = vi.spyOn(
        NgpOverlay.prototype as unknown as Record<string, () => Promise<void>>,
        'computePosition',
      );

      try {
        const { fixture } = await render(TestSubmenuComponent);
        await openMenuAndSubmenu(fixture);

        const submenuContext = findSubmenuOverlayContext(computePositionSpy.mock.contexts);
        expect(submenuContext).toBeDefined();
        expect(submenuContext!.config.flip).toBe(true);
      } finally {
        computePositionSpy.mockRestore();
      }
    });

    it('should pass flip=false to the submenu overlay when flip is disabled', async () => {
      const computePositionSpy = vi.spyOn(
        NgpOverlay.prototype as unknown as Record<string, () => Promise<void>>,
        'computePosition',
      );

      try {
        const { fixture } = await render(TestSubmenuNoFlipComponent);
        await openMenuAndSubmenu(fixture);

        const submenuContext = findSubmenuOverlayContext(computePositionSpy.mock.contexts);
        expect(submenuContext).toBeDefined();
        expect(submenuContext!.config.flip).toBe(false);
      } finally {
        computePositionSpy.mockRestore();
      }
    });
  });

  describe('viewport-aware flip behavior', () => {
    /**
     * Sets up DOM mocks to simulate a constrained viewport.
     * Floating UI uses getBoundingClientRect, offsetWidth/offsetHeight, and
     * window/document dimensions to determine overflow and flip placement.
     */
    function setupViewportMocks(): { cleanup: () => void } {
      const originalInnerWidth = window.innerWidth;
      const originalInnerHeight = window.innerHeight;

      // Save original document size descriptors
      const docElement = document.documentElement;
      const origDocClientWidth = Object.getOwnPropertyDescriptor(docElement, 'clientWidth');
      const origDocClientHeight = Object.getOwnPropertyDescriptor(docElement, 'clientHeight');
      const origDocScrollWidth = Object.getOwnPropertyDescriptor(docElement, 'scrollWidth');
      const origDocScrollHeight = Object.getOwnPropertyDescriptor(docElement, 'scrollHeight');
      const origBodyClientWidth = Object.getOwnPropertyDescriptor(document.body, 'clientWidth');
      const origBodyClientHeight = Object.getOwnPropertyDescriptor(document.body, 'clientHeight');

      // Mock viewport dimensions
      Object.defineProperty(window, 'innerWidth', { value: 400, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 600, configurable: true });

      // Mock document dimensions for Floating UI's getDocumentRect/getClippingRect
      Object.defineProperty(docElement, 'clientWidth', { value: 400, configurable: true });
      Object.defineProperty(docElement, 'clientHeight', { value: 600, configurable: true });
      Object.defineProperty(docElement, 'scrollWidth', { value: 400, configurable: true });
      Object.defineProperty(docElement, 'scrollHeight', { value: 600, configurable: true });
      Object.defineProperty(document.body, 'clientWidth', { value: 400, configurable: true });
      Object.defineProperty(document.body, 'clientHeight', { value: 600, configurable: true });

      // Mock getBoundingClientRect to simulate viewport constraint.
      // The submenu trigger is positioned so its right edge is near the viewport edge.
      // A right-start submenu would overflow, but left-start has enough space.
      vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
        this: HTMLElement,
      ) {
        const testId = this.getAttribute('data-testid');

        if (testId === 'root-trigger') {
          return new DOMRect(200, 10, 100, 30);
        }
        if (testId === 'root-menu') {
          return new DOMRect(200, 40, 200, 120);
        }
        if (testId === 'submenu-trigger') {
          // Right edge at 400 (viewport edge) - no room on the right for a 200px submenu
          // But left side has 200px of space - enough for the submenu
          return new DOMRect(200, 70, 200, 30);
        }
        if (testId === 'submenu') {
          // 200px wide submenu
          return new DOMRect(200, 70, 200, 80);
        }

        if (this === document.body || this === document.documentElement) {
          return new DOMRect(0, 0, 400, 600);
        }

        // Default for menu items and other elements
        return new DOMRect(200, 70, 200, 30);
      });

      // Mock offsetWidth/offsetHeight - Floating UI uses these via getDimensions()
      // to determine the floating element's size (JSDOM returns 0 by default)
      const origOffsetWidthDesc = Object.getOwnPropertyDescriptor(
        HTMLElement.prototype,
        'offsetWidth',
      );
      const origOffsetHeightDesc = Object.getOwnPropertyDescriptor(
        HTMLElement.prototype,
        'offsetHeight',
      );

      Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
        get(this: HTMLElement) {
          const testId = this.getAttribute('data-testid');
          if (testId === 'submenu') return 200;
          if (testId === 'root-menu') return 200;
          if (testId === 'submenu-trigger') return 200;
          if (testId === 'root-trigger') return 100;
          return 0;
        },
        configurable: true,
      });

      Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
        get(this: HTMLElement) {
          const testId = this.getAttribute('data-testid');
          if (testId === 'submenu') return 80;
          if (testId === 'root-menu') return 120;
          if (testId === 'submenu-trigger') return 30;
          if (testId === 'root-trigger') return 30;
          return 0;
        },
        configurable: true,
      });

      return {
        cleanup: () => {
          vi.restoreAllMocks();
          Object.defineProperty(window, 'innerWidth', {
            value: originalInnerWidth,
            configurable: true,
          });
          Object.defineProperty(window, 'innerHeight', {
            value: originalInnerHeight,
            configurable: true,
          });
          if (origDocClientWidth) {
            Object.defineProperty(docElement, 'clientWidth', origDocClientWidth);
          }
          if (origDocClientHeight) {
            Object.defineProperty(docElement, 'clientHeight', origDocClientHeight);
          }
          if (origDocScrollWidth) {
            Object.defineProperty(docElement, 'scrollWidth', origDocScrollWidth);
          }
          if (origDocScrollHeight) {
            Object.defineProperty(docElement, 'scrollHeight', origDocScrollHeight);
          }
          if (origBodyClientWidth) {
            Object.defineProperty(document.body, 'clientWidth', origBodyClientWidth);
          }
          if (origBodyClientHeight) {
            Object.defineProperty(document.body, 'clientHeight', origBodyClientHeight);
          }
          if (origOffsetWidthDesc) {
            Object.defineProperty(HTMLElement.prototype, 'offsetWidth', origOffsetWidthDesc);
          }
          if (origOffsetHeightDesc) {
            Object.defineProperty(HTMLElement.prototype, 'offsetHeight', origOffsetHeightDesc);
          }
        },
      };
    }

    it('should flip submenu placement before shift when positioned near viewport edge', async () => {
      const { cleanup } = setupViewportMocks();

      try {
        const { fixture } = await render(TestSubmenuComponent);
        fixture.autoDetectChanges(true);

        const trigger = fixture.debugElement.nativeElement.querySelector(
          '[data-testid="root-trigger"]',
        );

        // Open root menu
        fireEvent.click(trigger);

        await waitFor(() => {
          expect(document.querySelector('[data-testid="submenu-trigger"]')).toBeInTheDocument();
        });

        // Open submenu
        const submenuTrigger = document.querySelector('[data-testid="submenu-trigger"]')!;
        fireEvent.click(submenuTrigger);

        await waitFor(() => {
          const submenu = document.querySelector('[data-testid="submenu"]');
          expect(submenu).toBeInTheDocument();
          // The submenu should have flipped to the left since there's no space on the right
          const placement = submenu?.getAttribute('data-placement');
          expect(placement).toContain('left');
        });
      } finally {
        cleanup();
      }
    });

    it('should not flip when flip is disabled even near viewport edge', async () => {
      const { cleanup } = setupViewportMocks();

      try {
        const { fixture } = await render(TestSubmenuNoFlipComponent);
        fixture.autoDetectChanges(true);

        const trigger = fixture.debugElement.nativeElement.querySelector(
          '[data-testid="root-trigger"]',
        );

        // Open root menu
        fireEvent.click(trigger);

        await waitFor(() => {
          expect(document.querySelector('[data-testid="submenu-trigger"]')).toBeInTheDocument();
        });

        // Open submenu
        const submenuTrigger = document.querySelector('[data-testid="submenu-trigger"]')!;
        fireEvent.click(submenuTrigger);

        // With flip disabled, the submenu should stay at its original placement (right-start)
        // even when near the viewport edge
        await waitFor(() => {
          const submenu = document.querySelector('[data-testid="submenu"]');
          expect(submenu).toBeInTheDocument();
          const placement = submenu?.getAttribute('data-placement');
          expect(placement).toContain('right');
        });
      } finally {
        cleanup();
      }
    });
  });

  describe('custom placement', () => {
    it('should use left-start placement when specified', async () => {
      const computePositionSpy = vi.spyOn(
        NgpOverlay.prototype as unknown as Record<string, () => Promise<void>>,
        'computePosition',
      );

      try {
        const { fixture } = await render(TestSubmenuPlacementComponent);
        fixture.componentInstance.placement = 'left-start';
        fixture.detectChanges();

        await openMenuAndSubmenu(fixture);

        const submenuContext = findSubmenuOverlayContext(computePositionSpy.mock.contexts);
        expect(submenuContext).toBeDefined();
        expect(submenuContext!.config.placement?.()).toBe('left-start');
      } finally {
        computePositionSpy.mockRestore();
      }
    });

    it('should apply custom placement when specified', async () => {
      const { fixture } = await render(TestSubmenuPlacementComponent);
      // Use right-start (default direction but explicit) to verify placement input is wired up
      fixture.componentInstance.placement = 'right-start';
      fixture.detectChanges();

      await openMenuAndSubmenu(fixture);

      // The submenu should have data-placement set (proving the placement input was applied)
      await waitFor(() => {
        const submenu = document.querySelector('[data-testid="submenu"]');
        expect(submenu).toBeInTheDocument();
        expect(submenu?.getAttribute('data-placement')).toBeTruthy();
      });
    });
  });

  describe('container', () => {
    it('should attach the submenu to a custom container when provided via the input (fixes #792)', async () => {
      const { fixture } = await render(TestSubmenuContainerComponent);
      await openMenuAndSubmenu(fixture);

      await waitFor(() => {
        const container = document.querySelector('#submenu-host');
        expect(container?.querySelector('[ngpMenu]')).toBeInTheDocument();
      });
    });

    it('should expose container on the injected state so it can be set programmatically (fixes #792)', async () => {
      const { fixture } = await render(TestSubmenuSetContainerComponent);
      await openMenuAndSubmenu(fixture);

      await waitFor(() => {
        const container = document.querySelector('#submenu-host');
        expect(container?.querySelector('[ngpMenu]')).toBeInTheDocument();
      });
    });

    it('should render submenu into updated container when [ngpSubmenuTriggerContainer] changes between opens', async () => {
      const { fixture } = await render(TestSubmenuDynamicContainerComponent);
      await openMenuAndSubmenu(fixture);

      await waitFor(() => {
        const hostA = document.querySelector('#submenu-dynamic-a');
        expect(hostA?.querySelector('[data-testid="submenu"]')).toBeInTheDocument();
      });

      const submenuTrigger = document.querySelector('[data-testid="submenu-trigger"]')!;
      fireEvent.click(submenuTrigger);

      await waitFor(() => {
        expect(document.querySelector('[data-testid="submenu"]')).not.toBeInTheDocument();
      });

      fixture.componentInstance.container.set('#submenu-dynamic-b');
      fixture.detectChanges();

      fireEvent.click(submenuTrigger);

      await waitFor(() => {
        const hostB = document.querySelector('#submenu-dynamic-b');
        expect(hostB?.querySelector('[data-testid="submenu"]')).toBeInTheDocument();
      });
    });
  });
});

describe('NgpSubmenuTrigger dynamic content', () => {
  const template = `
    <button [ngpMenuTrigger]="menu" data-testid="root-trigger">Open Menu</button>

    <ng-template #menu>
      <div ngpMenu>
        <button [ngpSubmenuTrigger]="useFirst ? first : second" ngpMenuItem data-testid="submenu-trigger">
          Open Submenu
        </button>
      </div>
    </ng-template>

    <ng-template #first>
      <div ngpMenu data-testid="submenu">
        <button ngpMenuItem>First item</button>
      </div>
    </ng-template>
    <ng-template #second>
      <div ngpMenu data-testid="submenu">
        <button ngpMenuItem>Second item</button>
      </div>
    </ng-template>
  `;

  it('should swap the open submenu when the reference changes', async () => {
    const { fixture, getByTestId } = await render(template, {
      imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem, NgpSubmenuTrigger],
      componentProperties: { useFirst: true },
    });

    fireEvent.click(getByTestId('root-trigger'));
    await waitFor(() => expect(document.querySelector('[ngpMenu]')).toBeInTheDocument());

    fireEvent.click(document.querySelector('[data-testid="submenu-trigger"]') as HTMLElement);
    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: 'First item' })).toHaveFocus();
    });

    fixture.componentInstance.useFirst = false;
    fixture.detectChanges();

    await waitFor(() => {
      const submenus = document.querySelectorAll('[data-testid="submenu"]');
      expect(submenus).toHaveLength(1);
      expect(screen.getByRole('menuitem', { name: 'Second item' })).toHaveFocus();
    });
  });
});

describe('NgpSubmenuTrigger click activation', () => {
  async function openRootMenu() {
    const { fixture, getByTestId } = await render(TestSubmenuComponent);
    fixture.autoDetectChanges(true);

    fireEvent.click(getByTestId('root-trigger'));

    await waitFor(() => {
      expect(document.querySelector('[data-testid="submenu-trigger"]')).toBeInTheDocument();
    });

    return document.querySelector('[data-testid="submenu-trigger"]') as HTMLElement;
  }

  async function expectSubmenuOpenAfterSettling(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(document.querySelector('[data-testid="submenu"]')).toBeInTheDocument();
  }

  it('should keep a hover-opened submenu open when its trigger is clicked with a mouse', async () => {
    const submenuTrigger = await openRootMenu();

    fireEvent.pointerEnter(submenuTrigger, { pointerType: 'mouse' });

    await waitFor(() => {
      expect(document.querySelector('[data-testid="submenu"]')).toBeInTheDocument();
    });

    fireEvent.pointerDown(submenuTrigger, { pointerType: 'mouse' });
    fireEvent.click(submenuTrigger, { detail: 1 });
    await expectSubmenuOpenAfterSettling();

    fireEvent.pointerDown(submenuTrigger, { pointerType: 'mouse' });
    fireEvent.click(submenuTrigger, { detail: 1 });
    await expectSubmenuOpenAfterSettling();
    expect(submenuTrigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('should open the submenu on a mouse click and keep it open on a second click', async () => {
    const submenuTrigger = await openRootMenu();

    fireEvent.pointerDown(submenuTrigger, { pointerType: 'mouse' });
    fireEvent.click(submenuTrigger, { detail: 1 });

    await waitFor(() => {
      expect(document.querySelector('[data-testid="submenu"]')).toBeInTheDocument();
    });

    fireEvent.pointerDown(submenuTrigger, { pointerType: 'mouse' });
    fireEvent.click(submenuTrigger, { detail: 1 });
    await expectSubmenuOpenAfterSettling();
  });

  it('should open the submenu on a touch tap and close it on a second tap', async () => {
    const submenuTrigger = await openRootMenu();

    fireEvent.pointerDown(submenuTrigger, { pointerType: 'touch' });
    fireEvent.click(submenuTrigger, { detail: 1 });

    await waitFor(() => {
      expect(document.querySelector('[data-testid="submenu"]')).toBeInTheDocument();
    });

    fireEvent.pointerDown(submenuTrigger, { pointerType: 'touch' });
    fireEvent.click(submenuTrigger, { detail: 1 });

    await waitFor(() => {
      expect(document.querySelector('[data-testid="submenu"]')).not.toBeInTheDocument();
    });
  });

  it.each([
    ['was cancelled', (trigger: HTMLElement) => fireEvent.pointerCancel(trigger)],
    [
      'was dragged off the trigger',
      (trigger: HTMLElement) => {
        fireEvent.pointerLeave(trigger, { pointerType: 'mouse', buttons: 1 });
        fireEvent.pointerEnter(trigger, { pointerType: 'mouse' });
      },
    ],
  ])(
    'should toggle on a click without a pointerdown after a mouse press that %s',
    async (_, endPress) => {
      const submenuTrigger = await openRootMenu();

      fireEvent.pointerEnter(submenuTrigger, { pointerType: 'mouse' });

      await waitFor(() => {
        expect(document.querySelector('[data-testid="submenu"]')).toBeInTheDocument();
      });

      fireEvent.pointerDown(submenuTrigger, { pointerType: 'mouse' });
      endPress(submenuTrigger);
      // e.g. a click forwarded from a <label for>
      fireEvent.click(submenuTrigger, { detail: 1 });

      await waitFor(() => {
        expect(document.querySelector('[data-testid="submenu"]')).not.toBeInTheDocument();
      });
    },
  );

  it('should toggle on a click after a secondary-button press', async () => {
    const submenuTrigger = await openRootMenu();

    fireEvent.pointerEnter(submenuTrigger, { pointerType: 'mouse' });

    await waitFor(() => {
      expect(document.querySelector('[data-testid="submenu"]')).toBeInTheDocument();
    });

    fireEvent.pointerDown(submenuTrigger, { pointerType: 'mouse', button: 2 });
    fireEvent.click(submenuTrigger, { detail: 1 });

    await waitFor(() => {
      expect(document.querySelector('[data-testid="submenu"]')).not.toBeInTheDocument();
    });
  });

  it('should still toggle the submenu on keyboard activation', async () => {
    const submenuTrigger = await openRootMenu();

    // Enter and Space on a button dispatch a click with detail 0.
    fireEvent.click(submenuTrigger, { detail: 0 });

    await waitFor(() => {
      expect(document.querySelector('[data-testid="submenu"]')).toBeInTheDocument();
    });

    fireEvent.click(submenuTrigger, { detail: 0 });

    await waitFor(() => {
      expect(document.querySelector('[data-testid="submenu"]')).not.toBeInTheDocument();
    });
  });
});

const ANIMATED_SUBMENU_TEMPLATE = `
    <button [ngpMenuTrigger]="menu" data-testid="root-trigger">Open Menu</button>

    <ng-template #menu>
      <div ngpMenu data-testid="root-menu">
        <button ngpMenuItem data-testid="item-1">Item 1</button>
        <button [ngpSubmenuTrigger]="submenu" ngpMenuItem data-testid="submenu-trigger">
          Open Submenu
        </button>
      </div>
    </ng-template>

    <ng-template #submenu>
      <div ngpMenu data-testid="submenu">
        <button ngpMenuItem data-testid="submenu-item-1">Submenu Item 1</button>
        <button ngpMenuItem data-testid="submenu-item-2">Submenu Item 2</button>
      </div>
    </ng-template>
  `;

// the submenu docs example animates its exit, which keeps a closing submenu's focus trap alive
const ANIMATED_SUBMENU_STYLES = `
    [ngpMenu][data-exit] {
      animation: menu-hide 50ms ease-out;
    }

    @keyframes menu-hide {
      to {
        opacity: 0;
      }
    }
  `;

@Component({
  template: ANIMATED_SUBMENU_TEMPLATE,
  styles: ANIMATED_SUBMENU_STYLES,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem, NgpSubmenuTrigger],
})
class TestAnimatedSubmenuComponent {}

// NgpSubmenuTrigger before NgpMenuItem: the trigger's click listener runs before the item's
@Component({
  template: ANIMATED_SUBMENU_TEMPLATE,
  styles: ANIMATED_SUBMENU_STYLES,
  imports: [NgpMenuTrigger, NgpMenu, NgpSubmenuTrigger, NgpMenuItem],
})
class TestAnimatedSubmenuTriggerFirstComponent {}

describe.each([
  ['the menu item', TestAnimatedSubmenuComponent],
  ['the submenu trigger', TestAnimatedSubmenuTriggerFirstComponent],
])(
  'NgpSubmenuTrigger focus after a click on a hover-opened submenu, %s listening first',
  (_, host) => {
    async function hoverOpenSubmenu() {
      const { fixture } = await render(host);
      fixture.autoDetectChanges(true);

      await userEvent.click(screen.getByTestId('root-trigger'));
      const submenuTrigger = await screen.findByTestId('submenu-trigger');

      await userEvent.hover(submenuTrigger);
      await waitFor(() => expect(screen.getByTestId('submenu-item-1')).toHaveFocus());

      return submenuTrigger;
    }

    it('should move focus into the submenu on a mouse click', async () => {
      const submenuTrigger = await hoverOpenSubmenu();

      await userEvent.click(submenuTrigger);

      await waitFor(() => expect(screen.getByTestId('submenu-item-1')).toHaveFocus());
    });

    it('should return focus to the menu trigger on Escape', async () => {
      const submenuTrigger = await hoverOpenSubmenu();

      await userEvent.click(submenuTrigger);
      await userEvent.keyboard('{Escape}');

      await waitFor(() => {
        expect(document.querySelector('[data-testid="root-menu"]')).not.toBeInTheDocument();
      });
      expect(screen.getByTestId('root-trigger')).toHaveFocus();
    });

    it('should move focus into the open submenu on ArrowRight', async () => {
      const submenuTrigger = await hoverOpenSubmenu();

      // a click now moves focus into the submenu, so put it back on the trigger directly
      submenuTrigger.focus();
      await userEvent.keyboard('{ArrowRight}');

      await waitFor(() => expect(screen.getByTestId('submenu-item-1')).toHaveFocus());
      expect(submenuTrigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('should move focus into the open submenu on ArrowLeft in RTL', async () => {
      const submenuTrigger = await hoverOpenSubmenu();
      submenuTrigger.style.direction = 'rtl';

      submenuTrigger.focus();
      await userEvent.keyboard('{ArrowLeft}');

      await waitFor(() => expect(screen.getByTestId('submenu-item-1')).toHaveFocus());
      expect(submenuTrigger).toHaveAttribute('aria-expanded', 'true');
    });
  },
);
