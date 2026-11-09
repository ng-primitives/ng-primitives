import { Component, signal, viewChild } from '@angular/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/angular';
import {
  NgpMenu,
  NgpMenuItem,
  NgpMenuTrigger,
  NgpMenuTriggerType,
  NgpSubmenuTrigger,
} from 'ng-primitives/menu';
import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

@Component({
  template: `
    <button
      #trigger="ngpMenuTrigger"
      [ngpMenuTrigger]="menu"
      [ngpMenuTriggerOpen]="open()"
      (ngpMenuTriggerOpenChange)="changes.push($event)"
      data-testid="trigger"
    >
      Trigger
    </button>
    <button (click)="open.set(true)" data-testid="open-from-code">Open from code</button>

    <ng-template #menu>
      <div ngpMenu data-testid="menu">
        <button ngpMenuItem data-testid="rename">Rename</button>
        <button [ngpSubmenuTrigger]="submenu" ngpMenuItem data-testid="share">Share</button>
      </div>
    </ng-template>

    <ng-template #submenu>
      <div ngpMenu data-testid="submenu">
        <button ngpMenuItem data-testid="email">Email</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem, NgpSubmenuTrigger],
})
class BoundWithSubmenuComponent {
  readonly open = signal<boolean | undefined>(false);
  readonly changes: boolean[] = [];
  readonly trigger = viewChild.required<NgpMenuTrigger>('trigger');
}

@Component({
  template: `
    <button
      [(ngpMenuTriggerOpen)]="open"
      [ngpMenuTrigger]="menu"
      (ngpMenuTriggerOpenChange)="changes.push($event)"
      data-testid="trigger"
    >
      Trigger
    </button>

    <ng-template #menu>
      <div ngpMenu data-testid="menu">
        <button [ngpSubmenuTrigger]="submenu" ngpMenuItem data-testid="share">Share</button>
      </div>
    </ng-template>

    <ng-template #submenu>
      <div ngpMenu data-testid="submenu">
        <button ngpMenuItem data-testid="email">Email</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem, NgpSubmenuTrigger],
})
class TwoWayWithSubmenuComponent {
  readonly open = signal(false);
  readonly changes: boolean[] = [];
}

@Component({
  template: `
    <button
      #trigger="ngpMenuTrigger"
      [ngpMenuTrigger]="menu"
      [ngpMenuTriggerOpenTriggers]="triggers"
      [ngpMenuTriggerShowDelay]="showDelay"
      (ngpMenuTriggerOpenChange)="changes.push($event)"
      data-testid="trigger"
    >
      Trigger
    </button>

    <ng-template #menu>
      <div ngpMenu data-testid="menu">
        <button ngpMenuItem data-testid="rename">Rename</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem],
})
class UnboundComponent {
  triggers: NgpMenuTriggerType[] = ['click'];
  showDelay = 0;
  readonly changes: boolean[] = [];
  readonly trigger = viewChild.required<NgpMenuTrigger>('trigger');
}

@Component({
  template: `
    <button
      [ngpMenuTrigger]="menu"
      [ngpMenuTriggerOpen]="open()"
      (ngpMenuTriggerOpenChange)="changes.push($event)"
      ngpMenuTriggerShowDelay="1000"
      data-testid="trigger"
    >
      Trigger
    </button>

    <ng-template #menu>
      <div ngpMenu data-testid="menu">
        <button ngpMenuItem>Rename</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem],
})
class BoundShowDelayComponent {
  readonly open = signal(false);
  readonly changes: boolean[] = [];
}

@Component({
  template: `
    <button [ngpMenuTrigger]="alternate() ? other : menu" ngpMenuTriggerDefaultOpen>Trigger</button>

    <ng-template #menu>
      <div ngpMenu data-testid="menu"><button ngpMenuItem>Rename</button></div>
    </ng-template>
    <ng-template #other>
      <div ngpMenu data-testid="menu"><button ngpMenuItem>Archive</button></div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem],
})
class DefaultOpenSwapComponent {
  readonly alternate = signal(false);
}

@Component({
  template: `
    <button [ngpMenuTrigger]="loaded() ? menu : undefined" ngpMenuTriggerDefaultOpen>
      Trigger
    </button>

    <ng-template #menu>
      <div ngpMenu data-testid="menu"><button ngpMenuItem>Rename</button></div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem],
})
class DefaultOpenLateContentComponent {
  readonly loaded = signal(false);
}

@Component({
  template: `
    <button
      [ngpMenuTrigger]="menu"
      [ngpMenuTriggerOpen]="true"
      (ngpMenuTriggerOpenChange)="changes.push($event)"
      data-testid="bound"
    >
      Bound
    </button>
    <button #other="ngpMenuTrigger" [ngpMenuTrigger]="otherMenu" data-testid="other">Other</button>

    <ng-template #menu>
      <div ngpMenu data-testid="menu"><button ngpMenuItem>Rename</button></div>
    </ng-template>
    <ng-template #otherMenu>
      <div ngpMenu data-testid="other-menu"><button ngpMenuItem>Archive</button></div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem],
})
class TakeoverComponent {
  readonly changes: boolean[] = [];
  readonly other = viewChild.required<NgpMenuTrigger>('other');
}

@Component({
  template: `
    <button
      [ngpMenuTrigger]="menu"
      [ngpMenuTriggerOpen]="open()"
      (ngpMenuTriggerOpenChange)="changes.push($event)"
      ngpMenuTriggerHideDelay="1000"
      data-testid="trigger"
    >
      Trigger
    </button>

    <ng-template #menu>
      <div ngpMenu data-testid="menu">
        <button [ngpSubmenuTrigger]="submenu" ngpMenuItem data-testid="share">Share</button>
      </div>
    </ng-template>

    <ng-template #submenu>
      <div ngpMenu data-testid="submenu">
        <button ngpMenuItem data-testid="email">Email</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem, NgpSubmenuTrigger],
})
class HideDelayWithSubmenuComponent {
  readonly open = signal<boolean | undefined>(undefined);
  readonly changes: boolean[] = [];
}

/** Releases for every held exit animation, so no overlay is left mid-close for later tests. */
const releases: (() => void)[] = [];

/** An exit animation that settles only once released, holding the menu mid-close. */
function heldAnimation(): Animation {
  let release!: () => void;
  const finished = new Promise<void>(resolve => (release = resolve));
  releases.push(release);
  return {
    finished,
    cancel: () => undefined,
    finish: () => undefined,
    effect: { getComputedTiming: () => ({ iterations: 1, endTime: 100_000 }) },
  } as unknown as Animation;
}

const byId = (id: string) => screen.getByTestId(id);
const present = (id: string) => !!screen.queryByTestId(id);
const settle = () => new Promise(resolve => setTimeout(resolve, 50));

/** Hold the open menu (or submenu) in its exit animation once it starts closing. */
function holdExitAnimation(id = 'menu'): HTMLElement {
  const element = byId(id);
  const animation = heldAnimation();
  element.getAnimations = () => [animation];
  return element;
}

/** Hold the open menu in its exit animation until the returned function is called. */
function holdExitAnimationUntilReleased(): () => void {
  holdExitAnimation();
  return releases[releases.length - 1];
}

describe('NgpMenuTrigger open binding, interactions', () => {
  afterEach(async () => {
    releases.splice(0).forEach(release => release());
    await settle();
    document.querySelectorAll('[ngpMenu]').forEach(el => el.remove());

    // the real pointer stays where a test left it, across files: park it away from fixtures
    const corner = document.body.appendChild(document.createElement('div'));
    corner.style.cssText = 'position: fixed; right: 0; bottom: 0; width: 4px; height: 4px;';
    await userEvent.hover(corner);
    corner.remove();
  });

  describe('focus origin of an open the binding makes', () => {
    it('shows the focus ring when the binding was set from the keyboard', async () => {
      await render(BoundWithSubmenuComponent);
      byId('trigger').focus();
      await userEvent.keyboard('{Tab}');
      expect(document.activeElement).toBe(byId('open-from-code'));

      await userEvent.keyboard('{Enter}');

      await waitFor(() => expect(byId('rename')).toHaveAttribute('data-focus-visible'));
    });

    it('shows no focus ring when the binding was set from a pointer press', async () => {
      await render(BoundWithSubmenuComponent);

      await userEvent.click(byId('open-from-code'));

      await waitFor(() => expect(document.activeElement).toBe(byId('rename')));
      expect(byId('rename')).not.toHaveAttribute('data-focus-visible');
    });

    it('shows the focus ring after a declined keyboard press on the trigger', async () => {
      const { fixture } = await render(BoundWithSubmenuComponent);
      byId('open-from-code').focus();
      await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
      expect(document.activeElement).toBe(byId('trigger'));
      await userEvent.keyboard('{Enter}');
      await settle();
      expect(fixture.componentInstance.changes).toEqual([true]);

      fixture.componentInstance.open.set(true);
      fixture.detectChanges();

      await waitFor(() => expect(byId('rename')).toHaveAttribute('data-focus-visible'));
    });
  });

  describe('submenus', () => {
    async function openSubmenu(): Promise<void> {
      await waitFor(() => expect(present('menu')).toBe(true));
      byId('share').focus();
      await userEvent.keyboard('{ArrowRight}');
      await waitFor(() => expect(document.activeElement).toBe(byId('email')));
    }

    it('keeps the submenu open when the binding declines an Escape', async () => {
      const { fixture } = await render(BoundWithSubmenuComponent, {
        componentProperties: { open: signal(true) },
      });
      await openSubmenu();

      await userEvent.keyboard('{Escape}');
      await settle();

      expect(fixture.componentInstance.changes).toEqual([false]);
      expect({ menu: present('menu'), submenu: present('submenu') }).toEqual({
        menu: true,
        submenu: true,
      });
      expect(document.activeElement).toBe(byId('email'));
    });

    it('keeps the submenu open when the binding declines an item selection', async () => {
      const { fixture } = await render(BoundWithSubmenuComponent, {
        componentProperties: { open: signal(true) },
      });
      await openSubmenu();

      await userEvent.click(byId('email'));
      await settle();

      expect(fixture.componentInstance.changes).toEqual([false]);
      expect(present('submenu')).toBe(true);
    });

    it('unbound: closes the submenu at once on an item selection, and the root after its delay', async () => {
      await render(HideDelayWithSubmenuComponent);
      await userEvent.click(byId('trigger'));
      await openSubmenu();

      await userEvent.click(byId('email'));
      await new Promise(resolve => setTimeout(resolve, 200));

      expect({ menu: present('menu'), submenu: present('submenu') }).toEqual({
        menu: true,
        submenu: false,
      });
    });

    it('unbound: lets the submenu play its exit animation when an item closes the chain', async () => {
      await render(HideDelayWithSubmenuComponent);
      await userEvent.click(byId('trigger'));
      await openSubmenu();
      const submenu = holdExitAnimation('submenu');

      await userEvent.click(byId('email'));
      await settle();

      expect(submenu.isConnected).toBe(true);
      expect(submenu).toHaveAttribute('data-exit');
    });

    it('unbound: lets the submenu play its exit animation on Escape', async () => {
      await render(HideDelayWithSubmenuComponent);
      await userEvent.click(byId('trigger'));
      await openSubmenu();
      const submenu = holdExitAnimation('submenu');

      await userEvent.keyboard('{Escape}');
      await settle();

      expect(submenu.isConnected).toBe(true);
      expect(submenu).toHaveAttribute('data-exit');
    });

    it('bound: reports an Escape in a submenu without waiting for the hide delay', async () => {
      const { fixture } = await render(HideDelayWithSubmenuComponent, {
        componentProperties: { open: signal(true) },
      });
      await openSubmenu();

      await userEvent.keyboard('{Escape}');
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(fixture.componentInstance.changes).toEqual([false]);
    });

    it('bound: closes from the binding without waiting for the hide delay', async () => {
      const { fixture } = await render(HideDelayWithSubmenuComponent, {
        componentProperties: { open: signal(true) },
      });
      await waitFor(() => expect(present('menu')).toBe(true));

      fixture.componentInstance.open.set(false);
      fixture.detectChanges();
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(present('menu')).toBe(false);
      expect(fixture.componentInstance.changes).toEqual([]);
    });

    it('closes the submenu with the menu when a two-way binding accepts', async () => {
      const { fixture } = await render(TwoWayWithSubmenuComponent);
      await userEvent.click(byId('trigger'));
      await openSubmenu();

      await userEvent.keyboard('{Escape}');

      await waitFor(() =>
        expect({ menu: present('menu'), submenu: present('submenu') }).toEqual({
          menu: false,
          submenu: false,
        }),
      );
      expect(fixture.componentInstance.open()).toBe(false);
      expect(fixture.componentInstance.changes).toEqual([true, false]);
      expect(document.activeElement).toBe(byId('trigger'));
    });
  });

  describe('exit animation', () => {
    it('reopens on a trigger press during the exit animation', async () => {
      const { fixture } = await render(UnboundComponent);
      await userEvent.click(byId('trigger'));
      await waitFor(() => expect(present('menu')).toBe(true));
      const element = holdExitAnimation();

      fireEvent.keyDown(element, { key: 'Escape' });
      await waitFor(() => expect(element).toHaveAttribute('data-exit'));
      await userEvent.click(byId('trigger'));

      await waitFor(() => expect(element).not.toHaveAttribute('data-exit'));
      expect(fixture.componentInstance.changes).toEqual([true, false, true]);
    });

    it('reopens on Enter during the exit animation', async () => {
      const { fixture } = await render(UnboundComponent, {
        componentProperties: { triggers: ['enter'] },
      });
      byId('trigger').focus();
      await userEvent.keyboard('{Enter}');
      await waitFor(() => expect(present('menu')).toBe(true));
      const element = holdExitAnimation();

      fireEvent.keyDown(element, { key: 'Escape' });
      await waitFor(() => expect(element).toHaveAttribute('data-exit'));
      byId('trigger').focus();
      await userEvent.keyboard('{Enter}');

      await waitFor(() => expect(element).not.toHaveAttribute('data-exit'));
      expect(fixture.componentInstance.changes).toEqual([true, false, true]);
    });

    it('reports the close once when Escape is pressed again during the exit animation', async () => {
      const { fixture } = await render(UnboundComponent);
      await userEvent.click(byId('trigger'));
      await waitFor(() => expect(present('menu')).toBe(true));
      const element = holdExitAnimation();

      fireEvent.keyDown(element, { key: 'Escape' });
      await waitFor(() => expect(element).toHaveAttribute('data-exit'));
      fireEvent.keyDown(element, { key: 'Escape' });
      await settle();

      expect(fixture.componentInstance.changes).toEqual([true, false]);
    });

    it('reports the close once when hide() is called during the exit animation', async () => {
      const { fixture } = await render(UnboundComponent);
      await userEvent.click(byId('trigger'));
      await waitFor(() => expect(present('menu')).toBe(true));
      const element = holdExitAnimation();

      fireEvent.keyDown(element, { key: 'Escape' });
      await waitFor(() => expect(element).toHaveAttribute('data-exit'));
      fixture.componentInstance.trigger().hide();
      await settle();

      expect(fixture.componentInstance.changes).toEqual([true, false]);
    });

    it('reports an open after a press the binding declined during the exit animation', async () => {
      const { fixture } = await render(BoundWithSubmenuComponent, {
        componentProperties: { open: signal<boolean | undefined>(true) },
      });
      const host = fixture.componentInstance;
      await waitFor(() => expect(present('menu')).toBe(true));
      const release = holdExitAnimationUntilReleased();

      host.open.set(false);
      fixture.detectChanges();
      await waitFor(() => expect(byId('menu')).toHaveAttribute('data-exit'));
      await userEvent.click(byId('trigger'));
      await settle();
      expect(host.changes).toEqual([true]);

      release();
      await waitFor(() => expect(present('menu')).toBe(false));
      host.open.set(undefined);
      fixture.detectChanges();
      await userEvent.click(byId('trigger'));

      await waitFor(() => expect(present('menu')).toBe(true));
      expect(host.changes).toEqual([true, true]);
    });

    it('reports the reopen when the pointer comes back during the exit animation', async () => {
      const { fixture } = await render(UnboundComponent, {
        componentProperties: { triggers: ['hover'] },
      });
      const trigger = byId('trigger');
      fireEvent.pointerEnter(trigger, { pointerType: 'mouse' });
      await waitFor(() => expect(present('menu')).toBe(true));
      const element = holdExitAnimation();

      // leave away from the menu, so no safe-polygon corridor keeps it open
      fireEvent.pointerLeave(trigger, { pointerType: 'mouse', clientX: -100, clientY: -100 });
      fireEvent.pointerMove(document, { pointerType: 'mouse', clientX: -200, clientY: -200 });
      await waitFor(() => expect(element).toHaveAttribute('data-exit'), { timeout: 2000 });
      fireEvent.pointerEnter(trigger, { pointerType: 'mouse' });

      await waitFor(() => expect(element).not.toHaveAttribute('data-exit'));
      expect(fixture.componentInstance.changes).toEqual([true, false, true]);
    });
  });

  describe('reporting', () => {
    it('reports each open after a close', async () => {
      const { fixture } = await render(UnboundComponent);

      await userEvent.click(byId('trigger'));
      await waitFor(() => expect(present('menu')).toBe(true));
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(present('menu')).toBe(false));
      await userEvent.click(byId('trigger'));
      await waitFor(() => expect(present('menu')).toBe(true));

      expect(fixture.componentInstance.changes).toEqual([true, false, true]);
    });

    it('does not report an open the binding made once the binding is cleared', async () => {
      const { fixture } = await render(BoundWithSubmenuComponent, {
        componentProperties: { open: signal<boolean | undefined>(true) },
      });
      await waitFor(() => expect(present('menu')).toBe(true));

      fixture.componentInstance.open.set(undefined);
      fixture.detectChanges();
      fixture.componentInstance.trigger().show();
      await settle();

      expect(fixture.componentInstance.changes).toEqual([]);
    });

    it('reports two show() calls inside the show delay once', async () => {
      const { fixture } = await render(UnboundComponent, {
        componentProperties: { showDelay: 50 },
      });
      const trigger = fixture.componentInstance.trigger();

      trigger.show();
      trigger.show();

      await waitFor(() => expect(present('menu')).toBe(true));
      await settle();
      expect(fixture.componentInstance.changes).toEqual([true]);
    });

    it('reports a close when another menu takes over', async () => {
      const { fixture } = await render(TakeoverComponent);
      await waitFor(() => expect(present('menu')).toBe(true));

      // opened from code, so no outside press asks the bound menu to close first
      fixture.componentInstance.other().show();

      await waitFor(() => expect(present('other-menu')).toBe(true));
      await waitFor(() => expect(present('menu')).toBe(false));
      expect(fixture.componentInstance.changes).toEqual([false]);
    });
  });

  it('opens from the binding without the show delay', async () => {
    const { fixture } = await render(BoundShowDelayComponent);

    fixture.componentInstance.open.set(true);
    fixture.detectChanges();

    await new Promise(resolve => setTimeout(resolve, 200));
    expect(present('menu')).toBe(true);
    expect(fixture.componentInstance.changes).toEqual([]);
  });

  it('opens on the first render only for defaultOpen', async () => {
    const { fixture } = await render(DefaultOpenSwapComponent);
    await waitFor(() => expect(present('menu')).toBe(true));
    fireEvent.keyDown(byId('menu'), { key: 'Escape' });
    await waitFor(() => expect(present('menu')).toBe(false));

    fixture.componentInstance.alternate.set(true);
    fixture.detectChanges();
    await settle();

    expect(present('menu')).toBe(false);
  });

  it('opens for defaultOpen once content arrives after the first render, and only once', async () => {
    const { fixture } = await render(DefaultOpenLateContentComponent);
    await settle();
    expect(present('menu')).toBe(false);

    fixture.componentInstance.loaded.set(true);
    fixture.detectChanges();
    await waitFor(() => expect(present('menu')).toBe(true));

    fireEvent.keyDown(byId('menu'), { key: 'Escape' });
    await waitFor(() => expect(present('menu')).toBe(false));
    fixture.componentInstance.loaded.set(false);
    fixture.detectChanges();
    fixture.componentInstance.loaded.set(true);
    fixture.detectChanges();
    await settle();

    expect(present('menu')).toBe(false);
  });
});
