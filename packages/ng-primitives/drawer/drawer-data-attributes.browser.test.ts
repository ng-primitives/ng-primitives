import { Component, signal, viewChildren } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgpDrawerBackdrop } from './backdrop/drawer-backdrop';
import {
  NgpDrawerOpenChangeEvent,
  NgpDrawerSnapPoint,
  NgpDrawerSnapPointChangeEvent,
} from './drawer.types';
import { NgpDrawer } from './drawer/drawer';
import { NgpDrawerPopup } from './popup/drawer-popup';
import { NgpDrawerPortal } from './portal/drawer-portal';
import { NgpDrawerSwipeArea } from './swipe-area/drawer-swipe-area';
import { NgpDrawerTrigger } from './trigger/drawer-trigger';
import { NgpDrawerViewport } from './viewport/drawer-viewport';

const DRAWER_IMPORTS = [
  NgpDrawerBackdrop,
  NgpDrawerPopup,
  NgpDrawerPortal,
  NgpDrawer,
  NgpDrawerSwipeArea,
  NgpDrawerTrigger,
  NgpDrawerViewport,
] as const;

@Component({
  imports: DRAWER_IMPORTS,
  template: `
    <ng-container
      [defaultSnapPoint]="defaultSnapPoint()"
      [snapPoint]="activeSnapPoint()"
      [snapPoints]="snapPoints()"
      [modal]="false"
      (beforeOpenChange)="beforeOpenChange($event)"
      (beforeSnapPointChange)="beforeSnapPointChange($event)"
      (snapPointChange)="activeSnapPoint.set($event)"
      ngpDrawer
    >
      <button [disabled]="triggerDisabled()" data-test-trigger ngpDrawerTrigger>Open</button>
      <div [disabled]="swipeAreaDisabled()" data-test-swipe-area ngpDrawerSwipeArea></div>
      <ng-template [keepMounted]="true" ngpDrawerPortal>
        <div class="hook-part" data-test-parent-backdrop ngpDrawerBackdrop></div>
        <div class="hook-part" data-test-parent-viewport ngpDrawerViewport>
          <section class="hook-part" data-test-parent-popup ngpDrawerPopup>
            <ng-container [modal]="false" ngpDrawer>
              <ng-template [keepMounted]="true" ngpDrawerPortal>
                <div class="hook-part" data-test-child-backdrop ngpDrawerBackdrop></div>
                <div class="hook-part" data-test-child-viewport ngpDrawerViewport>
                  <section class="hook-part" data-test-child-popup ngpDrawerPopup></section>
                </div>
              </ng-template>
            </ng-container>
          </section>
        </div>
      </ng-template>
    </ng-container>
  `,
  styles: `
    .hook-part {
      height: 200px;
      opacity: 1;
      transition: opacity 80ms linear;
      width: 200px;
    }

    .hook-part[data-starting-style],
    .hook-part[data-ending-style] {
      opacity: 0.5;
    }
  `,
})
class DataAttributesHost {
  readonly activeSnapPoint = signal<NgpDrawerSnapPoint | null | undefined>(undefined);
  readonly defaultSnapPoint = signal<NgpDrawerSnapPoint | null | undefined>(0.5);
  readonly snapPoints = signal<readonly NgpDrawerSnapPoint[] | undefined>([0.5, 1]);
  readonly swipeAreaDisabled = signal(false);
  readonly triggerDisabled = signal(false);
  readonly roots = viewChildren(NgpDrawer);
  cancelNextClose = false;
  cancelNextSnap = false;

  beforeOpenChange(event: NgpDrawerOpenChangeEvent): void {
    if (!event.nextOpen && this.cancelNextClose) {
      event.cancel();
      this.cancelNextClose = false;
    }
  }

  beforeSnapPointChange(event: NgpDrawerSnapPointChangeEvent): void {
    if (this.cancelNextSnap) {
      event.cancel();
      this.cancelNextSnap = false;
    }
  }
}

describe('Drawer data attribute ledger', () => {
  let fixture: ComponentFixture<DataAttributesHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [DataAttributesHost] }).compileComponents();
    fixture = TestBed.createComponent(DataAttributesHost);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('publishes the closed, opening, open, closing, and disabled ledger by part', async () => {
    const trigger = hostElement('[data-test-trigger]');
    const swipeArea = hostElement('[data-test-swipe-area]');
    expectLedger(trigger, ['data-closed'], CONTROL_FORBIDDEN);
    expectLedger(swipeArea, ['data-closed', 'data-swipe-direction'], SWIPE_AREA_FORBIDDEN);
    expect(swipeArea.getAttribute('data-swipe-direction')).toBe('up');

    fixture.componentInstance.triggerDisabled.set(true);
    fixture.componentInstance.swipeAreaDisabled.set(true);
    fixture.detectChanges();
    expect(trigger).toHaveAttribute('data-disabled');
    expect(swipeArea).toHaveAttribute('data-disabled');
    fixture.componentInstance.triggerDisabled.set(false);
    fixture.componentInstance.swipeAreaDisabled.set(false);

    const parts = await openParent();
    for (const part of animatedParts(parts)) {
      expect(part).toHaveAttribute('data-starting-style');
    }
    expectOpenLedger(trigger, swipeArea, parts);
    await finishEnter(animatedParts(parts));
    expectOpenLedger(trigger, swipeArea, parts);

    fixture.componentInstance.roots()[0].hide();
    fixture.detectChanges();
    await animationFrame();
    for (const part of animatedParts(parts)) {
      expect(part).toHaveAttribute('data-ending-style');
      expect(part).toHaveAttribute('data-closed');
      expect(part).not.toHaveAttribute('data-open');
    }
    await finishAnimations(animatedParts(parts));
    for (const part of animatedParts(parts)) {
      expect(part).not.toHaveAttribute('data-ending-style');
      expect(part).toHaveAttribute('data-closed');
    }
    expectLedger(trigger, ['data-closed'], CONTROL_FORBIDDEN);
    expectLedger(swipeArea, ['data-closed', 'data-swipe-direction'], SWIPE_AREA_FORBIDDEN);
  });

  it('marks only Popup expanded for an effective numeric snap point of one', async () => {
    fixture.componentInstance.defaultSnapPoint.set(1);
    fixture.componentInstance.cancelNextSnap = true;
    const parts = await openParent();
    expect(fixture.componentInstance.roots()[0].snapPoint()).toBeUndefined();
    expect(parts.popup).toHaveAttribute('data-expanded');
    expect(parts.viewport).not.toHaveAttribute('data-expanded');
    expect(parts.backdrop).not.toHaveAttribute('data-expanded');

    fixture.componentInstance.roots()[0].snapPoint.set(0.5);
    fixture.detectChanges();
    expect(parts.popup).not.toHaveAttribute('data-expanded');
    fixture.componentInstance.roots()[0].snapPoint.set(1);
    fixture.detectChanges();
    expect(parts.popup).toHaveAttribute('data-expanded');

    fixture.componentInstance.roots()[0].snapPoint.set(undefined);
    fixture.componentInstance.defaultSnapPoint.set(undefined);
    fixture.componentInstance.snapPoints.set([1, 0.5]);
    fixture.detectChanges();
    expect(fixture.componentInstance.activeSnapPoint()).toBeUndefined();
    expect(parts.popup).toHaveAttribute('data-expanded');
    fixture.componentInstance.snapPoints.set([0.5, 1]);
    fixture.detectChanges();
    expect(parts.popup).not.toHaveAttribute('data-expanded');
  });

  it('separates nested Root identity from descendant open and swiping state', async () => {
    const parent = await openParent();
    await finishEnter(animatedParts(parent));
    await vi.waitFor(() => expect(fixture.componentInstance.roots()).toHaveLength(2));
    fixture.componentInstance.roots()[1].show();
    fixture.detectChanges();
    const child = await waitForParts('child');
    await finishEnter(animatedParts(child));

    expect(parent.popup).toHaveAttribute('data-nested-drawer-open');
    expect(parent.popup).not.toHaveAttribute('data-nested');
    expect(parent.viewport).not.toHaveAttribute('data-nested');
    expect(parent.viewport).not.toHaveAttribute('data-nested-drawer-open');
    expect(parent.backdrop).not.toHaveAttribute('data-nested-drawer-open');
    expect(child.viewport).toHaveAttribute('data-nested');
    expect(child.popup).not.toHaveAttribute('data-nested');
    expect(child.backdrop).not.toHaveAttribute('data-nested');

    mockSize(child);
    dispatchPointer(child.viewport, 'pointerdown', { buttons: 1, pointerId: 10, time: 0, y: 0 });
    dispatchPointer(child.viewport, 'pointermove', {
      buttons: 1,
      pointerId: 10,
      time: 100,
      y: 30,
    });
    fixture.detectChanges();
    await animationFrame();
    expect(parent.popup).toHaveAttribute('data-nested-drawer-swiping');
    expect(parent.backdrop).not.toHaveAttribute('data-nested-drawer-swiping');
    expect(parent.viewport).not.toHaveAttribute('data-nested-drawer-swiping');
    expect(child.popup).toHaveAttribute('data-swiping');
    expect(child.backdrop).toHaveAttribute('data-swiping');
    expect(child.viewport).not.toHaveAttribute('data-swiping');

    child.viewport.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
    fixture.detectChanges();
    expect(parent.popup).not.toHaveAttribute('data-nested-drawer-swiping');
    expect(child.popup).not.toHaveAttribute('data-swiping');
    expect(child.backdrop).not.toHaveAttribute('data-swiping');
  });

  it('mirrors swipe dismissal on Popup and Backdrop through exit and cleanup', async () => {
    fixture.componentInstance.snapPoints.set(undefined);
    fixture.componentInstance.defaultSnapPoint.set(undefined);
    const parts = await openParent();
    await finishEnter(animatedParts(parts));
    mockSize(parts);

    dispatchPointer(parts.viewport, 'pointerdown', { buttons: 1, pointerId: 20, time: 0, y: 0 });
    dispatchPointer(parts.viewport, 'pointermove', {
      buttons: 1,
      pointerId: 20,
      time: 100,
      y: 70,
    });
    fixture.detectChanges();
    expect(parts.popup).toHaveAttribute('data-swiping');
    expect(parts.backdrop).toHaveAttribute('data-swiping');
    expect(parts.viewport).not.toHaveAttribute('data-swiping');

    dispatchPointer(parts.viewport, 'pointerup', {
      buttons: 0,
      pointerId: 20,
      time: 101,
      y: 70,
    });
    fixture.detectChanges();
    expect(fixture.componentInstance.roots()[0].open()).toBe(false);
    expect(parts.popup.getAttribute('data-swipe-dismiss')).toBe('');
    expect(parts.backdrop.getAttribute('data-swipe-dismiss')).toBe('');
    expect(parts.viewport).not.toHaveAttribute('data-swipe-dismiss');
    expect(parts.popup).not.toHaveAttribute('data-swiping');
    expect(parts.backdrop).not.toHaveAttribute('data-swiping');

    await animationFrame();
    await finishAnimations(animatedParts(parts));
    expect(parts.popup).not.toHaveAttribute('data-swipe-dismiss');
    expect(parts.backdrop).not.toHaveAttribute('data-swipe-dismiss');

    fixture.componentInstance.roots()[0].show();
    fixture.detectChanges();
    await finishEnter(animatedParts(parts));
    fixture.componentInstance.cancelNextClose = true;
    swipe(parts.viewport, 21, 70);
    fixture.detectChanges();
    expect(fixture.componentInstance.roots()[0].open()).toBe(true);
    expect(parts.popup).not.toHaveAttribute('data-swipe-dismiss');
    expect(parts.backdrop).not.toHaveAttribute('data-swipe-dismiss');
    expect(parts.viewport).not.toHaveAttribute('data-swipe-dismiss');
  });

  it('uses open and closed SwipeArea hooks while mirroring opening swipe state', async () => {
    const area = hostElement('[data-test-swipe-area]');
    expectLedger(area, ['data-closed', 'data-swipe-direction'], SWIPE_AREA_FORBIDDEN);

    dispatchPointer(area, 'pointerdown', { buttons: 1, pointerId: 30, time: 0, y: 150 });
    dispatchPointer(area, 'pointermove', { buttons: 1, pointerId: 30, time: 100, y: 100 });
    fixture.detectChanges();
    const parts = await waitForParts('parent');
    expect(area).toHaveAttribute('data-open');
    expect(area).toHaveAttribute('data-swiping');
    expect(area).not.toHaveAttribute('data-closed');
    expect(area).not.toHaveAttribute('data-active');
    expect(area).not.toHaveAttribute('data-inactive');
    expect(parts.popup).toHaveAttribute('data-swiping');
    expect(parts.backdrop).toHaveAttribute('data-swiping');
    expect(parts.viewport).not.toHaveAttribute('data-swiping');

    dispatchPointer(area, 'pointercancel', { buttons: 0, pointerId: 30, time: 101, y: 100 });
    fixture.detectChanges();
    expect(area).toHaveAttribute('data-closed');
    expect(area).not.toHaveAttribute('data-open');
    expect(area).not.toHaveAttribute('data-swiping');
    expect(parts.popup).not.toHaveAttribute('data-swiping');
    expect(parts.backdrop).not.toHaveAttribute('data-swiping');
  });

  async function openParent(): Promise<DrawerParts> {
    fixture.componentInstance.roots()[0].show();
    fixture.detectChanges();
    return waitForParts('parent');
  }
});

const CONTROL_FORBIDDEN = [
  'data-expanded',
  'data-nested',
  'data-nested-drawer-open',
  'data-nested-drawer-swiping',
  'data-swipe-direction',
  'data-swipe-dismiss',
  'data-swiping',
] as const;

const SWIPE_AREA_FORBIDDEN = [
  'data-active',
  'data-inactive',
  'data-expanded',
  'data-nested',
  'data-nested-drawer-open',
  'data-nested-drawer-swiping',
  'data-swipe-dismiss',
] as const;

interface DrawerParts {
  readonly backdrop: HTMLElement;
  readonly popup: HTMLElement;
  readonly viewport: HTMLElement;
}

interface PointerOptions {
  readonly buttons: number;
  readonly pointerId: number;
  readonly time: number;
  readonly x?: number;
  readonly y?: number;
}

function expectOpenLedger(trigger: HTMLElement, swipeArea: HTMLElement, parts: DrawerParts): void {
  expectLedger(trigger, ['data-open'], CONTROL_FORBIDDEN);
  expectLedger(swipeArea, ['data-open', 'data-swipe-direction'], SWIPE_AREA_FORBIDDEN);
  expectLedger(parts.popup, ['data-open', 'data-swipe-direction'], ['data-nested']);
  expectLedger(
    parts.viewport,
    ['data-open'],
    [
      'data-expanded',
      'data-nested',
      'data-nested-drawer-open',
      'data-nested-drawer-swiping',
      'data-swipe-direction',
      'data-swipe-dismiss',
      'data-swiping',
    ],
  );
  expectLedger(
    parts.backdrop,
    ['data-open'],
    [
      'data-expanded',
      'data-nested',
      'data-nested-drawer-open',
      'data-nested-drawer-swiping',
      'data-swipe-direction',
      'data-swipe-dismiss',
      'data-swiping',
    ],
  );
}

function expectLedger(
  element: HTMLElement,
  required: readonly string[],
  forbidden: readonly string[],
): void {
  for (const attribute of required) {
    expect(element, `${attribute} should be present`).toHaveAttribute(attribute);
  }
  for (const attribute of forbidden) {
    expect(element, `${attribute} should be absent`).not.toHaveAttribute(attribute);
  }
}

function animatedParts(parts: DrawerParts): HTMLElement[] {
  return [parts.backdrop, parts.viewport, parts.popup];
}

async function waitForParts(owner: 'parent' | 'child'): Promise<DrawerParts> {
  return vi.waitFor(() => {
    const backdrop = document.querySelector<HTMLElement>(`[data-test-${owner}-backdrop]`);
    const viewport = document.querySelector<HTMLElement>(`[data-test-${owner}-viewport]`);
    const popup = document.querySelector<HTMLElement>(`[data-test-${owner}-popup]`);
    expect(backdrop).not.toBeNull();
    expect(viewport).not.toBeNull();
    expect(popup).not.toBeNull();
    return { backdrop: backdrop!, viewport: viewport!, popup: popup! };
  });
}

function hostElement(selector: string): HTMLElement {
  return document.querySelector<HTMLElement>(selector)!;
}

function mockSize(parts: DrawerParts): void {
  vi.spyOn(parts.viewport, 'getBoundingClientRect').mockReturnValue(rect());
  vi.spyOn(parts.popup, 'getBoundingClientRect').mockReturnValue(rect());
  window.dispatchEvent(new Event('resize'));
}

function rect(): DOMRect {
  return {
    bottom: 200,
    height: 200,
    left: 0,
    right: 200,
    top: 0,
    width: 200,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  };
}

function swipe(target: EventTarget, pointerId: number, y: number): void {
  dispatchPointer(target, 'pointerdown', { buttons: 1, pointerId, time: 0, y: 0 });
  dispatchPointer(target, 'pointermove', { buttons: 1, pointerId, time: 100, y });
  dispatchPointer(target, 'pointerup', { buttons: 0, pointerId, time: 101, y });
}

function dispatchPointer(
  target: EventTarget,
  type: 'pointerdown' | 'pointermove' | 'pointerup' | 'pointercancel',
  options: PointerOptions,
): void {
  const event = new PointerEvent(type, {
    bubbles: true,
    button: 0,
    buttons: options.buttons,
    clientX: options.x ?? 0,
    clientY: options.y ?? 0,
    composed: true,
    isPrimary: true,
    pointerId: options.pointerId,
    pointerType: 'mouse',
  });
  Object.defineProperty(event, 'timeStamp', { configurable: true, value: options.time });
  target.dispatchEvent(event);
}

async function finishEnter(parts: HTMLElement[]): Promise<void> {
  await animationFrame();
  await vi.waitFor(() =>
    expect(parts.every(part => !part.hasAttribute('data-starting-style'))).toBe(true),
  );
  await finishAnimations(parts);
}

async function finishAnimations(parts: HTMLElement[]): Promise<void> {
  const animations = [...new Set(parts.flatMap(part => part.getAnimations({ subtree: true })))];
  await Promise.all(animations.map(animation => animation.finished));
  await vi.waitFor(() =>
    expect(parts.every(part => !part.hasAttribute('data-ending-style'))).toBe(true),
  );
}

function animationFrame(): Promise<void> {
  return new Promise(resolve => requestAnimationFrame(() => resolve()));
}
