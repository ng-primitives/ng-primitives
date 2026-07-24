import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  NgpDrawerSnapPoint,
  NgpDrawerSnapPointChangeEvent,
  NgpDrawerSwipeDirection,
} from './drawer.types';
import { NgpDrawer } from './drawer/drawer';
import { NgpDrawerPopup } from './popup/drawer-popup';
import { NgpDrawerPortal } from './portal/drawer-portal';
import { NgpDrawerViewport } from './viewport/drawer-viewport';

@Component({
  imports: [NgpDrawerPopup, NgpDrawerPortal, NgpDrawer, NgpDrawerViewport],
  template: `
    <ng-container
      [defaultSnapPoint]="defaultPoint()"
      [snapPoint]="active()"
      [snapPoints]="points()"
      [snapToSequentialPoints]="sequential()"
      [swipeDirection]="direction()"
      [modal]="false"
      (beforeSnapPointChange)="beforeSnap($event)"
      (snapPointChange)="active.set($event)"
      ngpDrawer
    >
      <ng-template ngpDrawerPortal>
        <div class="viewport" data-test-snap-viewport ngpDrawerViewport>
          <section class="popup" data-test-snap-popup ngpDrawerPopup></section>
        </div>
      </ng-template>
    </ng-container>
  `,
  styles: `
    .viewport {
      height: 400px;
    }
    .popup {
      box-sizing: border-box;
      height: 400px;
      transform: translateY(
        calc(var(--ngp-drawer-snap-point-offset) + var(--ngp-drawer-swipe-movement-y))
      );
    }
  `,
})
class SnapHost {
  readonly points = signal<readonly NgpDrawerSnapPoint[]>(['100px', '200px', '300px']);
  readonly defaultPoint = signal<NgpDrawerSnapPoint | null | undefined>('300px');
  readonly active = signal<NgpDrawerSnapPoint | null | undefined>(undefined);
  readonly sequential = signal(false);
  readonly direction = signal<NgpDrawerSwipeDirection>('down');
  readonly cancelNextSnap = signal(false);
  readonly root = viewChild.required(NgpDrawer);

  beforeSnap(event: NgpDrawerSnapPointChangeEvent): void {
    if (this.cancelNextSnap()) {
      event.cancel();
      this.cancelNextSnap.set(false);
    }
  }
}

@Component({
  imports: [NgpDrawerPopup, NgpDrawerPortal, NgpDrawer, NgpDrawerViewport],
  template: `
    <ng-container
      [defaultSnapPoint]="defaultPoint()"
      [open]="true"
      [snapPoints]="points"
      [modal]="false"
      ngpDrawer
    >
      <ng-template ngpDrawerPortal>
        <div class="viewport" data-test-uncontrolled-viewport ngpDrawerViewport>
          <section class="popup" data-test-uncontrolled-popup ngpDrawerPopup></section>
        </div>
      </ng-template>
    </ng-container>
  `,
  styles: `
    .viewport,
    .popup {
      height: 400px;
    }
  `,
})
class UncontrolledSnapHost {
  readonly points: readonly NgpDrawerSnapPoint[] = ['100px', '200px', '300px'];
  readonly defaultPoint = signal<NgpDrawerSnapPoint>('300px');
  readonly root = viewChild.required(NgpDrawer);
}

let touchHitTarget: Element | null = null;

describe('Drawer snap point integration', () => {
  let fixture: ComponentFixture<SnapHost>;
  let initialRootFontSize: string;

  beforeEach(async () => {
    vi.spyOn(document, 'elementFromPoint').mockImplementation(() => touchHitTarget);
    await TestBed.configureTestingModule({
      imports: [SnapHost, UncontrolledSnapHost],
    }).compileComponents();
    initialRootFontSize = document.documentElement.style.fontSize;
    fixture = TestBed.createComponent(SnapHost);
    fixture.detectChanges();
  });

  afterEach(() => {
    document.documentElement.style.fontSize = initialRootFontSize;
    fixture.destroy();
    vi.restoreAllMocks();
  });

  it('publishes active height and snap offset variables', async () => {
    const { viewport, popup } = await openDrawer();
    expect(fixture.componentInstance.active()).toBe('300px');
    expect(viewport.style.getPropertyValue('--ngp-drawer-height')).toBe('300px');
    expect(popup.style.getPropertyValue('--ngp-drawer-snap-point-offset')).toBe('100px');
  });

  it('updates snap visuals when the uncontrolled default point changes while open', async () => {
    const uncontrolledFixture = TestBed.createComponent(UncontrolledSnapHost);
    uncontrolledFixture.detectChanges();
    await vi.waitFor(() =>
      expect(document.querySelector('[data-test-uncontrolled-popup]')).not.toBeNull(),
    );
    const viewport = document.querySelector<HTMLElement>('[data-test-uncontrolled-viewport]')!;
    const popup = document.querySelector<HTMLElement>('[data-test-uncontrolled-popup]')!;
    vi.spyOn(viewport, 'getBoundingClientRect').mockReturnValue(rect(400));
    vi.spyOn(popup, 'getBoundingClientRect').mockReturnValue(rect(400));
    window.dispatchEvent(new Event('resize'));
    uncontrolledFixture.detectChanges();
    await uncontrolledFixture.whenStable();

    expect(uncontrolledFixture.componentInstance.root().snapPoint()).toBeUndefined();
    expect(popup.style.getPropertyValue('--ngp-drawer-height')).toBe('300px');
    expect(popup.style.getPropertyValue('--ngp-drawer-snap-point-offset')).toBe('100px');

    uncontrolledFixture.componentInstance.defaultPoint.set('200px');
    uncontrolledFixture.detectChanges();
    await uncontrolledFixture.whenStable();

    expect(popup.style.getPropertyValue('--ngp-drawer-height')).toBe('200px');
    expect(popup.style.getPropertyValue('--ngp-drawer-snap-point-offset')).toBe('200px');
    uncontrolledFixture.destroy();
  });

  it('snaps to the closest point from distance', async () => {
    const { viewport } = await openDrawer();
    swipe(viewport, 0, 125, 1, 0, 400);
    fixture.detectChanges();
    expect(fixture.componentInstance.root().open()).toBe(true);
    expect(fixture.componentInstance.active()).toBe('200px');
  });

  it('expands to a higher snap point from a slow upward drag', async () => {
    fixture.componentInstance.defaultPoint.set('100px');
    fixture.componentInstance.active.set('100px');
    fixture.detectChanges();
    const { viewport } = await openDrawer();
    swipe(viewport, 0, -175, 9, 0, 1000);
    fixture.detectChanges();
    expect(fixture.componentInstance.root().open()).toBe(true);
    expect(fixture.componentInstance.active()).toBe('300px');
  });

  it('applies the target snap offset before resetting swipe movement on release', async () => {
    fixture.componentInstance.points.set(['100px', 1]);
    fixture.componentInstance.defaultPoint.set('100px');
    fixture.componentInstance.active.set('100px');
    fixture.detectChanges();
    const { viewport, popup } = await openDrawer();

    dispatchPointer(viewport, 'pointerdown', 0, 1, 24, 0);
    dispatchPointer(viewport, 'pointermove', -350, 1, 24, 1000);
    dispatchPointer(viewport, 'pointerup', -350, 0, 24, 1001);

    expect(fixture.componentInstance.active()).toBe(1);
    expect(popup.style.getPropertyValue('--ngp-drawer-snap-point-offset')).toBe('0px');
    expect(popup.style.getPropertyValue('--ngp-drawer-swipe-movement-y')).toBe('0px');
  });

  it('expands from a natural upward flick released at rest', async () => {
    fixture.componentInstance.points.set(['100px', '300px']);
    fixture.componentInstance.defaultPoint.set('100px');
    fixture.componentInstance.active.set('100px');
    fixture.detectChanges();
    const { viewport } = await openDrawer();
    dispatchPointer(viewport, 'pointerdown', 0, 1, 10, 0);
    dispatchPointer(viewport, 'pointermove', -30, 1, 10, 200);
    dispatchPointer(viewport, 'pointermove', -80, 1, 10, 300);
    dispatchPointer(viewport, 'pointerup', -80, 0, 10, 330);
    fixture.detectChanges();
    expect(fixture.componentInstance.active()).toBe('300px');
  });

  it('ignores a small direction reversal when releasing an upward flick', async () => {
    fixture.componentInstance.points.set(['100px', '300px']);
    fixture.componentInstance.defaultPoint.set('100px');
    fixture.componentInstance.active.set('100px');
    fixture.detectChanges();
    const { viewport } = await openDrawer();
    dispatchPointer(viewport, 'pointerdown', 0, 1, 11, 0);
    dispatchPointer(viewport, 'pointermove', -80, 1, 11, 70);
    dispatchPointer(viewport, 'pointermove', -75, 1, 11, 80);
    dispatchPointer(viewport, 'pointerup', -75, 0, 11, 90);
    fixture.detectChanges();
    expect(fixture.componentInstance.active()).toBe('300px');
  });

  it('uses projected velocity to move across points', async () => {
    const { viewport } = await openDrawer();
    swipe(viewport, 0, 25, 2, 0, 42);
    fixture.detectChanges();
    expect(fixture.componentInstance.active()).toBe('100px');
  });

  it('preserves upward distance selection after the first native touch sample is rebased', async () => {
    fixture.componentInstance.direction.set('up');
    fixture.detectChanges();
    const { viewport } = await openDrawer();

    dispatchTouch(viewport, 'touchstart', [touch(viewport, 20, 0)], [], 0);
    dispatchTouch(viewport, 'touchmove', [touch(viewport, 20, -30)], [], 100);
    dispatchTouch(viewport, 'touchmove', [touch(viewport, 20, -155)], [], 1100);
    dispatchTouch(viewport, 'touchend', [], [touch(viewport, 20, -155)], 1101);
    fixture.detectChanges();

    expect(fixture.componentInstance.active()).toBe('200px');
  });

  it('expands a down-direction bottom sheet from diagonal native upward touch moves', async () => {
    fixture.componentInstance.points.set(['100px', '300px']);
    fixture.componentInstance.defaultPoint.set('100px');
    fixture.componentInstance.active.set('100px');
    fixture.detectChanges();
    const { viewport, popup } = await openDrawer();

    expect(popup.style.getPropertyValue('--ngp-drawer-swipe-progress')).toBe('1');

    dispatchTouch(viewport, 'touchstart', [touch(viewport, 22, 0, 0)], [], 0);
    const firstMove = dispatchTouch(viewport, 'touchmove', [touch(viewport, 22, -30, 3)], [], 100);
    const secondMove = dispatchTouch(
      viewport,
      'touchmove',
      [touch(viewport, 22, -160, 7)],
      [],
      1100,
    );

    expect(fixture.componentInstance.direction()).toBe('down');
    expect(firstMove.defaultPrevented).toBe(true);
    expect(secondMove.defaultPrevented).toBe(true);
    expect(popup.style.getPropertyValue('--ngp-drawer-swipe-movement-y')).toBe('-130px');
    expect(Number(popup.style.getPropertyValue('--ngp-drawer-swipe-progress'))).toBeCloseTo(0.35);
    expect(new DOMMatrixReadOnly(getComputedStyle(popup).transform).m42).toBeCloseTo(170);

    dispatchTouch(viewport, 'touchend', [], [touch(viewport, 22, -160, 7)], 1101);
    expect(popup.style.getPropertyValue('--ngp-drawer-swipe-progress')).toBe('0');
    fixture.detectChanges();

    expect(fixture.componentInstance.root().open()).toBe(true);
    expect(fixture.componentInstance.active()).toBe('300px');
    await vi.waitFor(() =>
      expect(popup.style.getPropertyValue('--ngp-drawer-swipe-progress')).toBe('0'),
    );
  });

  it('preserves downward velocity projection after the first native touch sample is rebased', async () => {
    const { viewport } = await openDrawer();

    dispatchTouch(viewport, 'touchstart', [touch(viewport, 21, 0)], [], 0);
    dispatchTouch(viewport, 'touchmove', [touch(viewport, 21, 30)], [], 100);
    dispatchTouch(viewport, 'touchmove', [touch(viewport, 21, 55)], [], 140);
    dispatchTouch(viewport, 'touchend', [], [touch(viewport, 21, 55)], 141);
    fixture.detectChanges();

    expect(fixture.componentInstance.root().open()).toBe(true);
    expect(fixture.componentInstance.active()).toBe('100px');
  });

  it('derives up-direction snap progress from physical vertical movement', async () => {
    fixture.componentInstance.points.set(['100px', '300px']);
    fixture.componentInstance.defaultPoint.set('300px');
    fixture.componentInstance.active.set('300px');
    fixture.componentInstance.direction.set('up');
    fixture.detectChanges();
    const { viewport, popup } = await openDrawer();

    dispatchPointer(viewport, 'pointerdown', 0, 1, 23, 0);
    dispatchPointer(viewport, 'pointermove', 50, 1, 23, 100);

    expect(popup.style.getPropertyValue('--ngp-drawer-swipe-movement-y')).toBe('50px');
    expect(Number(popup.style.getPropertyValue('--ngp-drawer-swipe-progress'))).toBeCloseTo(0.25);
    viewport.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
  });

  it('prevents sequential mode from skipping an adjacent point', async () => {
    fixture.componentInstance.sequential.set(true);
    const { viewport } = await openDrawer();
    swipe(viewport, 0, 25, 3, 0, 42);
    fixture.detectChanges();
    expect(fixture.componentInstance.active()).toBe('200px');
  });

  it('allows sequential close only from the lowest point', async () => {
    fixture.componentInstance.sequential.set(true);
    fixture.componentInstance.active.set('200px');
    fixture.detectChanges();
    const { viewport } = await openDrawer();
    swipe(viewport, 0, 250, 4, 0, 400);
    fixture.detectChanges();
    expect(fixture.componentInstance.root().open()).toBe(true);
    expect(fixture.componentInstance.active()).toBe('100px');
    swipe(viewport, 0, 250, 5, 500, 900);
    fixture.detectChanges();
    expect(fixture.componentInstance.root().open()).toBe(false);
  });

  it('restores the prior visual state when a snap request is canceled', async () => {
    fixture.componentInstance.active.set('100px');
    fixture.detectChanges();
    const { viewport, popup } = await openDrawer();
    fixture.componentInstance.cancelNextSnap.set(true);
    swipe(viewport, 0, -175, 6, 0, 1000);
    fixture.detectChanges();
    expect(fixture.componentInstance.active()).toBe('100px');
    expect(popup.style.getPropertyValue('--ngp-drawer-snap-point-offset')).toBe('300px');
    expect(popup.style.getPropertyValue('--ngp-drawer-swipe-progress')).toBe('1');
  });

  it('resets the default point after a successful swipe close', async () => {
    fixture.componentInstance.active.set('100px');
    fixture.detectChanges();
    const { viewport } = await openDrawer();
    swipe(viewport, 0, 100, 7, 0, 200);
    fixture.detectChanges();
    expect(fixture.componentInstance.root().open()).toBe(false);
    expect(fixture.componentInstance.active()).toBe('300px');
  });

  it('keeps the released snap visuals while a swipe close exits', async () => {
    fixture.componentInstance.points.set(['100px', 1]);
    fixture.componentInstance.defaultPoint.set('100px');
    fixture.componentInstance.active.set(1);
    fixture.detectChanges();
    const { viewport, popup } = await openDrawer();

    swipe(viewport, 0, 375, 25, 0, 1000);
    fixture.detectChanges();

    expect(fixture.componentInstance.root().open()).toBe(false);
    expect(fixture.componentInstance.active()).toBe('100px');
    expect(popup.hasAttribute('data-ending-style')).toBe(true);
    expect(popup.style.getPropertyValue('--ngp-drawer-snap-point-offset')).toBe('0px');
    expect(popup.style.getPropertyValue('--ngp-drawer-swipe-movement-y')).toBe('375px');
  });

  it('preserves explicit null as no active snap point', async () => {
    fixture.componentInstance.active.set('100px');
    fixture.detectChanges();
    const { viewport, popup } = await openDrawer();
    expect(popup.style.getPropertyValue('--ngp-drawer-swipe-progress')).toBe('1');

    fixture.componentInstance.active.set(null);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.active()).toBeNull();
    expect(viewport.style.getPropertyValue('--ngp-drawer-height')).toBe('');
    expect(popup.style.getPropertyValue('--ngp-drawer-snap-point-offset')).toBe('');
    expect(popup.style.getPropertyValue('--ngp-drawer-swipe-progress')).toBe('0');
  });

  it('remeasures rem points after root-font geometry changes', async () => {
    fixture.componentInstance.points.set(['10rem']);
    fixture.componentInstance.defaultPoint.set('10rem');
    const { popup } = await openDrawer();
    document.documentElement.style.fontSize = '10px';
    window.dispatchEvent(new Event('resize'));
    fixture.detectChanges();
    expect(popup.style.getPropertyValue('--ngp-drawer-height')).toBe('100px');
    document.documentElement.style.fontSize = '20px';
    await vi.waitFor(() => {
      expect(popup.style.getPropertyValue('--ngp-drawer-height')).toBe('200px');
    });
  });

  it('integrates resistance only after crossing the open snap edge', async () => {
    const { viewport, popup } = await openDrawer();
    dispatchPointer(viewport, 'pointerdown', 0, 1, 8, 0);
    dispatchPointer(viewport, 'pointermove', -150, 1, 8, 200);
    expect(
      Number.parseFloat(popup.style.getPropertyValue('--ngp-drawer-swipe-movement-y')),
    ).toBeCloseTo(-100 - Math.sqrt(50));
    dispatchPointer(viewport, 'pointercancel', -150, 0, 8, 201);
  });

  async function openDrawer(): Promise<{ viewport: HTMLElement; popup: HTMLElement }> {
    fixture.componentInstance.root().show();
    fixture.detectChanges();
    await vi.waitFor(() => expect(document.querySelector('[data-test-snap-popup]')).not.toBeNull());
    const viewport = document.querySelector<HTMLElement>('[data-test-snap-viewport]')!;
    const popup = document.querySelector<HTMLElement>('[data-test-snap-popup]')!;
    vi.spyOn(viewport, 'getBoundingClientRect').mockReturnValue(rect(400));
    vi.spyOn(popup, 'getBoundingClientRect').mockReturnValue(rect(400));
    window.dispatchEvent(new Event('resize'));
    fixture.detectChanges();
    return { viewport, popup };
  }
});

function swipe(
  target: EventTarget,
  startY: number,
  endY: number,
  pointerId: number,
  startTime: number,
  endTime: number,
): void {
  dispatchPointer(target, 'pointerdown', startY, 1, pointerId, startTime);
  dispatchPointer(target, 'pointermove', endY, 1, pointerId, endTime - 1);
  dispatchPointer(target, 'pointerup', endY, 0, pointerId, endTime);
}

function dispatchPointer(
  target: EventTarget,
  type: 'pointerdown' | 'pointermove' | 'pointerup' | 'pointercancel',
  y: number,
  buttons: number,
  pointerId: number,
  timeStamp: number,
): void {
  const event = new PointerEvent(type, {
    bubbles: true,
    button: 0,
    buttons,
    clientY: y,
    composed: true,
    isPrimary: true,
    pointerId,
    pointerType: 'mouse',
  });
  Object.defineProperty(event, 'timeStamp', { configurable: true, value: timeStamp });
  target.dispatchEvent(event);
}

function touch(target: EventTarget, identifier: number, clientY: number, clientX = 0): Touch {
  return new Touch({ clientX, clientY, identifier, target });
}

function dispatchTouch(
  target: EventTarget,
  type: 'touchstart' | 'touchmove' | 'touchend',
  touches: readonly Touch[],
  changedTouches: readonly Touch[],
  timeStamp: number,
): TouchEvent {
  const event = new TouchEvent(type, {
    bubbles: true,
    cancelable: true,
    changedTouches,
    composed: true,
    targetTouches: touches,
    touches,
  });
  Object.defineProperty(event, 'timeStamp', { configurable: true, value: timeStamp });
  const previousTarget = touchHitTarget;
  if (type === 'touchstart') {
    const target = touches[0]?.target;
    touchHitTarget = target instanceof Element ? target : null;
  }
  target.dispatchEvent(event);
  touchHitTarget = previousTarget;
  return event;
}

function rect(height: number): DOMRect {
  return {
    bottom: height,
    height,
    left: 0,
    right: 300,
    top: 0,
    width: 300,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  };
}
