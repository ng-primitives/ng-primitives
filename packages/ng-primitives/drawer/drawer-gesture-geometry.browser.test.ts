import { Component, viewChildren } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgpDrawer } from './drawer/drawer';
import { NgpDrawerPopup } from './popup/drawer-popup';
import { NgpDrawerPortal } from './portal/drawer-portal';
import { NgpDrawerSwipeArea } from './swipe-area/drawer-swipe-area';
import { NgpDrawerViewport } from './viewport/drawer-viewport';

@Component({
  imports: [NgpDrawerPopup, NgpDrawerPortal, NgpDrawer, NgpDrawerSwipeArea, NgpDrawerViewport],
  template: `
    <ng-container [modal]="false" ngpDrawer swipeDirection="down">
      <ng-template ngpDrawerPortal>
        <div class="geometry-viewport" data-test-geometry-viewport ngpDrawerViewport>
          <section class="geometry-popup" data-test-geometry-popup ngpDrawerPopup></section>
        </div>
      </ng-template>
    </ng-container>

    <ng-container [modal]="false" ngpDrawer swipeDirection="down">
      <div data-test-geometry-swipe-area ngpDrawerSwipeArea></div>
      <ng-template ngpDrawerPortal>
        <div ngpDrawerViewport>
          <section class="geometry-popup" data-test-geometry-area-popup ngpDrawerPopup></section>
        </div>
      </ng-template>
    </ng-container>
  `,
  styles: `
    .geometry-viewport,
    .geometry-popup {
      height: 200px;
      width: 200px;
    }
  `,
})
class GeometryHost {
  readonly roots = viewChildren(NgpDrawer);
}

describe('Drawer gesture geometry reads', () => {
  let fixture: ComponentFixture<GeometryHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [GeometryHost] }).compileComponents();
    fixture = TestBed.createComponent(GeometryHost);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('keeps viewport geometry reads constant across move counts and fresh gestures', async () => {
    fixture.componentInstance.roots()[0].show();
    fixture.detectChanges();
    const viewport = await query('[data-test-geometry-viewport]');
    const popup = await query('[data-test-geometry-popup]');
    await fixture.whenStable();
    const viewportRect = vi.spyOn(viewport, 'getBoundingClientRect').mockReturnValue(rect(200));
    const popupRect = vi.spyOn(popup, 'getBoundingClientRect').mockReturnValue(rect(200));

    runViewportGesture(viewport, 1, 1);
    const oneMove = {
      viewport: viewportRect.mock.calls.length,
      popup: popupRect.mock.calls.length,
    };
    expect(fixture.componentInstance.roots()[0].open()).toBe(true);
    expect(document.contains(viewport)).toBe(true);
    viewportRect.mockClear();
    popupRect.mockClear();

    runViewportGesture(viewport, 20, 2);
    const twentyMoves = {
      viewport: viewportRect.mock.calls.length,
      popup: popupRect.mock.calls.length,
    };

    expect(oneMove).toEqual({ viewport: 1, popup: 1 });
    expect(twentyMoves).toEqual(oneMove);
  });

  it('keeps provisional SwipeArea Popup reads constant across move counts', async () => {
    const oneMove = await runSwipeAreaGesture(1, 3);
    const twentyMoves = await runSwipeAreaGesture(20, 4);

    // The popup is measured while it mounts, by three independent readers: the swipe area's
    // `ensureGestureSize`, `NgpDrawerPopup.measurePopupHeight`, and the viewport's
    // `measureSnapGeometry`. That total is deliberately not pinned - it is 3 for the first gesture
    // and 2 for the second, because the second reuses a cached `popupHeight`. What this test is
    // named for, and what actually guards the caching, is the invariant below: once the gesture is
    // under way, no further move measures the popup, however many moves arrive.
    expect(oneMove.duringMount).toBeGreaterThan(0);
    expect(twentyMoves.duringMount).toBeGreaterThan(0);
    expect(oneMove.afterMount).toBe(0);
    expect(twentyMoves.afterMount).toBe(0);
  });

  it('refreshes viewport geometry once on resize during a gesture', async () => {
    fixture.componentInstance.roots()[0].show();
    fixture.detectChanges();
    const viewport = await query('[data-test-geometry-viewport]');
    const popup = await query('[data-test-geometry-popup]');
    await fixture.whenStable();
    const viewportRect = vi.spyOn(viewport, 'getBoundingClientRect').mockReturnValue(rect(200));
    const popupRect = vi.spyOn(popup, 'getBoundingClientRect').mockReturnValue(rect(200));

    dispatchPointer(viewport, 'pointerdown', 0, 1, 5, 5000);
    dispatchPointer(viewport, 'pointermove', 2, 1, 5, 5010);
    expect(viewportRect).toHaveBeenCalledOnce();
    expect(popupRect).toHaveBeenCalledOnce();

    window.dispatchEvent(new Event('resize'));
    expect(viewportRect).toHaveBeenCalledTimes(2);
    expect(popupRect).toHaveBeenCalledTimes(2);

    for (let index = 2; index <= 20; index += 1) {
      dispatchPointer(viewport, 'pointermove', index / 2, 1, 5, 5000 + index * 10);
    }
    dispatchPointer(viewport, 'pointerup', 10, 0, 5, 5300);
    expect(viewportRect).toHaveBeenCalledTimes(2);
    expect(popupRect).toHaveBeenCalledTimes(2);
  });

  it('refreshes SwipeArea threshold geometry after provisional Popup resize', async () => {
    const area = await query('[data-test-geometry-swipe-area]');
    dispatchPointer(area, 'pointerdown', 200, 1, 6, 6000);
    dispatchPointer(area, 'pointermove', 198, 1, 6, 6010);
    fixture.detectChanges();
    const popup = await query('[data-test-geometry-area-popup]');
    await fixture.whenStable();
    const popupRect = vi.spyOn(popup, 'getBoundingClientRect').mockReturnValue(rect(200));
    await animationFrame();
    await animationFrame();
    popupRect.mockClear();

    popupRect.mockReturnValue(rect(240));
    popup.style.height = '240px';
    await vi.waitFor(() => expect(popupRect).toHaveBeenCalledOnce());

    for (let index = 2; index <= 20; index += 1) {
      dispatchPointer(area, 'pointermove', 200 - (index / 20) * 110, 1, 6, 6000 + index * 100);
    }
    dispatchPointer(area, 'pointerup', 90, 0, 6, 8100);
    fixture.detectChanges();

    expect(fixture.componentInstance.roots()[1].open()).toBe(false);
    expect(popupRect).toHaveBeenCalledOnce();
  });

  function runViewportGesture(target: HTMLElement, moves: number, pointerId: number): void {
    const startTime = pointerId * 1000;
    dispatchPointer(target, 'pointerdown', 0, 1, pointerId, startTime);
    for (let index = 1; index <= moves; index += 1) {
      dispatchPointer(
        target,
        'pointermove',
        (index / moves) * 10,
        1,
        pointerId,
        startTime + index * 10,
      );
    }
    dispatchPointer(target, 'pointerup', 10, 0, pointerId, startTime + moves * 10 + 100);
  }

  async function runSwipeAreaGesture(
    moves: number,
    pointerId: number,
  ): Promise<{ duringMount: number; afterMount: number }> {
    const area = await query('[data-test-geometry-swipe-area]');
    const startTime = pointerId * 1000;
    // The swipe area measures the popup in the render write phase that mounts it, so an instance
    // spy installed after `detectChanges()` would never see the read. Patch the prototype before
    // the gesture starts and count only the calls made against the provisional popup.
    const original = Element.prototype.getBoundingClientRect;
    let reads = 0;
    Element.prototype.getBoundingClientRect = function (this: Element): DOMRect {
      if (this.matches('[data-test-geometry-area-popup]')) {
        reads += 1;
        return rect(200);
      }
      return original.call(this);
    };
    try {
      dispatchPointer(area, 'pointerdown', 200, 1, pointerId, startTime);
      dispatchPointer(area, 'pointermove', 198, 1, pointerId, startTime + 10);
      fixture.detectChanges();
      await query('[data-test-geometry-area-popup]');
      await fixture.whenStable();
      await animationFrame();
      // Everything up to here is the mount: several directives measure the popup once each. The
      // count that matters is what follows, once the gesture is already under way.
      const duringMount = reads;
      reads = 0;

      for (let index = 2; index <= moves; index += 1) {
        dispatchPointer(
          area,
          'pointermove',
          200 - (index / moves) * 10,
          1,
          pointerId,
          startTime + index * 10,
        );
      }
      dispatchPointer(area, 'pointerup', 190, 0, pointerId, startTime + moves * 10 + 100);
      fixture.detectChanges();
      const afterMount = reads;
      await vi.waitFor(() =>
        expect(document.querySelector('[data-test-geometry-area-popup]')).toBeNull(),
      );
      return { afterMount, duringMount };
    } finally {
      Element.prototype.getBoundingClientRect = original;
    }
  }
});

function dispatchPointer(
  target: EventTarget,
  type: 'pointerdown' | 'pointermove' | 'pointerup',
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

function query(selector: string): Promise<HTMLElement> {
  return vi.waitFor(() => {
    const element = document.querySelector<HTMLElement>(selector);
    expect(element).not.toBeNull();
    return element!;
  });
}

function rect(size: number): DOMRect {
  return {
    bottom: size,
    height: size,
    left: 0,
    right: size,
    top: 0,
    width: size,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  };
}

function animationFrame(): Promise<void> {
  return new Promise(resolve => requestAnimationFrame(() => resolve()));
}
