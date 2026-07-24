import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Event as RouterEvent, NavigationStart, Router } from '@angular/router';
import { Subject } from 'rxjs';
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
});
