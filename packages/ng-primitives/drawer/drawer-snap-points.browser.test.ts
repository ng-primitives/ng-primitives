import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  NgpDrawerOpenChangeEvent,
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
      (beforeOpenChange)="beforeOpen($event)"
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
  readonly cancelNextClose = signal(false);
  readonly root = viewChild.required(NgpDrawer);

  beforeSnap(event: NgpDrawerSnapPointChangeEvent): void {
    if (this.cancelNextSnap()) {
      event.cancel();
      this.cancelNextSnap.set(false);
    }
  }

  beforeOpen(event: NgpDrawerOpenChangeEvent): void {
    if (!event.nextOpen && this.cancelNextClose()) {
      event.cancel();
      this.cancelNextClose.set(false);
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

@Component({
  imports: [NgpDrawerPopup, NgpDrawerPortal, NgpDrawer, NgpDrawerViewport],
  template: `
    <ng-container
      [defaultSnapPoint]="'300px'"
      [open]="true"
      [snapPoint]="snapPoint()"
      [snapPoints]="points"
      [modal]="false"
      ngpDrawer
    >
      <ng-template ngpDrawerPortal>
        <div class="viewport" data-test-nested-snap-viewport ngpDrawerViewport>
          <section class="popup" data-test-nested-snap-popup ngpDrawerPopup>
            <ng-container [open]="childOpen()" [modal]="false" ngpDrawer>
              <ng-template ngpDrawerPortal>
                <div class="viewport" ngpDrawerViewport>
                  <section class="popup" data-test-nested-snap-child ngpDrawerPopup></section>
                </div>
              </ng-template>
            </ng-container>
          </section>
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
class NestedSnapHost {
  readonly points: readonly NgpDrawerSnapPoint[] = ['100px', '200px', '300px'];
  readonly childOpen = signal(false);
  readonly snapPoint = signal<NgpDrawerSnapPoint | null | undefined>(undefined);
}

@Component({
  imports: [NgpDrawerPopup, NgpDrawerPortal, NgpDrawer, NgpDrawerViewport],
  template: `
    <ng-container
      [defaultSnapPoint]="defaultPoint()"
      [snapPoints]="points()"
      [swipeDirection]="direction()"
      [modal]="false"
      (snapPointChange)="lastEmitted.set($event)"
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
class UncontrolledSwipeSnapHost {
  readonly points = signal<readonly NgpDrawerSnapPoint[]>(['100px', '200px', '300px']);
  readonly defaultPoint = signal<NgpDrawerSnapPoint | null | undefined>('100px');
  readonly direction = signal<NgpDrawerSwipeDirection>('down');
  readonly lastEmitted = signal<NgpDrawerSnapPoint | null | undefined>(undefined);
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
    // The seed is silent, like Base UI's `useControlled` default (useControlled.ts:34):
    // no snapPointChange fires on first open, so an uncontrolled host's bound signal
    // stays untouched while the drawer itself already holds the resolved default.
    expect(fixture.componentInstance.active()).toBeUndefined();
    expect(fixture.componentInstance.root().snapPoint()).toBe('300px');
    expect(viewport.style.getPropertyValue('--ngp-drawer-height')).toBe('300px');
    expect(popup.style.getPropertyValue('--ngp-drawer-snap-point-offset')).toBe('100px');
  });

  it('resolves an off-list snap point to the nearest declared point', async () => {
    // 0.25 of a 400px viewport is 100px, so the nearest declared point is '100px' (offset 300).
    // The old fallback picked the point closest to the popup height, i.e. always the tallest.
    fixture.componentInstance.active.set(0.25);
    fixture.detectChanges();
    const { viewport, popup } = await openDrawer();

    expect(viewport.style.getPropertyValue('--ngp-drawer-height')).toBe('100px');
    expect(popup.style.getPropertyValue('--ngp-drawer-snap-point-offset')).toBe('300px');
  });

  it('resolves a negative snap point to the shortest declared point', async () => {
    // Base UI clamps a negative to height 0, so the nearest declared point is '100px' (offset 300).
    // ng used to reject the value outright and fall back to the tallest point.
    fixture.componentInstance.active.set(-1);
    fixture.detectChanges();
    const { viewport, popup } = await openDrawer();

    expect(viewport.style.getPropertyValue('--ngp-drawer-height')).toBe('100px');
    expect(popup.style.getPropertyValue('--ngp-drawer-snap-point-offset')).toBe('300px');
  });

  it('publishes no snap point when the active value is not finite', async () => {
    const { viewport, popup } = await openDrawer();
    // Sanity check with the valid default point, so the empty assertions below are meaningful
    // rather than passing because the snap system never ran at all.
    expect(viewport.style.getPropertyValue('--ngp-drawer-height')).toBe('300px');
    expect(popup.style.getPropertyValue('--ngp-drawer-snap-point-offset')).toBe('100px');

    fixture.componentInstance.active.set(Number.NaN);
    fixture.detectChanges();

    await vi.waitFor(() => {
      expect(viewport.style.getPropertyValue('--ngp-drawer-height')).toBe('');
    });
    expect(popup.style.getPropertyValue('--ngp-drawer-snap-point-offset')).toBe('');
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

    expect(uncontrolledFixture.componentInstance.root().snapPoint()).toBe('300px');
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

  it('closes from a fast downward flick instead of snapping to a lower point', async () => {
    const { viewport } = await openDrawer();
    // 20px in 199ms is far short of any snap threshold, but 0.6px/ms is a decisive flick.
    swipe(viewport, 0, 20, 40, 0, 34);
    fixture.detectChanges();

    expect(fixture.componentInstance.root().open()).toBe(false);
  });

  it('closes rather than projecting a downward flick across points', async () => {
    const { viewport } = await openDrawer();
    // 25px in 41ms ≈ 0.61px/ms. ng used to project this onto '100px' and stay open.
    swipe(viewport, 0, 25, 2, 0, 42);
    fixture.detectChanges();

    expect(fixture.componentInstance.root().open()).toBe(false);
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

  it('preserves the rebased displacement after the first native touch sample', async () => {
    const { viewport } = await openDrawer();

    dispatchTouch(viewport, 'touchstart', [touch(viewport, 21, 0)], [], 0);
    dispatchTouch(viewport, 'touchmove', [touch(viewport, 21, 30)], [], 100);
    dispatchTouch(viewport, 'touchmove', [touch(viewport, 21, 160)], [], 1100);
    dispatchTouch(viewport, 'touchend', [], [touch(viewport, 21, 160)], 1101);
    fixture.detectChanges();

    // 130px over 1000ms is 0.13px/ms, well below the flick threshold, so the distance decides.
    // The gesture is rebased onto the first move, so the travel is 160 - 30 = 130px from the
    // '300px' point (offset 100), landing at offset 230 — nearest '200px' (offset 200).
    // Without the rebase the travel would be 160px, landing at offset 260 — nearest '100px'.
    expect(fixture.componentInstance.root().open()).toBe(true);
    expect(fixture.componentInstance.active()).toBe('200px');
  });

  it('derives up-direction snap progress from direction-normalised movement', async () => {
    fixture.componentInstance.points.set(['100px', '300px']);
    fixture.componentInstance.defaultPoint.set('300px');
    fixture.componentInstance.active.set('300px');
    fixture.componentInstance.direction.set('up');
    fixture.detectChanges();
    const { viewport, popup } = await openDrawer();

    dispatchPointer(viewport, 'pointerdown', 0, 1, 23, 0);
    // An up drawer collapses as the pointer moves up, so upward movement - not raw positive Y -
    // advances the snap progress.
    dispatchPointer(viewport, 'pointermove', -50, 1, 23, 100);

    expect(popup.style.getPropertyValue('--ngp-drawer-swipe-movement-y')).toBe('-50px');
    expect(Number(popup.style.getPropertyValue('--ngp-drawer-swipe-progress'))).toBeCloseTo(0.25);
    viewport.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
  });

  it('does not advance up-direction snap progress while expanding', async () => {
    fixture.componentInstance.points.set(['100px', '300px']);
    fixture.componentInstance.defaultPoint.set('300px');
    fixture.componentInstance.active.set('300px');
    fixture.componentInstance.direction.set('up');
    fixture.detectChanges();
    const { viewport, popup } = await openDrawer();

    dispatchPointer(viewport, 'pointerdown', 0, 1, 24, 0);
    dispatchPointer(viewport, 'pointermove', 50, 1, 24, 100);

    expect(Number(popup.style.getPropertyValue('--ngp-drawer-swipe-progress'))).toBe(0);
    viewport.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
  });

  it('prevents sequential mode from skipping an adjacent point', async () => {
    fixture.componentInstance.sequential.set(true);
    const { viewport } = await openDrawer();
    swipe(viewport, 0, 25, 3, 0, 42);
    fixture.detectChanges();
    expect(fixture.componentInstance.active()).toBe('200px');
  });

  it('closes a sequential release that lands past the lowest point', async () => {
    fixture.componentInstance.sequential.set(true);
    fixture.componentInstance.active.set('200px');
    fixture.detectChanges();
    const { viewport } = await openDrawer();
    // From offset 200, 250px of travel lands at the closed edge (400), nearer than the lowest
    // point's offset of 300. ng used to step down to '100px' and stay open.
    swipe(viewport, 0, 250, 4, 0, 400);
    fixture.detectChanges();

    expect(fixture.componentInstance.root().open()).toBe(false);
  });

  it('closes a sequential flick that is already at the most dismissed point', async () => {
    fixture.componentInstance.sequential.set(true);
    fixture.componentInstance.active.set('100px');
    fixture.detectChanges();
    const { viewport } = await openDrawer();
    swipe(viewport, 0, 250, 5, 0, 400);
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

  it('leaves no active snap point after a successful swipe close', async () => {
    fixture.componentInstance.active.set('100px');
    fixture.detectChanges();
    const { viewport } = await openDrawer();
    swipe(viewport, 0, 100, 7, 0, 200);
    fixture.detectChanges();
    expect(fixture.componentInstance.root().open()).toBe(false);
    // A dismissed drawer rests on no snap point. Reporting the default is a height it never had.
    expect(fixture.componentInstance.active()).toBeNull();
  });

  it('keeps the snap offset in the release scalar when a swipe closes the drawer', async () => {
    fixture.componentInstance.active.set('100px');
    fixture.detectChanges();
    const { viewport, popup } = await openDrawer();

    // 20px in 25ms = 0.8px/ms — a decisive flick, so the drawer closes outright. The popup is
    // 400px and rests at offset 300, so only 80px remain to travel: 80 / 0.8 = 100ms, which is
    // inside the scalar's live range. Measuring from offset 0 instead would give 380px, a 475ms
    // duration that clamps to 360ms and a scalar of exactly 1 — the regression this pins.
    swipe(viewport, 0, 20, 43, 0, 26);
    fixture.detectChanges();

    expect(fixture.componentInstance.root().open()).toBe(false);
    expect(popup.style.getPropertyValue('--ngp-drawer-swipe-strength')).toBe('0.164');
  });

  it('restores the previous snap point when the swipe close is vetoed', async () => {
    fixture.componentInstance.active.set('100px');
    fixture.detectChanges();
    const { viewport, popup } = await openDrawer();
    fixture.componentInstance.cancelNextClose.set(true);

    swipe(viewport, 0, 100, 42, 0, 200);
    fixture.detectChanges();

    expect(fixture.componentInstance.root().open()).toBe(true);
    expect(fixture.componentInstance.active()).toBe('100px');
    // The clear and the restore are both synchronous, so the render effect never sees the drawer
    // give up ownership of the height variable to nested visuals (plan 008).
    expect(popup.style.getPropertyValue('--ngp-drawer-height')).toBe('100px');
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
    expect(fixture.componentInstance.active()).toBeNull();
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

  it('preserves an explicit null snap point across a close and a reopen', async () => {
    fixture.componentInstance.active.set(null);
    fixture.detectChanges();
    await openDrawer();
    expect(fixture.componentInstance.active()).toBeNull();

    fixture.componentInstance.root().hide();
    fixture.detectChanges();

    expect(fixture.componentInstance.root().open()).toBe(false);
    // `null` is the consumer's explicit "no snap point", not an unset value waiting for a default.
    expect(fixture.componentInstance.active()).toBeNull();

    await openDrawer();
    expect(fixture.componentInstance.active()).toBeNull();
  });

  it('leaves a controlled null snap point unresolved across a reopen', async () => {
    fixture.componentInstance.active.set(null);
    fixture.detectChanges();
    const { popup } = await openDrawer();

    // A controlled `null` is the consumer's explicit "no snap point" and must survive, unlike the
    // uncontrolled case where it falls back to the default (Base UI DrawerRoot.tsx:99-101).
    expect(fixture.componentInstance.active()).toBeNull();
    expect(popup.style.getPropertyValue('--ngp-drawer-height')).toBe('');
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

  it('resets a moved snap point back to the default on close', async () => {
    fixture.componentInstance.active.set('100px');
    fixture.detectChanges();
    await openDrawer();

    fixture.componentInstance.root().hide();
    fixture.detectChanges();
    // Base UI resets the active point to the resolved default on close
    // (DrawerRoot.tsx:160-169); ng emits the reset so a bound consumer round-trips it.
    expect(fixture.componentInstance.active()).toBe('300px');
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

describe('Drawer snap point height ownership', () => {
  let fixture: ComponentFixture<NestedSnapHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [NestedSnapHost] }).compileComponents();
    fixture = TestBed.createComponent(NestedSnapHost);
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('keeps the active snap height on every part while a child drawer is open', async () => {
    const popup = await vi.waitFor(() => {
      const element = document.querySelector<HTMLElement>('[data-test-nested-snap-popup]');
      expect(element).not.toBeNull();
      return element!;
    });
    expect(popup.style.getPropertyValue('--ngp-drawer-height')).toBe('300px');

    fixture.componentInstance.childOpen.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    // `bindDrawerNestedVisuals` runs after the viewport's snap effect in the same write phase and
    // used to overwrite this with the popup's full 400px height.
    expect(popup.style.getPropertyValue('--ngp-drawer-height')).toBe('300px');
  });

  it('hands the height back to nested visuals when the snap point is cleared', async () => {
    const popup = await vi.waitFor(() => {
      const element = document.querySelector<HTMLElement>('[data-test-nested-snap-popup]');
      expect(element).not.toBeNull();
      return element!;
    });
    fixture.componentInstance.childOpen.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(popup.style.getPropertyValue('--ngp-drawer-height')).toBe('300px');

    fixture.componentInstance.snapPoint.set(null);
    fixture.detectChanges();
    await fixture.whenStable();

    // With no active snap point the viewport releases the variable and the nested freeze applies.
    expect(popup.style.getPropertyValue('--ngp-drawer-height')).toBe('400px');
  });
});

describe('Drawer snap point uncontrolled swipe', () => {
  let fixture: ComponentFixture<UncontrolledSwipeSnapHost>;
  let initialRootFontSize: string;

  beforeEach(async () => {
    vi.spyOn(document, 'elementFromPoint').mockImplementation(() => touchHitTarget);
    await TestBed.configureTestingModule({
      imports: [UncontrolledSwipeSnapHost],
    }).compileComponents();
    initialRootFontSize = document.documentElement.style.fontSize;
    fixture = TestBed.createComponent(UncontrolledSwipeSnapHost);
    fixture.detectChanges();
  });

  afterEach(() => {
    document.documentElement.style.fontSize = initialRootFontSize;
    fixture.destroy();
    vi.restoreAllMocks();
  });

  it('reopens on the default point after a swipe close', async () => {
    const { viewport, popup } = await openDrawer();
    expect(popup.style.getPropertyValue('--ngp-drawer-height')).toBe('100px');

    swipe(viewport, 0, 100, 61, 0, 200);
    fixture.detectChanges();
    expect(fixture.componentInstance.root().open()).toBe(false);

    const reopened = await openDrawer();
    // An uncontrolled drawer has no consumer holding the point, so a dismissed `null` must fall
    // back to the default rather than leaving the drawer with no snap point at all
    // (Base UI DrawerRoot.tsx:98-115).
    expect(reopened.popup.style.getPropertyValue('--ngp-drawer-height')).toBe('100px');
  });

  it('seeds the snap point with the resolved default before the drawer opens', () => {
    // Base UI seeds the uncontrolled value with `default: resolvedDefaultSnapPoint`
    // (DrawerRoot.tsx:71-76), so "never set" is not a state a consumer can observe.
    expect(fixture.componentInstance.root().snapPoint()).toBe('100px');
  });

  it('does not emit snapPointChange when the drawer first opens', async () => {
    await openDrawer();
    // The seed is silent — Base UI's useControlled never fires onSnapPointChange for its
    // default. The old imperative application emitted the default on the first open.
    expect(fixture.componentInstance.lastEmitted()).toBeUndefined();

    fixture.componentInstance.root().hide();
    fixture.detectChanges();
    // Closing an untouched drawer resets nothing: the point already rests on the default.
    expect(fixture.componentInstance.lastEmitted()).toBeUndefined();
  });

  it('reseeds the active point when the resolved default changes', async () => {
    const { viewport, popup } = await openDrawer();
    swipe(viewport, 0, -100, 62, 0, 1000);
    fixture.detectChanges();
    expect(fixture.componentInstance.root().snapPoint()).toBe('200px');

    fixture.componentInstance.defaultPoint.set('300px');
    fixture.detectChanges();
    await fixture.whenStable();

    // Deliberate deviation from Base UI, which keeps the user's point because its
    // useControlled reads the default once — and warns that changing an uncontrolled
    // default is unsupported (useControlled.ts:57-70). Angular inputs land after
    // construction, so a once-only seed would latch a pre-binding null; the linkedSignal
    // reseeds whenever the resolved default's value actually changes instead (plan 016).
    expect(fixture.componentInstance.root().snapPoint()).toBe('300px');
    expect(popup.style.getPropertyValue('--ngp-drawer-height')).toBe('300px');
  });

  it('reports data-expanded again when a swipe-closed drawer reopens on a full default', async () => {
    fixture.componentInstance.points.set(['100px', 1]);
    fixture.componentInstance.defaultPoint.set(1);
    fixture.detectChanges();
    const { viewport, popup } = await openDrawer();
    expect(popup).toHaveAttribute('data-expanded');

    swipe(viewport, 0, 375, 63, 0, 1000);
    fixture.detectChanges();
    expect(fixture.componentInstance.root().open()).toBe(false);

    const reopened = await openDrawer();
    // The swipe's null survives the close (plan 012) and resolves back to the default
    // (plan 015). `expanded` must consume the same resolution: before plan 016 it mapped
    // only `undefined`, so the popup rendered full-height with data-expanded absent.
    expect(reopened.popup).toHaveAttribute('data-expanded');
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
    changedTouches: [...changedTouches],
    composed: true,
    targetTouches: [...touches],
    touches: [...touches],
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
