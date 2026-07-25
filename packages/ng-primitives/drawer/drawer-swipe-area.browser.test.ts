import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgpDrawerBackdrop } from './backdrop/drawer-backdrop';
import { NgpDrawerOpenChangeEvent, NgpDrawerSwipeDirection } from './drawer.types';
import { NgpDrawer } from './drawer/drawer';
import { NgpDrawerPopup } from './popup/drawer-popup';
import { NgpDrawerPortal } from './portal/drawer-portal';
import { NgpDrawerSwipeArea } from './swipe-area/drawer-swipe-area';
import { NgpDrawerViewport } from './viewport/drawer-viewport';

@Component({
  imports: [
    NgpDrawerBackdrop,
    NgpDrawerPopup,
    NgpDrawerPortal,
    NgpDrawer,
    NgpDrawerSwipeArea,
    NgpDrawerViewport,
  ],
  template: `
    <ng-container
      [modal]="false"
      (beforeOpenChange)="record($event)"
      ngpDrawer
      swipeDirection="down"
    >
      <div
        [disabled]="disabled()"
        [ngpDrawerSwipeAreaDirection]="direction()"
        data-test-swipe-area
        ngpDrawerSwipeArea
      ></div>
      <div
        [ngpDrawerSwipeAreaDirection]="direction()"
        data-test-consumer-swipe-area
        ngpDrawerSwipeArea
        style="touch-action: manipulation"
      ></div>
      <ng-template ngpDrawerPortal>
        <div
          data-test-area-backdrop
          ngpDrawerBackdrop
          style="transition: opacity 3s; --ngp-drawer-swipe-progress: 0.2"
        ></div>
        <div ngpDrawerViewport>
          <section
            data-test-area-popup
            ngpDrawerPopup
            style="
              transition: opacity 2s;
              --ngp-drawer-swipe-movement-x: 1px;
              --ngp-drawer-swipe-movement-y: 2px;
              --ngp-drawer-swipe-progress: 0.3;
              --ngp-drawer-swipe-strength: 0.4;
            "
          ></section>
        </div>
      </ng-template>
    </ng-container>
    <button (click)="outsideClicks.set(outsideClicks() + 1)" data-test-area-outside>Outside</button>
  `,
  styles: `
    [data-test-area-popup] {
      height: 200px;
      width: 200px;
    }
  `,
})
class SwipeAreaHost {
  readonly disabled = signal(false);
  readonly direction = signal<NgpDrawerSwipeDirection | undefined>(undefined);
  readonly outsideClicks = signal(0);
  readonly root = viewChild.required(NgpDrawer);
  readonly openChanges: NgpDrawerOpenChangeEvent[] = [];
  cancelRollback = false;

  record(event: NgpDrawerOpenChangeEvent): void {
    this.openChanges.push(event);
    if (this.cancelRollback && !event.nextOpen && event.reason === 'swipe-area') {
      event.cancel();
    }
  }
}

describe('Drawer SwipeArea', () => {
  let fixture: ComponentFixture<SwipeAreaHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SwipeAreaHost] }).compileComponents();
    fixture = TestBed.createComponent(SwipeAreaHost);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('opens in the direction opposite the root dismissal direction', () => {
    swipe(getArea(), { x: 0, y: 150 }, { x: 0, y: 0 }, 1, 'mouse');
    fixture.detectChanges();
    expect(fixture.componentInstance.root().open()).toBe(true);
  });

  it('retains pen Pointer Event opening behavior', () => {
    swipe(getArea(), { x: 0, y: 150 }, { x: 0, y: 0 }, 19, 'pen');
    fixture.detectChanges();

    expect(fixture.componentInstance.root().open()).toBe(true);
  });

  it('opens from the complete first native touch sample in a custom direction', () => {
    fixture.componentInstance.direction.set('right');
    fixture.detectChanges();
    nativeSwipe(getArea(), { x: 0, y: 0 }, { x: 150, y: 0 }, 2, 100);
    fixture.detectChanges();
    expect(fixture.componentInstance.root().open()).toBe(true);
  });

  it('accepts a native touch by distance without relying on velocity', () => {
    nativeSwipe(getArea(), { x: 0, y: 150 }, { x: 0, y: 0 }, 22, 2000);
    fixture.detectChanges();

    expect(fixture.componentInstance.root().open()).toBe(true);
  });

  it('accepts a native touch by velocity below the distance threshold', () => {
    nativeSwipe(getArea(), { x: 0, y: 150 }, { x: 0, y: 130 }, 23, 1);
    fixture.detectChanges();

    expect(fixture.componentInstance.root().open()).toBe(true);
  });

  it('leaves touch Pointer Events inert before ownership and default prevention', () => {
    const area = getArea();
    const setPointerCapture = vi.fn();
    area.setPointerCapture = setPointerCapture;

    const down = dispatch(area, 'pointerdown', {
      buttons: 1,
      pointerId: 18,
      pointerType: 'touch',
      time: 0,
      y: 100,
    });
    const move = dispatch(area, 'pointermove', {
      buttons: 1,
      pointerId: 18,
      pointerType: 'touch',
      time: 1,
      y: 0,
    });
    expect(setPointerCapture).not.toHaveBeenCalled();
    expect(down.defaultPrevented).toBe(false);
    expect(move.defaultPrevented).toBe(false);
    expect(fixture.componentInstance.root().open()).toBe(false);

    dispatch(area, 'pointerdown', {
      buttons: 1,
      pointerId: 19,
      pointerType: 'mouse',
      time: 2,
      y: 100,
    });
    expect(setPointerCapture).toHaveBeenCalledWith(19);
    dispatch(area, 'pointercancel', {
      buttons: 0,
      pointerId: 19,
      pointerType: 'mouse',
      time: 3,
      y: 100,
    });
  });

  it('keeps a native touch without movement closed', () => {
    const area = getArea();
    const start = touch(area, 20, 0, 150);
    dispatchTouch(area, 'touchstart', [start], [start], 0);
    dispatchTouch(document, 'touchend', [], [start], 100);
    fixture.detectChanges();

    expect(fixture.componentInstance.root().open()).toBe(false);
    expect(area.hasAttribute('data-swiping')).toBe(false);
  });

  it('forwards the actual native TouchEvent to provisional rollback', () => {
    const area = getArea();
    const start = touch(area, 21, 0, 150);
    dispatchTouch(area, 'touchstart', [start], [start], 0);
    const moved = touch(area, 21, 0, 140);
    const move = dispatchTouch(document, 'touchmove', [moved], [moved], 200);
    fixture.detectChanges();
    const openEvent = fixture.componentInstance.openChanges.at(-1)!;
    expect(openEvent.nextOpen).toBe(true);
    expect(openEvent.reason).toBe('swipe-area');
    expect(openEvent.nativeEvent).toBe(move);

    const end = dispatchTouch(document, 'touchend', [], [moved], 201);
    fixture.detectChanges();

    expect(fixture.componentInstance.root().open()).toBe(false);
    expect(move.defaultPrevented).toBe(true);
    expect(fixture.componentInstance.openChanges.at(-1)?.nativeEvent).toBe(end);
  });

  it('rolls back an owned provisional opening on native touchcancel', () => {
    const area = getArea();
    const start = touch(area, 24, 0, 150);
    dispatchTouch(area, 'touchstart', [start], [start], 0);
    const moved = touch(area, 24, 0, 100);
    dispatchTouch(document, 'touchmove', [moved], [moved], 100);
    fixture.detectChanges();
    expect(fixture.componentInstance.root().open()).toBe(true);

    const cancel = dispatchTouch(document, 'touchcancel', [], [moved], 101);
    fixture.detectChanges();

    expect(fixture.componentInstance.root().open()).toBe(false);
    expect(area.hasAttribute('data-swiping')).toBe(false);
    expect(fixture.componentInstance.openChanges.at(-1)?.nativeEvent).toBe(cancel);
  });

  it('preserves cross-axis native panning and consumer touch-action styles', () => {
    const area = getArea();
    const consumerArea = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(
      '[data-test-consumer-swipe-area]',
    )!;

    expect(area.style.touchAction).toBe('pan-x');
    expect(consumerArea.style.touchAction).toBe('manipulation');

    fixture.componentInstance.direction.set('right');
    fixture.detectChanges();

    expect(area.style.touchAction).toBe('pan-y');
    expect(consumerArea.style.touchAction).toBe('manipulation');
  });

  it('restores only the touch-action value owned by the directive on destroy', () => {
    const area = getArea();
    const consumerArea = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(
      '[data-test-consumer-swipe-area]',
    )!;

    fixture.destroy();

    expect(area.style.touchAction).toBe('');
    expect(consumerArea.style.touchAction).toBe('manipulation');
  });

  it('remains inactive while disabled or moving in the wrong direction', () => {
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    swipe(getArea(), { x: 0, y: 150 }, { x: 0, y: 0 }, 3, 'mouse');
    expect(fixture.componentInstance.root().open()).toBe(false);
    fixture.componentInstance.disabled.set(false);
    fixture.detectChanges();
    swipe(getArea(), { x: 0, y: 0 }, { x: 0, y: 150 }, 4, 'mouse');
    expect(fixture.componentInstance.root().open()).toBe(false);
  });

  it('opens from velocity when distance remains below the halfway threshold', async () => {
    const area = getArea();
    dispatch(area, 'pointerdown', { buttons: 1, pointerId: 5, time: 0, y: 100 });
    dispatch(area, 'pointermove', { buttons: 1, pointerId: 5, time: 100, y: 80 });
    fixture.detectChanges();
    await vi.waitFor(() => expect(document.querySelector('[data-test-area-popup]')).not.toBeNull());
    dispatch(area, 'pointerup', { buttons: 0, pointerId: 5, time: 101, y: 80 });
    fixture.detectChanges();
    expect(fixture.componentInstance.root().open()).toBe(true);
  });

  it('closes a gesture below both distance and velocity thresholds', async () => {
    const area = getArea();
    dispatch(area, 'pointerdown', { buttons: 1, pointerId: 6, time: 0, y: 100 });
    dispatch(area, 'pointermove', { buttons: 1, pointerId: 6, time: 200, y: 90 });
    fixture.detectChanges();
    await vi.waitFor(() => expect(document.querySelector('[data-test-area-popup]')).not.toBeNull());
    expect(area.hasAttribute('data-swiping')).toBe(true);
    dispatch(area, 'pointerup', { buttons: 0, pointerId: 6, time: 201, y: 90 });
    fixture.detectChanges();
    expect(fixture.componentInstance.root().open()).toBe(false);
    expect(area.hasAttribute('data-swiping')).toBe(false);
  });

  it.each([
    ['up', { x: 0, y: 250 }, { x: 0, y: 25 }, '0px', '-5px'],
    ['down', { x: 0, y: 0 }, { x: 0, y: 225 }, '0px', '5px'],
    ['left', { x: 250, y: 0 }, { x: 25, y: 0 }, '-5px', '0px'],
    ['right', { x: 0, y: 0 }, { x: 225, y: 0 }, '5px', '0px'],
  ] as const)(
    'resists opening overshoot in the %s direction',
    async (direction, start, end, movementX, movementY) => {
      fixture.componentInstance.direction.set(direction);
      fixture.detectChanges();
      const area = getArea();
      dispatch(area, 'pointerdown', { ...start, buttons: 1, pointerId: 7, time: 0 });
      dispatch(area, 'pointermove', { ...end, buttons: 1, pointerId: 7, time: 100 });
      fixture.detectChanges();
      await vi.waitFor(() =>
        expect(document.querySelector('[data-test-area-popup]')).not.toBeNull(),
      );
      await animationFrame();
      const popup = getPopup();
      expect(popup.style.getPropertyValue('--ngp-drawer-swipe-movement-x')).toBe(movementX);
      expect(popup.style.getPropertyValue('--ngp-drawer-swipe-movement-y')).toBe(movementY);
      // Fully pulled out: dismissal progress is 0, so a backdrop styled `calc(1 - progress)` is
      // at full opacity.
      expect(popup.style.getPropertyValue('--ngp-drawer-swipe-progress')).toBe('0');
      dispatch(area, 'pointercancel', { ...end, buttons: 0, pointerId: 7, time: 101 });
      fixture.detectChanges();
      expect(fixture.componentInstance.root().open()).toBe(false);
      expect(area.hasAttribute('data-swiping')).toBe(false);
    },
  );

  it('coalesces writes and restores every changed inline value', async () => {
    const area = getArea();
    dispatch(area, 'pointerdown', { buttons: 1, pointerId: 8, time: 0, y: 180 });
    dispatch(area, 'pointermove', { buttons: 1, pointerId: 8, time: 100, y: 160 });
    fixture.detectChanges();
    await vi.waitFor(() => expect(document.querySelector('[data-test-area-popup]')).not.toBeNull());
    const popup = getPopup();
    dispatch(area, 'pointermove', { buttons: 1, pointerId: 8, time: 200, y: 120 });
    dispatch(area, 'pointermove', { buttons: 1, pointerId: 8, time: 300, y: 100 });
    // The move that opened the drawer is applied as soon as the popup renders, rather than being
    // dropped: 200px popup, 20px of travel, so the popup sits 180px short of fully open.
    expect(popup.style.getPropertyValue('--ngp-drawer-swipe-movement-y')).toBe('180px');
    await animationFrame();
    expect(popup.style.getPropertyValue('--ngp-drawer-swipe-movement-y')).toBe('120px');
    const contextMenu = new MouseEvent('contextmenu', { bubbles: true });
    area.dispatchEvent(contextMenu);
    fixture.detectChanges();
    expect(popup.style.transition).toBe('opacity 2s');
    expect(popup.style.getPropertyValue('--ngp-drawer-swipe-movement-x')).toBe('1px');
    expect(popup.style.getPropertyValue('--ngp-drawer-swipe-movement-y')).toBe('2px');
    expect(popup.style.getPropertyValue('--ngp-drawer-swipe-progress')).toBe('0.3');
    expect(popup.style.getPropertyValue('--ngp-drawer-swipe-strength')).toBe('0.4');
    expect(fixture.componentInstance.root().open()).toBe(false);
    const closeEvent = fixture.componentInstance.openChanges.at(-1)!;
    expect(closeEvent.nextOpen).toBe(false);
    expect(closeEvent.reason).toBe('swipe-area');
    expect(closeEvent.nativeEvent).toBe(contextMenu);
  });

  it('never paints the popup at its resting position during a swipe-open', async () => {
    const area = getArea();
    dispatch(area, 'pointerdown', { buttons: 1, pointerId: 9, time: 0, y: 180 });
    dispatch(area, 'pointermove', { buttons: 1, pointerId: 9, time: 100, y: 150 });
    fixture.detectChanges();
    await vi.waitFor(() => expect(document.querySelector('[data-test-area-popup]')).not.toBeNull());
    const popup = getPopup();

    // A 30px pull on a 200px popup leaves 170px of travel. A value of `0px` would mean the popup
    // was painted fully open for a frame; `2px` would mean the update was dropped entirely.
    const movement = popup.style.getPropertyValue('--ngp-drawer-swipe-movement-y');
    expect(movement).toBe('170px');
    expect(popup.style.transition).toBe('none');
  });

  it('retains the gesture after the pointer leaves the area', () => {
    const area = getArea();
    dispatch(area, 'pointerdown', { buttons: 1, pointerId: 7, time: 0, y: 150 });
    dispatch(document.body, 'pointermove', {
      buttons: 1,
      pointerId: 7,
      time: 100,
      y: 0,
    });
    dispatch(document.body, 'pointerup', { buttons: 0, pointerId: 7, time: 101, y: 0 });
    fixture.detectChanges();
    expect(fixture.componentInstance.root().open()).toBe(true);
  });

  it('suppresses one trailing click when no pointerdown intervenes', () => {
    nativeSwipe(getArea(), { x: 0, y: 150 }, { x: 0, y: 0 }, 8, 100);
    fixture.detectChanges();
    const outside = getOutside();
    const first = outside.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();
    expect(first).toBe(false);
    expect(fixture.componentInstance.outsideClicks()).toBe(0);
    outside.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.outsideClicks()).toBe(1);
  });

  it('disarms the click guard on a fresh pointerdown before outside dismissal', () => {
    nativeSwipe(getArea(), { x: 0, y: 150 }, { x: 0, y: 0 }, 9, 100);
    fixture.detectChanges();
    const outside = getOutside();
    dispatch(outside, 'pointerdown', { buttons: 1, pointerId: 10, time: 1000, y: 0 });
    dispatch(outside, 'pointerup', { buttons: 0, pointerId: 10, time: 1100, y: 0 });
    const allowed = outside.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();
    expect(allowed).toBe(true);
    expect(fixture.componentInstance.outsideClicks()).toBe(1);
    expect(fixture.componentInstance.root().open()).toBe(false);
  });

  it('cleans interruption, pinch, and one-move buttons-zero gestures', () => {
    const area = getArea();
    dispatch(area, 'pointerdown', { buttons: 1, pointerId: 11, time: 0, y: 150 });
    area.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
    expect(area.hasAttribute('data-swiping')).toBe(false);

    const firstTouch = touch(area, 12, 0, 150);
    dispatchTouch(area, 'touchstart', [firstTouch], [firstTouch], 1000);
    const movedTouch = touch(area, 12, 0, 100);
    dispatchTouch(document, 'touchmove', [movedTouch], [movedTouch], 1005);
    fixture.detectChanges();
    expect(fixture.componentInstance.root().open()).toBe(true);
    const secondTouch = touch(area, 13, 0, 150);
    dispatchTouch(area, 'touchstart', [movedTouch, secondTouch], [secondTouch], 1010);
    fixture.detectChanges();
    expect(fixture.componentInstance.root().open()).toBe(false);
    expect(area.hasAttribute('data-swiping')).toBe(false);

    dispatch(area, 'pointerdown', { buttons: 1, pointerId: 14, time: 2000, y: 150 });
    dispatch(area, 'pointermove', { buttons: 0, pointerId: 14, time: 2100, y: 0 });
    dispatch(area, 'pointerup', { buttons: 0, pointerId: 14, time: 2101, y: 0 });
    fixture.detectChanges();
    expect(fixture.componentInstance.root().open()).toBe(true);
  });

  it('rolls back a native provisional opening when disabled during the gesture', () => {
    const area = getArea();
    const start = touch(area, 15, 0, 150);
    dispatchTouch(area, 'touchstart', [start], [start], 0);
    const moved = touch(area, 15, 0, 100);
    dispatchTouch(document, 'touchmove', [moved], [moved], 100);
    fixture.detectChanges();
    expect(fixture.componentInstance.root().open()).toBe(true);

    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();

    expect(fixture.componentInstance.root().open()).toBe(false);
    expect(area.hasAttribute('data-swiping')).toBe(false);
  });

  it('cleans native ownership when the provisional root closes externally', () => {
    const area = getArea();
    const start = touch(area, 25, 0, 150);
    dispatchTouch(area, 'touchstart', [start], [start], 0);
    const moved = touch(area, 25, 0, 100);
    dispatchTouch(document, 'touchmove', [moved], [moved], 100);
    fixture.detectChanges();
    expect(fixture.componentInstance.root().open()).toBe(true);

    fixture.componentInstance.root().hide();
    fixture.detectChanges();
    const later = touch(area, 25, 0, 50);
    const staleMove = dispatchTouch(document, 'touchmove', [later], [later], 200);

    expect(fixture.componentInstance.root().open()).toBe(false);
    expect(area.hasAttribute('data-swiping')).toBe(false);
    expect(staleMove.defaultPrevented).toBe(false);
  });

  it('cleans gesture visuals when the consumer cancels the rollback', async () => {
    const area = getArea();
    fixture.componentInstance.cancelRollback = true;
    dispatch(area, 'pointerdown', { buttons: 1, pointerId: 16, time: 0, y: 180 });
    dispatch(area, 'pointermove', { buttons: 1, pointerId: 16, time: 100, y: 100 });
    fixture.detectChanges();
    await vi.waitFor(() => expect(document.querySelector('[data-test-area-popup]')).not.toBeNull());
    await animationFrame();
    const popup = getPopup();
    expect(popup.style.transition).toBe('none');

    const pointerCancel = dispatch(area, 'pointercancel', {
      buttons: 0,
      pointerId: 16,
      time: 101,
      y: 100,
    });
    fixture.detectChanges();

    expect(fixture.componentInstance.root().open()).toBe(true);
    expect(area.hasAttribute('data-swiping')).toBe(false);
    expect(popup.style.transition).toBe('opacity 2s');
    expect(popup.style.getPropertyValue('--ngp-drawer-swipe-movement-x')).toBe('1px');
    expect(popup.style.getPropertyValue('--ngp-drawer-swipe-movement-y')).toBe('2px');
    expect(popup.style.getPropertyValue('--ngp-drawer-swipe-progress')).toBe('0.3');
    expect(popup.style.getPropertyValue('--ngp-drawer-swipe-strength')).toBe('0.4');
    const closeEvent = fixture.componentInstance.openChanges.at(-1)!;
    expect(closeEvent.nextOpen).toBe(false);
    expect(closeEvent.reason).toBe('swipe-area');
    expect(closeEvent.nativeEvent).toBe(pointerCancel);
    expect(closeEvent.canceled).toBe(true);
  });

  it('does not close a root opened by another owner during a native gesture', () => {
    const area = getArea();
    const start = touch(area, 17, 0, 150);
    dispatchTouch(area, 'touchstart', [start], [start], 0);
    fixture.componentInstance.root().show();
    fixture.detectChanges();

    const moved = touch(area, 17, 0, 100);
    const move = dispatchTouch(document, 'touchmove', [moved], [moved], 100);
    dispatchTouch(document, 'touchcancel', [], [moved], 101);
    fixture.detectChanges();

    expect(fixture.componentInstance.root().open()).toBe(true);
    expect(move.defaultPrevented).toBe(false);
    expect(area.hasAttribute('data-swiping')).toBe(false);
    expect(
      fixture.componentInstance.openChanges.some(
        event => !event.nextOpen && event.reason === 'swipe-area',
      ),
    ).toBe(false);
  });

  it('fades the backdrop in step with the swipe-open gesture', async () => {
    const area = getArea();
    dispatch(area, 'pointerdown', { buttons: 1, pointerId: 12, time: 0, y: 200 });
    dispatch(area, 'pointermove', { buttons: 1, pointerId: 12, time: 100, y: 150 });
    fixture.detectChanges();
    await vi.waitFor(() => expect(document.querySelector('[data-test-area-popup]')).not.toBeNull());
    await animationFrame();

    const backdrop = document.querySelector<HTMLElement>('[data-test-area-backdrop]')!;
    // 50px of a 200px popup: a quarter open, so three quarters still "dismissed". A backdrop
    // styled `calc(1 - progress)` is therefore at 25% opacity and fading in as the finger moves.
    expect(backdrop.style.getPropertyValue('--ngp-drawer-swipe-progress')).toBe('0.75');
    expect(backdrop.style.transition).toBe('none');
    expect(backdrop).toHaveAttribute('data-swiping');

    dispatch(area, 'pointercancel', { buttons: 0, pointerId: 12, time: 101, y: 150 });
    fixture.detectChanges();

    // Rolled back: the consumer's own inline value and transition are handed back.
    expect(backdrop.style.getPropertyValue('--ngp-drawer-swipe-progress')).toBe('0.2');
    expect(backdrop.style.transition).toBe('opacity 3s');
    // Movement and strength stay the popup's business — the backdrop keeps its seeded defaults.
    expect(backdrop.style.getPropertyValue('--ngp-drawer-swipe-movement-y')).toBe('0px');
  });

  function getArea(): HTMLElement {
    return (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(
      '[data-test-swipe-area]',
    )!;
  }

  function getOutside(): HTMLElement {
    return (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(
      '[data-test-area-outside]',
    )!;
  }

  function getPopup(): HTMLElement {
    return document.querySelector<HTMLElement>('[data-test-area-popup]')!;
  }
});

interface PointerOptions {
  readonly x?: number;
  readonly y?: number;
  readonly buttons: number;
  readonly isPrimary?: boolean;
  readonly pointerId: number;
  readonly pointerType?: string;
  readonly time: number;
}

function swipe(
  target: EventTarget,
  start: { x: number; y: number },
  end: { x: number; y: number },
  pointerId: number,
  pointerType: string,
): void {
  dispatch(target, 'pointerdown', {
    ...start,
    buttons: 1,
    pointerId,
    pointerType,
    time: pointerId * 1000,
  });
  dispatch(target, 'pointermove', {
    ...end,
    buttons: 1,
    pointerId,
    pointerType,
    time: pointerId * 1000 + 100,
  });
  dispatch(target, 'pointerup', {
    ...end,
    buttons: 0,
    pointerId,
    pointerType,
    time: pointerId * 1000 + 101,
  });
}

function nativeSwipe(
  target: EventTarget,
  start: { x: number; y: number },
  end: { x: number; y: number },
  identifier: number,
  duration: number,
): void {
  const startTouch = touch(target, identifier, start.x, start.y);
  dispatchTouch(target, 'touchstart', [startTouch], [startTouch], identifier * 1000);
  const endTouch = touch(target, identifier, end.x, end.y);
  dispatchTouch(document, 'touchmove', [endTouch], [endTouch], identifier * 1000 + duration);
  dispatchTouch(document, 'touchend', [], [endTouch], identifier * 1000 + duration + 1);
}

function dispatch(
  target: EventTarget,
  type: 'pointerdown' | 'pointermove' | 'pointerup' | 'pointercancel',
  options: PointerOptions,
): PointerEvent {
  const event = new PointerEvent(type, {
    bubbles: true,
    button: 0,
    buttons: options.buttons,
    clientX: options.x ?? 0,
    clientY: options.y ?? 0,
    composed: true,
    isPrimary: options.isPrimary ?? true,
    pointerId: options.pointerId,
    pointerType: options.pointerType ?? 'mouse',
  });
  Object.defineProperty(event, 'timeStamp', { configurable: true, value: options.time });
  target.dispatchEvent(event);
  return event;
}

function touch(target: EventTarget, identifier: number, clientX: number, clientY: number): Touch {
  return new Touch({ clientX, clientY, identifier, target });
}

function dispatchTouch(
  target: EventTarget,
  type: 'touchstart' | 'touchmove' | 'touchend' | 'touchcancel',
  touches: readonly Touch[],
  changedTouches: readonly Touch[],
  time: number,
): TouchEvent {
  const event = new TouchEvent(type, {
    bubbles: true,
    cancelable: true,
    changedTouches: [...changedTouches],
    composed: true,
    targetTouches: [...touches],
    touches: [...touches],
  });
  Object.defineProperty(event, 'timeStamp', { configurable: true, value: time });
  target.dispatchEvent(event);
  return event;
}

function animationFrame(): Promise<void> {
  return new Promise(resolve => requestAnimationFrame(() => resolve()));
}
