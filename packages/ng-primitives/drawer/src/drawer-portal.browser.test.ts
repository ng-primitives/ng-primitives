import { Component, signal, viewChild, viewChildren } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Event as RouterEvent, NavigationStart, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { userEvent } from 'vitest/browser';
import { NgpDrawerBackdrop } from './backdrop/drawer-backdrop';
import { NgpDrawerDescription } from './description/drawer-description';
import { NgpDrawer } from './drawer/drawer';
import { createDrawerHandle } from './handle/drawer-handle';
import { NgpDrawerPopup } from './popup/drawer-popup';
import { NgpDrawerPortal } from './portal/drawer-portal';
import { NgpDrawerTitle } from './title/drawer-title';
import { NgpDrawerViewport } from './viewport/drawer-viewport';

@Component({
  imports: [
    NgpDrawerBackdrop,
    NgpDrawerDescription,
    NgpDrawerPopup,
    NgpDrawerPortal,
    NgpDrawer,
    NgpDrawerTitle,
    NgpDrawerViewport,
  ],
  template: `
    <div #customContainer data-test-custom-container="first">
      <span data-consumer-child>Preserve me</span>
    </div>
    <div #customContainerB data-test-custom-container="second">
      <span data-consumer-child>Preserve me too</span>
    </div>
    <ng-container [handle]="handle" ngpDrawer>
      <ng-template
        [container]="custom() === 1 ? customContainer : custom() === 2 ? customContainerB : null"
        [keepMounted]="keepMounted()"
        ngpDrawerPortal
      >
        <div data-test-backdrop ngpDrawerBackdrop></div>
        <div data-test-viewport ngpDrawerViewport>
          <section [class.rapid-cycle-motion]="rapidCycleMotion()" data-test-popup ngpDrawerPopup>
            <h2 ngpDrawerTitle>Drawer</h2>
            <p ngpDrawerDescription>Description</p>
          </section>
        </div>
      </ng-template>
    </ng-container>
  `,
  styles: `
    :host {
      display: block;
      min-height: 200vh;
    }
    .rapid-cycle-motion {
      opacity: 1;
      transition: opacity 160ms linear;
    }
    .rapid-cycle-motion[data-starting-style],
    .rapid-cycle-motion[data-ending-style] {
      opacity: 0;
    }
  `,
})
class PortalHost {
  readonly handle = createDrawerHandle<{ id: string }>();
  readonly custom = signal<0 | 1 | 2>(0);
  readonly keepMounted = signal(false);
  readonly rapidCycleMotion = signal(false);
  readonly root = viewChild.required(NgpDrawer);
}

@Component({
  imports: [NgpDrawerBackdrop, NgpDrawerPopup, NgpDrawerPortal, NgpDrawer, NgpDrawerViewport],
  template: `
    <button class="page-button" (click)="pageClicks = pageClicks + 1" data-test-page-button>
      Page
    </button>
    <ng-container [disablePointerDismissal]="true" [modal]="false" ngpDrawer>
      <ng-template ngpDrawerPortal>
        <div class="backdrop" data-test-backdrop ngpDrawerBackdrop></div>
        <div class="viewport" ngpDrawerViewport>
          <section class="popup" data-test-popup ngpDrawerPopup>Drawer</section>
        </div>
      </ng-template>
    </ng-container>
  `,
  styles: `
    .page-button {
      position: fixed;
      top: 16px;
      left: 16px;
    }
    .backdrop {
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100px;
      height: 100px;
    }
    .viewport {
      position: fixed;
      inset: 0;
      pointer-events: none;
    }
    .popup {
      position: fixed;
      top: 0;
      right: 0;
      width: 200px;
      height: 100%;
      pointer-events: auto;
    }
  `,
})
class NonModalHitTestHost {
  pageClicks = 0;
  readonly root = viewChild.required(NgpDrawer);
}

@Component({
  imports: [NgpDrawerPopup, NgpDrawerPortal, NgpDrawer, NgpDrawerViewport],
  template: `
    <ng-container [modal]="false" ngpDrawer>
      <ng-template keepMounted ngpDrawerPortal>
        <div data-test-kept-viewport ngpDrawerViewport>
          <section ngpDrawerPopup>Kept</section>
        </div>
      </ng-template>
    </ng-container>
    <ng-container ngpDrawer>
      <ng-template ngpDrawerPortal>
        <div data-test-modal-viewport ngpDrawerViewport>
          <section ngpDrawerPopup>Modal</section>
        </div>
      </ng-template>
    </ng-container>
  `,
})
class KeptUnderModalHost {
  readonly roots = viewChildren(NgpDrawer);
}

function hitTargetAtCenter(element: Element): Element | null {
  const rect = element.getBoundingClientRect();
  return document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
}

describe('NgpDrawerPortal', () => {
  let fixture: ComponentFixture<PortalHost>;
  let routerEvents: Subject<RouterEvent>;

  beforeEach(async () => {
    routerEvents = new Subject<RouterEvent>();
    await TestBed.configureTestingModule({
      imports: [PortalHost],
      providers: [{ provide: Router, useValue: { events: routerEvents } }],
    }).compileComponents();
    fixture = TestBed.createComponent(PortalHost);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    document
      .querySelectorAll('[data-ngp-drawer-custom-host], [data-ngp-drawer-overlay-host]')
      .forEach(element => element.remove());
  });

  it('attaches to a fullscreen body overlay and publishes lifecycle state', async () => {
    fixture.componentInstance.root().show();
    fixture.detectChanges();

    await vi.waitFor(() => {
      expect(document.querySelector('[data-ngp-drawer-overlay-host]')).not.toBeNull();
      expect(document.querySelector('[data-test-popup]')?.getAttribute('data-open')).toBe('');
    });

    const pane = document.querySelector<HTMLElement>('[data-ngp-drawer-overlay-host]');
    expect(pane?.parentElement).toBe(document.body);
    expect(pane?.style.position).toBe('fixed');
    expect(pane?.style.width).toBe('100%');
    expect(pane?.style.height).toBe('100%');
    expect(pane?.contains(document.querySelector('[data-test-popup]'))).toBe(true);
  });

  it('uses a library-owned custom host without mutating consumer children', async () => {
    fixture.componentInstance.custom.set(1);
    fixture.componentInstance.root().show();
    fixture.detectChanges();

    await vi.waitFor(() =>
      expect(fixture.nativeElement.querySelector('[data-ngp-drawer-custom-host]')).not.toBeNull(),
    );
    const container = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(
      '[data-test-custom-container="first"]',
    )!;
    expect(container.querySelector('[data-consumer-child]')?.textContent).toContain('Preserve me');
    expect(container.children).toHaveLength(2);

    fixture.componentInstance.root().hide();
    fixture.detectChanges();
    await vi.waitFor(() =>
      expect(container.querySelector('[data-ngp-drawer-custom-host]')).toBeNull(),
    );
    expect(container.children).toHaveLength(1);
  });

  it('retains a hidden inert view with keepMounted', async () => {
    fixture.componentInstance.keepMounted.set(true);
    fixture.componentInstance.root().show();
    fixture.detectChanges();
    await vi.waitFor(() =>
      expect(document.querySelector('[data-ngp-drawer-overlay-host]')).not.toBeNull(),
    );

    fixture.componentInstance.root().hide();
    fixture.detectChanges();
    await vi.waitFor(() => {
      const host = document.querySelector<HTMLElement>('[data-ngp-drawer-overlay-host]');
      expect(host?.hidden).toBe(true);
      expect(host?.inert).toBe(true);
    });
  });

  it('moves a reopened kept-mounted host in front of later overlays', async () => {
    fixture.componentInstance.keepMounted.set(true);
    fixture.componentInstance.root().show();
    fixture.detectChanges();
    await vi.waitFor(() =>
      expect(document.querySelector('[data-test-popup]')?.getAttribute('data-open')).toBe(''),
    );
    const host = document.querySelector<HTMLElement>('[data-ngp-drawer-overlay-host]')!;
    const popup = document.querySelector('[data-test-popup]');

    fixture.componentInstance.root().hide();
    fixture.detectChanges();
    await vi.waitFor(() => expect(host.hidden).toBe(true));

    const laterOverlay = document.createElement('div');
    document.body.append(laterOverlay);
    try {
      fixture.componentInstance.root().show();
      fixture.detectChanges();
      await vi.waitFor(() => expect(host.hidden).toBe(false));

      expect(document.body.lastElementChild).toBe(host);
      expect(document.querySelectorAll('[data-ngp-drawer-overlay-host]')).toHaveLength(1);
      expect(document.querySelector('[data-test-popup]')).toBe(popup);
    } finally {
      laterOverlay.remove();
    }
  });

  it('authoritatively unmounts an open modal and releases its stack effects', async () => {
    const completed: boolean[] = [];
    fixture.componentInstance.root().openChangeComplete.subscribe(value => completed.push(value));
    fixture.componentInstance.root().show();
    fixture.detectChanges();
    await vi.waitFor(() =>
      expect(document.querySelector('[data-ngp-drawer-overlay-host]')).not.toBeNull(),
    );
    fixture.detectChanges();
    await vi.waitFor(() => expect(document.documentElement).toHaveAttribute('data-scrollblock'));

    fixture.componentInstance.root().unmount();
    fixture.detectChanges();

    await vi.waitFor(() => {
      expect(document.querySelector('[data-ngp-drawer-overlay-host]')).toBeNull();
      expect(document.documentElement).not.toHaveAttribute('data-scrollblock');
      expect(fixture.componentInstance.root().open()).toBe(false);
      expect(fixture.componentInstance.root().mounted()).toBe(false);
      expect(completed).not.toContain(false);
    });
  });

  it('detaches a retained closed view when keepMounted becomes false', async () => {
    fixture.componentInstance.keepMounted.set(true);
    fixture.componentInstance.root().show();
    fixture.detectChanges();
    await vi.waitFor(() =>
      expect(document.querySelector('[data-ngp-drawer-overlay-host]')).not.toBeNull(),
    );

    fixture.componentInstance.root().hide();
    fixture.detectChanges();
    await vi.waitFor(() =>
      expect(document.querySelector<HTMLElement>('[data-ngp-drawer-overlay-host]')?.hidden).toBe(
        true,
      ),
    );

    fixture.componentInstance.keepMounted.set(false);
    fixture.detectChanges();

    await vi.waitFor(() => {
      expect(document.querySelector('[data-ngp-drawer-overlay-host]')).toBeNull();
      expect(fixture.componentInstance.root().mounted()).toBe(false);
    });
  });

  it('closes and releases its stack effects when the router navigates', async () => {
    const completed: boolean[] = [];
    fixture.componentInstance.root().openChangeComplete.subscribe(value => completed.push(value));
    fixture.componentInstance.root().show();
    fixture.detectChanges();
    await vi.waitFor(() =>
      expect(document.querySelector('[data-ngp-drawer-overlay-host]')).not.toBeNull(),
    );
    fixture.detectChanges();
    await vi.waitFor(() => expect(document.documentElement).toHaveAttribute('data-scrollblock'));

    routerEvents.next(new NavigationStart(1, '/next'));
    fixture.detectChanges();

    await vi.waitFor(() => {
      expect(document.querySelector('[data-ngp-drawer-overlay-host]')).toBeNull();
      expect(document.documentElement).not.toHaveAttribute('data-scrollblock');
      expect(fixture.componentInstance.root().open()).toBe(false);
      expect(fixture.componentInstance.root().mounted()).toBe(false);
      expect(completed).toContain(false);
    });
  });

  it('moves a retained hidden custom host without duplicating or showing it', async () => {
    fixture.componentInstance.custom.set(1);
    fixture.componentInstance.keepMounted.set(true);
    fixture.componentInstance.root().show();
    fixture.detectChanges();
    const first = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(
      '[data-test-custom-container="first"]',
    )!;
    const second = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(
      '[data-test-custom-container="second"]',
    )!;
    await vi.waitFor(() =>
      expect(first.querySelector('[data-ngp-drawer-custom-host]')).not.toBeNull(),
    );

    fixture.componentInstance.root().hide();
    fixture.detectChanges();
    await vi.waitFor(() =>
      expect(first.querySelector<HTMLElement>('[data-ngp-drawer-custom-host]')?.hidden).toBe(true),
    );

    fixture.componentInstance.custom.set(2);
    fixture.detectChanges();

    await vi.waitFor(() => {
      const moved = second.querySelector<HTMLElement>('[data-ngp-drawer-custom-host]');
      expect(first.querySelector('[data-ngp-drawer-custom-host]')).toBeNull();
      expect(moved?.hidden).toBe(true);
      expect(moved?.inert).toBe(true);
      expect(document.querySelectorAll('[data-ngp-drawer-custom-host]')).toHaveLength(1);
      expect(fixture.componentInstance.root().open()).toBe(false);
      expect(fixture.componentInstance.root().mounted()).toBe(true);
    });

    fixture.componentInstance.keepMounted.set(false);
    fixture.detectChanges();
    await vi.waitFor(() => {
      expect(document.querySelectorAll('[data-ngp-drawer-custom-host]')).toHaveLength(0);
      expect(fixture.componentInstance.root().mounted()).toBe(false);
    });
  });

  it('invalidates a stale exit when reopened and cleans up on destroy', async () => {
    fixture.componentInstance.root().show();
    fixture.detectChanges();
    await vi.waitFor(() =>
      expect(document.querySelector('[data-ngp-drawer-overlay-host]')).not.toBeNull(),
    );

    fixture.componentInstance.root().hide();
    fixture.componentInstance.root().show();
    fixture.detectChanges();
    await vi.waitFor(() => {
      const host = document.querySelector<HTMLElement>('[data-ngp-drawer-overlay-host]');
      expect(host).not.toBeNull();
      expect(host?.hidden).toBe(false);
    });

    fixture.destroy();
    expect(document.querySelector('[data-ngp-drawer-overlay-host]')).toBeNull();
  });

  it('supersedes a rapid close and reopen without stale completion or payload', async () => {
    const before: boolean[] = [];
    const completed: boolean[] = [];
    const host = fixture.componentInstance;
    host.rapidCycleMotion.set(true);
    host.root().beforeOpenChange.subscribe(event => before.push(event.nextOpen));
    host.root().openChangeComplete.subscribe(value => completed.push(value));

    host.handle.open({ id: 'A' });
    fixture.detectChanges();
    await vi.waitFor(() => expect(completed).toEqual([true]));

    host.handle.close();
    fixture.detectChanges();
    await vi.waitFor(() =>
      expect(document.querySelector('[data-test-popup]')).toHaveAttribute('data-ending-style'),
    );

    host.handle.open({ id: 'B' });
    fixture.detectChanges();

    expect(host.handle.opened()).toBe(true);
    expect(host.handle.payload()).toEqual({ id: 'B' });
    expect(document.querySelectorAll('[data-ngp-drawer-overlay-host]')).toHaveLength(1);
    expect(completed).toEqual([true]);

    await vi.waitFor(() => expect(completed).toEqual([true, true]));
    expect(before).toEqual([true, false, true]);
    expect(completed).not.toContain(false);
    expect(host.root().open()).toBe(true);
    expect(host.handle.payload()).toEqual({ id: 'B' });
    expect(document.querySelectorAll('[data-ngp-drawer-overlay-host]')).toHaveLength(1);
  });

  it('lets page clicks through the overlay host while its parts stay targetable', async () => {
    const hitFixture = TestBed.createComponent(NonModalHitTestHost);
    hitFixture.detectChanges();
    try {
      hitFixture.componentInstance.root().show();
      hitFixture.detectChanges();
      await vi.waitFor(() =>
        expect(document.querySelector('[data-test-popup]')?.getAttribute('data-open')).toBe(''),
      );
      const pageButton = (hitFixture.nativeElement as HTMLElement).querySelector<HTMLElement>(
        '[data-test-page-button]',
      )!;
      const popup = document.querySelector<HTMLElement>('[data-test-popup]')!;
      const backdrop = document.querySelector<HTMLElement>('[data-test-backdrop]')!;

      expect(hitTargetAtCenter(pageButton)).toBe(pageButton);
      expect(hitTargetAtCenter(popup)).toBe(popup);
      expect(hitTargetAtCenter(backdrop)).toBe(backdrop);

      await userEvent.click(pageButton);
      expect(hitFixture.componentInstance.pageClicks).toBe(1);
      expect(hitFixture.componentInstance.root().open()).toBe(true);
    } finally {
      hitFixture.destroy();
    }
  });

  describe('a kept-mounted host isolated by a modal drawer', () => {
    let isolationFixture: ComponentFixture<KeptUnderModalHost>;
    const keptHost = () =>
      document.querySelector('[data-test-kept-viewport]')!.parentElement as HTMLElement;
    const modalHost = () => document.querySelector('[data-test-modal-viewport]')?.parentElement;

    async function setOpen(index: 0 | 1, open: boolean): Promise<void> {
      const root = isolationFixture.componentInstance.roots()[index];
      if (open) {
        root.show();
      } else {
        root.hide();
      }
      isolationFixture.detectChanges();
      await vi.waitFor(() => expect(root.open()).toBe(open));
      if (index === 0) {
        await vi.waitFor(() => expect(keptHost().hidden).toBe(!open));
      } else if (open) {
        await vi.waitFor(() => expect(modalHost()).toBeTruthy());
      } else {
        await vi.waitFor(() => expect(modalHost()).toBeFalsy());
      }
    }

    beforeEach(() => {
      isolationFixture = TestBed.createComponent(KeptUnderModalHost);
      isolationFixture.detectChanges();
    });

    afterEach(() => isolationFixture.destroy());

    it('stays interactive when reopened before the modal closes', async () => {
      await setOpen(0, true);
      await setOpen(0, false);
      await setOpen(1, true);
      await setOpen(0, true);
      await setOpen(1, false);

      expect(keptHost().inert).toBe(false);
      expect(keptHost().hasAttribute('aria-hidden')).toBe(false);
    });

    it('stays inert when hidden before the modal closes', async () => {
      await setOpen(0, true);
      await setOpen(1, true);
      await setOpen(0, false);
      await setOpen(1, false);

      expect(keptHost().hidden).toBe(true);
      expect(keptHost().inert).toBe(true);
      expect(keptHost().getAttribute('aria-hidden')).toBe('true');
    });
  });
});
