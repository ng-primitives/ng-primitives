import { OverlayContainer, OverlayModule } from '@angular/cdk/overlay';
import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgpDrawerBackdrop } from './backdrop/drawer-backdrop';
import { NgpDrawerContent } from './content/drawer-content';
import { NgpDrawerOpenChangeEvent, NgpDrawerSwipeDirection } from './drawer.types';
import { NgpDrawer } from './drawer/drawer';
import { NgpDrawerPopup } from './popup/drawer-popup';
import { NgpDrawerPortal } from './portal/drawer-portal';
import { NgpDrawerSwipeIgnore } from './swipe-ignore/drawer-swipe-ignore';
import { NgpDrawerViewport } from './viewport/drawer-viewport';

@Component({
  imports: [
    OverlayModule,
    NgpDrawerBackdrop,
    NgpDrawerContent,
    NgpDrawerPopup,
    NgpDrawerPortal,
    NgpDrawer,
    NgpDrawerSwipeIgnore,
    NgpDrawerViewport,
  ],
  template: `
    <ng-container
      [swipeDirection]="direction()"
      [modal]="false"
      (beforeOpenChange)="beforeOpenChange($event)"
      ngpDrawer
    >
      <ng-template ngpDrawerPortal>
        <div data-test-backdrop ngpDrawerBackdrop style="transition: opacity 1s"></div>
        <div [swipeEnabled]="enabled()" data-test-viewport ngpDrawerViewport>
          <section data-test-popup ngpDrawerPopup style="transition: opacity 2s">
            <div data-test-content ngpDrawerContent><button data-test-button>button</button></div>
            <input data-test-input />
            <textarea data-test-textarea></textarea>
            <div contenteditable="true" data-test-editable></div>
            <input data-test-range type="range" />
            <div data-test-ignore ngpDrawerSwipeIgnore></div>
            <div data-test-scroll-x style="height: 100px; overflow-x: auto; width: 100px">
              <div style="height: 100px; width: 300px"></div>
            </div>
            <div data-test-scroll-y style="height: 100px; overflow-y: auto; width: 100px">
              <div style="height: 300px; width: 100px"></div>
            </div>
          </section>
        </div>
      </ng-template>
    </ng-container>
  `,
  styles: `
    [data-test-popup] {
      transform: translateY(var(--ngp-drawer-swipe-movement-y, 0));
    }
    [data-test-popup][data-ending-style] {
      transform: translateY(200px);
    }
    [data-test-backdrop] {
      opacity: calc(1 - var(--ngp-drawer-swipe-progress, 0));
    }
    [data-test-backdrop][data-ending-style] {
      opacity: 0;
    }
  `,
})
class SwipeHost {
  readonly direction = signal<NgpDrawerSwipeDirection>('down');
  readonly enabled = signal(true);
  readonly cancelNextClose = signal(false);
  readonly root = viewChild.required(NgpDrawer);
  readonly viewport = viewChild.required(NgpDrawerViewport);

  beforeOpenChange(event: NgpDrawerOpenChangeEvent): void {
    if (!event.nextOpen && this.cancelNextClose()) {
      event.cancel();
      this.cancelNextClose.set(false);
    }
  }
}

let touchHitTarget: Element | null | undefined;

describe('Drawer Viewport swipe integration', () => {
  let fixture: ComponentFixture<SwipeHost>;
  let overlayContainer: OverlayContainer;

  beforeEach(async () => {
    touchHitTarget = undefined;
    vi.spyOn(document, 'elementFromPoint').mockImplementation(() => touchHitTarget ?? null);
    await TestBed.configureTestingModule({ imports: [SwipeHost] }).compileComponents();
    overlayContainer = TestBed.inject(OverlayContainer);
    fixture = TestBed.createComponent(SwipeHost);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    overlayContainer.ngOnDestroy();
    vi.restoreAllMocks();
  });

  it.each([
    ['down', 0, 70],
    ['up', 0, -70],
    ['right', 70, 0],
    ['left', -70, 0],
  ] as const)('dismisses a %s pointer swipe', async (direction, x, y) => {
    fixture.componentInstance.direction.set(direction);
    const viewport = await openDrawer();
    swipe(viewport, { x: 0, y: 0 }, { x, y }, 1, 'mouse');
    fixture.detectChanges();
    expect(fixture.componentInstance.root().open()).toBe(false);
  });

  it('dismisses a pen swipe', async () => {
    const viewport = await openDrawer();
    swipe(viewport, { x: 0, y: 0 }, { x: 0, y: 70 }, 2, 'pen');
    fixture.detectChanges();
    expect(fixture.componentInstance.root().open()).toBe(false);
  });

  it('ignores touch Pointer Events without preventing their default behavior', async () => {
    const viewport = await openDrawer();
    const down = dispatchPointer(viewport, 'pointerdown', {
      buttons: 1,
      pointerId: 20,
      pointerType: 'touch',
      time: 0,
      y: 0,
    });
    const move = dispatchPointer(viewport, 'pointermove', {
      buttons: 1,
      pointerId: 20,
      pointerType: 'touch',
      time: 10,
      y: 2,
    });
    const up = dispatchPointer(viewport, 'pointerup', {
      buttons: 0,
      pointerId: 20,
      pointerType: 'touch',
      time: 20,
      y: 2,
    });
    const cancel = dispatchPointer(viewport, 'pointercancel', {
      buttons: 0,
      pointerId: 20,
      pointerType: 'touch',
      time: 21,
      y: 2,
    });

    expect([down, move, up, cancel].every(event => event.defaultPrevented === false)).toBe(true);
    expect(viewport.hasAttribute('data-swiping')).toBe(false);
    expect(fixture.componentInstance.root().open()).toBe(true);
  });

  it('dismisses a native touch swipe', async () => {
    const viewport = await openDrawer();
    const popup = query('[data-test-popup]');
    dispatchTouch(viewport, 'touchstart', [touch(viewport, 30, 0, 0)], [], 0);
    const firstMove = dispatchTouch(viewport, 'touchmove', [touch(viewport, 30, 0, 10)], [], 100);
    const secondMove = dispatchTouch(viewport, 'touchmove', [touch(viewport, 30, 0, 80)], [], 200);
    expect(popup.style.getPropertyValue('--ngp-drawer-swipe-movement-y')).toBe('70px');
    dispatchTouch(viewport, 'touchend', [], [touch(viewport, 30, 0, 80)], 201);
    fixture.detectChanges();

    expect(firstMove.defaultPrevented).toBe(true);
    expect(secondMove.defaultPrevented).toBe(true);
    expect(fixture.componentInstance.root().open()).toBe(false);
    expect(popup.style.getPropertyValue('--ngp-drawer-swipe-movement-y')).toBe('70px');
  });

  it('keeps a tap unclaimed and absorbs the delayed first iOS move without a visual jump', async () => {
    const viewport = await openDrawer();
    const popup = query('[data-test-popup]');
    const click = vi.fn();
    viewport.addEventListener('click', click);

    const start = dispatchTouch(viewport, 'touchstart', [touch(viewport, 70, 0, 0)], [], 0);
    const end = dispatchTouch(viewport, 'touchend', [], [touch(viewport, 70, 0, 0)], 1);
    viewport.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(start.defaultPrevented).toBe(false);
    expect(end.defaultPrevented).toBe(false);
    expect(click).toHaveBeenCalledOnce();
    expect(viewport).not.toHaveAttribute('data-swiping');

    dispatchTouch(viewport, 'touchstart', [touch(viewport, 71, 0, 0)], [], 10);
    const firstMove = dispatchTouch(viewport, 'touchmove', [touch(viewport, 71, 0, 70)], [], 110);
    expect(firstMove.defaultPrevented).toBe(true);
    expect(popup.style.getPropertyValue('--ngp-drawer-swipe-movement-y')).toBe('0px');

    const secondMove = dispatchTouch(viewport, 'touchmove', [touch(viewport, 71, 0, 90)], [], 210);
    expect(secondMove.defaultPrevented).toBe(true);
    expect(popup.style.getPropertyValue('--ngp-drawer-swipe-movement-y')).toBe('20px');
    dispatchTouch(viewport, 'touchend', [], [touch(viewport, 71, 0, 90)], 211);
    fixture.detectChanges();
    expect(fixture.componentInstance.root().open()).toBe(true);
  });

  it('writes visuals synchronously and restores every consumer inline value', async () => {
    const viewport = await openDrawer();
    const popup = query('[data-test-popup]');
    const backdrop = query('[data-test-backdrop]');
    const elements = [viewport, popup, backdrop];
    const consumerTransform = 'translateX(7px) scale(0.9)';
    popup.style.transform = consumerTransform;
    for (const element of elements) {
      element.style.setProperty('--ngp-drawer-swipe-movement-x', '1px');
      element.style.setProperty('--ngp-drawer-swipe-movement-y', '2px');
      element.style.setProperty('--ngp-drawer-swipe-progress', '0.3');
      element.style.setProperty('--ngp-drawer-swipe-strength', '0.4');
    }

    dispatchPointer(viewport, 'pointerdown', { y: 0, buttons: 1, pointerId: 3, time: 0 });
    expect(popup.style.transition).toBe('none');
    dispatchPointer(viewport, 'pointermove', { y: 15, buttons: 1, pointerId: 3, time: 100 });
    dispatchPointer(viewport, 'pointermove', { y: 25, buttons: 1, pointerId: 3, time: 200 });
    expect(popup.style.getPropertyValue('--ngp-drawer-swipe-movement-y')).toBe('25px');
    expect(popup.style.transform).toContain('translate3d(7px, 25px, 0px) scale(0.9)');
    viewport.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
    fixture.detectChanges();

    expect(viewport.hasAttribute('data-swiping')).toBe(false);
    expect(popup.style.transition).toBe('opacity 2s');
    expect(popup.style.transform).toBe(consumerTransform);
    expect(backdrop.style.transition).toBe('opacity 1s');
    for (const element of elements) {
      expect(element.style.getPropertyValue('--ngp-drawer-swipe-movement-x')).toBe('1px');
      expect(element.style.getPropertyValue('--ngp-drawer-swipe-movement-y')).toBe('2px');
      expect(element.style.getPropertyValue('--ngp-drawer-swipe-progress')).toBe('0.3');
      expect(element.style.getPropertyValue('--ngp-drawer-swipe-strength')).toBe('0.4');
    }
  });

  it('continues a velocity dismissal from the released swipe visuals', async () => {
    const viewport = await openDrawer();
    const popup = query('[data-test-popup]');
    const backdrop = query('[data-test-backdrop]');
    popup.style.transition = 'transform calc(var(--ngp-drawer-swipe-strength) * 400ms) linear';
    backdrop.style.transition = 'opacity calc(var(--ngp-drawer-swipe-strength) * 400ms) linear';

    dispatchPointer(viewport, 'pointerdown', {
      y: 0,
      buttons: 1,
      pointerId: 4,
      time: 0,
    });
    dispatchPointer(viewport, 'pointermove', {
      y: 30,
      buttons: 1,
      pointerId: 4,
      time: 20,
    });
    await animationFrame();
    expect(popup.style.getPropertyValue('--ngp-drawer-swipe-strength')).toBe('0.75');

    dispatchPointer(viewport, 'pointerup', {
      y: 30,
      buttons: 0,
      pointerId: 4,
      time: 21,
    });
    fixture.detectChanges();

    expect(fixture.componentInstance.root().open()).toBe(false);
    expect(popup.style.transform).toBe('');
    expect(popup.style.transition).toBe(
      'transform calc(var(--ngp-drawer-swipe-strength) * 400ms) linear',
    );
    expect(popup.style.getPropertyValue('--ngp-drawer-swipe-movement-y')).toBe('30px');
    expect(popup.style.getPropertyValue('--ngp-drawer-swipe-progress')).toBe('0.15');
    expect(popup.style.getPropertyValue('--ngp-drawer-swipe-strength')).toBe('0.75');
    await animationFrame();
    expect(popup).toHaveAttribute('data-ending-style');
    expect(getComputedStyle(popup).transitionDuration).toBe('0.3s');
    const animations = popup.getAnimations();
    expect(animations.some(animation => animation.playState === 'running')).toBe(true);
    const setProperty = popup.style.setProperty.bind(popup.style);
    let retainedMovementRestoredDuringEndingStyle = false;
    vi.spyOn(popup.style, 'setProperty').mockImplementation((property, value, priority) => {
      if (property === '--ngp-drawer-swipe-movement-y' && value === '0px') {
        retainedMovementRestoredDuringEndingStyle = popup.hasAttribute('data-ending-style');
      }
      setProperty(property, value, priority);
    });

    await Promise.all(animations.map(animation => animation.finished));
    await vi.waitFor(() => expect(document.contains(popup)).toBe(false));
    expect(retainedMovementRestoredDuringEndingStyle).toBe(true);
    expect(popup.style.getPropertyValue('--ngp-drawer-swipe-movement-y')).toBe('0px');
    expect(popup.style.getPropertyValue('--ngp-drawer-swipe-progress')).toBe('0');
    expect(popup.style.getPropertyValue('--ngp-drawer-swipe-strength')).toBe('1');
  });

  it('restores the released visuals when swipe dismissal is canceled', async () => {
    const viewport = await openDrawer();
    const popup = query('[data-test-popup]');
    const consumerTransform = 'translateX(11px) scale(0.8)';
    popup.style.transform = consumerTransform;
    fixture.componentInstance.cancelNextClose.set(true);

    dispatchPointer(viewport, 'pointerdown', {
      y: 0,
      buttons: 1,
      pointerId: 5,
      time: 0,
    });
    dispatchPointer(viewport, 'pointermove', {
      y: 70,
      buttons: 1,
      pointerId: 5,
      time: 100,
    });
    await animationFrame();
    dispatchPointer(viewport, 'pointerup', {
      y: 70,
      buttons: 0,
      pointerId: 5,
      time: 101,
    });
    fixture.detectChanges();

    expect(fixture.componentInstance.root().open()).toBe(true);
    expect(viewport).not.toHaveAttribute('data-swipe-dismiss');
    expect(popup.style.transition).toBe('opacity 2s');
    expect(popup.style.transform).toBe(consumerTransform);
    expect(popup.style.getPropertyValue('--ngp-drawer-swipe-movement-y')).toBe('0px');
    expect(popup.style.getPropertyValue('--ngp-drawer-swipe-progress')).toBe('0');
    expect(popup.style.getPropertyValue('--ngp-drawer-swipe-strength')).toBe('1');
  });

  it('restores consumer-owned drag styles when the Viewport is destroyed', async () => {
    const viewport = await openDrawer();
    const popup = query('[data-test-popup]');
    const consumerTransform = 'translateX(13px) scale(0.75)';
    const consumerTransition = 'transform 175ms ease-in';
    popup.style.transform = consumerTransform;
    popup.style.transition = consumerTransition;
    popup.style.setProperty('--ngp-drawer-swipe-movement-y', '3px');

    dispatchPointer(viewport, 'pointerdown', { y: 0, buttons: 1, pointerId: 51, time: 0 });
    dispatchPointer(viewport, 'pointermove', { y: 20, buttons: 1, pointerId: 51, time: 100 });
    expect(popup.style.transition).toBe('none');
    expect(popup.style.transform).not.toBe(consumerTransform);

    fixture.destroy();

    expect(popup.style.transform).toBe(consumerTransform);
    expect(popup.style.transition).toBe(consumerTransition);
    expect(popup.style.getPropertyValue('--ngp-drawer-swipe-movement-y')).toBe('3px');
  });

  it('cleans retained swipe visuals when reopened during exit', async () => {
    const viewport = await openDrawer();
    const popup = query('[data-test-popup]');

    dispatchPointer(viewport, 'pointerdown', {
      y: 0,
      buttons: 1,
      pointerId: 6,
      time: 0,
    });
    dispatchPointer(viewport, 'pointermove', {
      y: 30,
      buttons: 1,
      pointerId: 6,
      time: 20,
    });
    await animationFrame();
    dispatchPointer(viewport, 'pointerup', {
      y: 30,
      buttons: 0,
      pointerId: 6,
      time: 21,
    });
    fixture.componentInstance.root().show();
    fixture.detectChanges();

    await vi.waitFor(() => expect(fixture.componentInstance.root().open()).toBe(true));
    await vi.waitFor(() =>
      expect(popup.style.getPropertyValue('--ngp-drawer-swipe-movement-y')).toBe('0px'),
    );
    expect(document.contains(popup)).toBe(true);
    expect(popup.style.getPropertyValue('--ngp-drawer-swipe-progress')).toBe('0');
    expect(popup.style.getPropertyValue('--ngp-drawer-swipe-strength')).toBe('1');
  });

  it('protects Content, editing controls, ranges, and ignore markers', async () => {
    await openDrawer();
    const cases = [
      ['[data-test-content]', 'mouse'],
      ['[data-test-button]', 'mouse'],
      ['[data-test-input]', 'touch'],
      ['[data-test-textarea]', 'touch'],
      ['[data-test-editable]', 'touch'],
      ['[data-test-range]', 'touch'],
      ['[data-test-ignore]', 'touch'],
    ] as const;
    cases.forEach(([selector, pointerType], index) => {
      const target = query(selector);
      if (pointerType === 'touch') {
        touchSwipe(target, { x: 0, y: 0 }, { x: 0, y: 80 }, 10 + index);
      } else {
        swipe(target, { x: 0, y: 0 }, { x: 0, y: 80 }, 10 + index, pointerType);
      }
    });
    fixture.detectChanges();
    expect(fixture.componentInstance.root().open()).toBe(true);
  });

  it('uses the coordinate hit target before a different composed target', async () => {
    const viewport = await openDrawer();
    const range = query('[data-test-range]');
    touchHitTarget = range;

    dispatchTouch(viewport, 'touchstart', [touch(viewport, 75, 10, 10)], [], 0);
    const move = dispatchTouch(viewport, 'touchmove', [touch(viewport, 75, 10, 90)], [], 100);
    dispatchTouch(viewport, 'touchend', [], [touch(viewport, 75, 10, 90)], 101);
    touchHitTarget = undefined;

    expect(move.defaultPrevented).toBe(false);
    expect(viewport).not.toHaveAttribute('data-swiping');
    expect(fixture.componentInstance.root().open()).toBe(true);
  });

  it('allows touch dismissal from ordinary interactive Content', async () => {
    await openDrawer();
    touchSwipe(query('[data-test-button]'), { x: 0, y: 0 }, { x: 0, y: 70 }, 20);
    fixture.detectChanges();
    expect(fixture.componentInstance.root().open()).toBe(false);
  });

  it.each([
    ['down', '[data-test-scroll-y]', 'scrollTop', 20, 0, { x: 0, y: 25 }],
    ['up', '[data-test-scroll-y]', 'scrollTop', 180, 200, { x: 0, y: -25 }],
    ['right', '[data-test-scroll-x]', 'scrollLeft', 20, 0, { x: 25, y: 0 }],
    ['left', '[data-test-scroll-x]', 'scrollLeft', 180, 200, { x: -25, y: 0 }],
  ] as const)(
    'rebases a %s gesture when native scrolling reaches the edge',
    async (direction, selector, offsetName, initialOffset, edgeOffset, movement) => {
      fixture.componentInstance.direction.set(direction);
      await openDrawer();
      const scrollable = query(selector);
      setDimensions(scrollable, {
        clientHeight: 100,
        scrollHeight: 300,
        clientWidth: 100,
        scrollWidth: 300,
      });
      Object.defineProperty(scrollable, offsetName, {
        configurable: true,
        value: initialOffset,
        writable: true,
      });
      dispatchTouch(scrollable, 'touchstart', [touch(scrollable, 30, 0, 0)], [], 0);
      const scrollingMove = dispatchTouch(
        scrollable,
        'touchmove',
        [touch(scrollable, 30, movement.x * 4, movement.y * 4)],
        [],
        100,
      );
      Object.assign(scrollable, { [offsetName]: edgeOffset });
      dispatchTouch(
        scrollable,
        'touchmove',
        [touch(scrollable, 30, movement.x * 4, movement.y * 4)],
        [],
        200,
      );
      const edgeMove = dispatchTouch(
        document.body,
        'touchmove',
        [touch(scrollable, 30, movement.x * 5, movement.y * 5)],
        [],
        400,
      );
      const drawerMove = dispatchTouch(
        document.body,
        'touchmove',
        [touch(scrollable, 30, movement.x * 6, movement.y * 6)],
        [],
        500,
      );
      dispatchTouch(
        document.body,
        'touchend',
        [],
        [touch(scrollable, 30, movement.x * 6, movement.y * 6)],
        501,
      );
      fixture.detectChanges();
      expect(scrollingMove.defaultPrevented).toBe(false);
      expect(edgeMove.defaultPrevented).toBe(true);
      expect(drawerMove.defaultPrevented).toBe(true);
      expect(fixture.componentInstance.root().open()).toBe(true);
    },
  );

  it('preserves native Drawer-axis scrolling away from the dismissal edge', async () => {
    await openDrawer();
    const scrollable = query('[data-test-scroll-y]');
    setDimensions(scrollable, { clientHeight: 100, scrollHeight: 300 });
    scrollable.scrollTop = 80;
    dispatchTouch(scrollable, 'touchstart', [touch(scrollable, 72, 0, 0)], [], 0);
    const move = dispatchTouch(scrollable, 'touchmove', [touch(scrollable, 72, 0, 20)], [], 100);
    dispatchTouch(scrollable, 'touchend', [], [touch(scrollable, 72, 0, 20)], 101);
    expect(move.defaultPrevented).toBe(false);
    expect(fixture.componentInstance.root().open()).toBe(true);
  });

  it('returns reverse and dominant cross-axis movement to native scrolling before ownership', async () => {
    await openDrawer();
    const vertical = query('[data-test-scroll-y]');
    setDimensions(vertical, { clientHeight: 100, scrollHeight: 300 });
    vertical.scrollTop = 0;
    dispatchTouch(vertical, 'touchstart', [touch(vertical, 73, 0, 20)], [], 0);
    const reverse = dispatchTouch(vertical, 'touchmove', [touch(vertical, 73, 0, 0)], [], 100);
    dispatchTouch(vertical, 'touchend', [], [touch(vertical, 73, 0, 0)], 101);

    const horizontal = query('[data-test-scroll-x]');
    setDimensions(horizontal, { clientWidth: 100, scrollWidth: 300 });
    horizontal.scrollLeft = 50;
    dispatchTouch(horizontal, 'touchstart', [touch(horizontal, 74, 0, 0)], [], 200);
    const cross = dispatchTouch(horizontal, 'touchmove', [touch(horizontal, 74, 30, 2)], [], 300);
    expect(reverse.defaultPrevented).toBe(false);
    expect(cross.defaultPrevented).toBe(false);
    expect(query('[data-test-viewport]')).not.toHaveAttribute('data-swiping');
  });

  it('claims both Drawer-axis directions on ordinary Viewport content', async () => {
    const viewport = await openDrawer();
    const popup = query('[data-test-popup]');
    dispatchTouch(viewport, 'touchstart', [touch(viewport, 77, 0, 30)], [], 0);
    const firstMove = dispatchTouch(viewport, 'touchmove', [touch(viewport, 77, 0, 0)], [], 100);
    const secondMove = dispatchTouch(viewport, 'touchmove', [touch(viewport, 77, 0, -30)], [], 200);

    expect(firstMove.defaultPrevented).toBe(true);
    expect(secondMove.defaultPrevented).toBe(true);
    expect(
      Number.parseFloat(popup.style.getPropertyValue('--ngp-drawer-swipe-movement-y')),
    ).toBeLessThan(0);

    dispatchTouch(viewport, 'touchend', [], [touch(viewport, 77, 0, -30)], 201);

    expect(fixture.componentInstance.root().open()).toBe(true);
  });

  it('does not let a cross-axis scroller block dismissal', async () => {
    await openDrawer();
    const scrollable = query('[data-test-scroll-x]');
    setDimensions(scrollable, { clientWidth: 100, scrollWidth: 300 });
    scrollable.scrollLeft = 50;
    touchSwipe(scrollable, { x: 0, y: 0 }, { x: 0, y: 70 }, 31);
    fixture.detectChanges();
    expect(fixture.componentInstance.root().open()).toBe(false);
  });

  it('arbitrates an assigned slot through its ShadowRoot host', async () => {
    await openDrawer();
    const scrollable = query('[data-test-scroll-y]');
    setDimensions(scrollable, { clientHeight: 100, scrollHeight: 300 });
    scrollable.scrollTop = 25;
    const host = document.createElement('div');
    const shadow = host.attachShadow({ mode: 'open' });
    shadow.append(document.createElement('slot'));
    const assigned = document.createElement('span');
    host.append(assigned);
    scrollable.append(host);
    touchSwipe(assigned, { x: 0, y: 0 }, { x: 0, y: 80 }, 32);
    fixture.detectChanges();
    expect(fixture.componentInstance.root().open()).toBe(true);
  });

  it('tracks a composed shadow descendant and survives the pointer leaving', async () => {
    await openDrawer();
    const popup = query('[data-test-popup]');
    const host = document.createElement('div');
    const shadow = host.attachShadow({ mode: 'open' });
    const child = document.createElement('span');
    shadow.append(child);
    popup.append(host);
    dispatchPointer(child, 'pointerdown', { buttons: 1, pointerId: 40, time: 0, y: 0 });
    dispatchPointer(document.body, 'pointermove', {
      buttons: 1,
      pointerId: 40,
      time: 100,
      y: 70,
    });
    dispatchPointer(document.body, 'pointerup', {
      buttons: 0,
      pointerId: 40,
      time: 101,
      y: 70,
    });
    fixture.detectChanges();
    expect(fixture.componentInstance.root().open()).toBe(false);
  });

  it('cancels an owned native touch when a second touch starts', async () => {
    const viewport = await openDrawer();
    const first = touch(viewport, 50, 0, 0);
    dispatchTouch(viewport, 'touchstart', [first], [], 0);
    dispatchTouch(viewport, 'touchmove', [touch(viewport, 50, 0, 20)], [], 100);
    const secondStart = dispatchTouch(
      viewport,
      'touchstart',
      [touch(viewport, 50, 0, 20), touch(viewport, 51, 1, 20)],
      [touch(viewport, 51, 1, 20)],
      110,
    );
    fixture.detectChanges();
    expect(secondStart.defaultPrevented).toBe(false);
    expect(fixture.componentInstance.root().open()).toBe(true);
    expect(viewport.hasAttribute('data-swiping')).toBe(false);
  });

  it('never claims a touch while text is selected', async () => {
    await openDrawer();
    const content = query('[data-test-content]');
    const text = content.querySelector('button')!.firstChild!;
    const range = document.createRange();
    range.selectNodeContents(text);
    const selection = document.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);

    dispatchTouch(content, 'touchstart', [touch(content, 76, 0, 0)], [], 0);
    const move = dispatchTouch(content, 'touchmove', [touch(content, 76, 0, 80)], [], 100);
    dispatchTouch(content, 'touchend', [], [touch(content, 76, 0, 80)], 101);
    selection.removeAllRanges();

    expect(move.defaultPrevented).toBe(false);
    expect(fixture.componentInstance.root().open()).toBe(true);
  });

  it('keeps native touch gestures on document listeners without pointer capture', async () => {
    const viewport = await openDrawer();
    const setPointerCapture = vi.fn();
    viewport.setPointerCapture = setPointerCapture;

    dispatchTouch(viewport, 'touchstart', [touch(viewport, 52, 0, 0)], [], 0);
    expect(setPointerCapture).not.toHaveBeenCalled();
    dispatchTouch(viewport, 'touchend', [], [touch(viewport, 52, 0, 0)], 1);

    dispatchPointer(viewport, 'pointerdown', {
      buttons: 1,
      pointerId: 53,
      pointerType: 'mouse',
      time: 2,
      y: 0,
    });
    expect(setPointerCapture).toHaveBeenCalledWith(53);
    dispatchPointer(viewport, 'pointerup', {
      buttons: 0,
      pointerId: 53,
      pointerType: 'mouse',
      time: 3,
      y: 0,
    });
  });

  it('keeps pointer and native touch ownership isolated', async () => {
    let viewport = await openDrawer();
    dispatchTouch(viewport, 'touchstart', [touch(viewport, 54, 0, 0)], [], 0);
    dispatchPointer(viewport, 'pointerdown', { buttons: 1, pointerId: 55, time: 1, y: 0 });
    dispatchTouch(viewport, 'touchmove', [touch(viewport, 54, 0, 10)], [], 100);
    dispatchTouch(viewport, 'touchmove', [touch(viewport, 54, 0, 80)], [], 200);
    dispatchTouch(viewport, 'touchend', [], [touch(viewport, 54, 0, 80)], 201);
    fixture.detectChanges();
    expect(fixture.componentInstance.root().open()).toBe(false);

    viewport = await openDrawer();
    dispatchPointer(viewport, 'pointerdown', { buttons: 1, pointerId: 56, time: 200, y: 0 });
    dispatchTouch(viewport, 'touchstart', [touch(viewport, 57, 0, 0)], [], 201);
    dispatchPointer(viewport, 'pointermove', { buttons: 1, pointerId: 56, time: 300, y: 70 });
    dispatchPointer(viewport, 'pointerup', { buttons: 0, pointerId: 56, time: 301, y: 70 });
    fixture.detectChanges();
    expect(fixture.componentInstance.root().open()).toBe(false);
  });

  it('ignores NotFoundError from pointer capture and surfaces other errors', async () => {
    await openDrawer();
    const directive = fixture.componentInstance.viewport() as unknown as {
      capturePointer(pointerId: number): void;
    };
    const viewport = query('[data-test-viewport]');
    viewport.setPointerCapture = vi.fn(() => {
      throw new DOMException('gone', 'NotFoundError');
    });
    expect(() => directive.capturePointer(1)).not.toThrow();
    viewport.setPointerCapture = vi.fn(() => {
      throw new Error('capture failed');
    });
    expect(() => directive.capturePointer(1)).toThrow('capture failed');
  });

  it('does not install swipe behavior while disabled', async () => {
    fixture.componentInstance.enabled.set(false);
    const viewport = await openDrawer();
    swipe(viewport, { x: 0, y: 0 }, { x: 0, y: 90 }, 60, 'mouse');
    fixture.detectChanges();
    expect(fixture.componentInstance.root().open()).toBe(true);
    expect(viewport.hasAttribute('data-swiping')).toBe(false);
  });

  it('commits a buttons-zero move once and ignores the trailing pointerup', async () => {
    const viewport = await openDrawer();
    dispatchPointer(viewport, 'pointerdown', { buttons: 1, pointerId: 61, time: 0, y: 0 });
    dispatchPointer(viewport, 'pointermove', { buttons: 0, pointerId: 61, time: 100, y: 70 });
    dispatchPointer(viewport, 'pointerup', { buttons: 0, pointerId: 61, time: 101, y: 70 });
    fixture.detectChanges();
    expect(fixture.componentInstance.root().open()).toBe(false);
  });

  it('cleans context interruption and unmount during an active swipe', async () => {
    const viewport = await openDrawer();
    const popup = query('[data-test-popup]');
    dispatchPointer(viewport, 'pointerdown', { buttons: 1, pointerId: 62, time: 0, y: 0 });
    dispatchPointer(viewport, 'pointermove', { buttons: 1, pointerId: 62, time: 100, y: 20 });
    viewport.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
    expect(viewport.hasAttribute('data-swiping')).toBe(false);

    dispatchPointer(viewport, 'pointerdown', { buttons: 1, pointerId: 63, time: 200, y: 0 });
    dispatchPointer(viewport, 'pointermove', { buttons: 1, pointerId: 63, time: 300, y: 20 });
    fixture.componentInstance.root().unmount();
    fixture.detectChanges();
    expect(fixture.componentInstance.root().open()).toBe(false);
    expect(fixture.componentInstance.root().mounted()).toBe(false);
    expect(popup.style.transition).toBe('opacity 2s');
    expect(popup.style.getPropertyValue('--ngp-drawer-swipe-movement-y')).toBe('0px');
  });

  async function openDrawer(): Promise<HTMLElement> {
    fixture.componentInstance.root().show();
    fixture.detectChanges();
    await vi.waitFor(() => expect(document.querySelector('[data-test-viewport]')).not.toBeNull());
    const viewport = query('[data-test-viewport]');
    const popup = query('[data-test-popup]');
    vi.spyOn(viewport, 'getBoundingClientRect').mockReturnValue(rect(200, 200));
    vi.spyOn(popup, 'getBoundingClientRect').mockReturnValue(rect(200, 200));
    return viewport;
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
  dispatchPointer(target, 'pointerdown', {
    ...start,
    buttons: 1,
    pointerId,
    pointerType,
    time: pointerId * 1000,
  });
  dispatchPointer(target, 'pointermove', {
    ...end,
    buttons: 1,
    pointerId,
    pointerType,
    time: pointerId * 1000 + 100,
  });
  dispatchPointer(target, 'pointerup', {
    ...end,
    buttons: 0,
    pointerId,
    pointerType,
    time: pointerId * 1000 + 101,
  });
}

function touchSwipe(
  target: EventTarget,
  start: { x: number; y: number },
  end: { x: number; y: number },
  identifier: number,
): void {
  dispatchTouch(target, 'touchstart', [touch(target, identifier, start.x, start.y)], [], 0);
  const first = {
    x: start.x + (end.x - start.x) * 0.1,
    y: start.y + (end.y - start.y) * 0.1,
  };
  dispatchTouch(target, 'touchmove', [touch(target, identifier, first.x, first.y)], [], 50);
  dispatchTouch(target, 'touchmove', [touch(target, identifier, end.x, end.y)], [], 100);
  dispatchTouch(target, 'touchend', [], [touch(target, identifier, end.x, end.y)], 101);
}

function dispatchPointer(
  target: EventTarget,
  type: 'pointerdown' | 'pointermove' | 'pointerup' | 'pointercancel',
  options: PointerOptions,
): PointerEvent {
  const event = new PointerEvent(type, {
    bubbles: true,
    button: 0,
    buttons: options.buttons,
    cancelable: true,
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
    changedTouches,
    composed: true,
    targetTouches: touches,
    touches,
  });
  Object.defineProperty(event, 'timeStamp', { configurable: true, value: time });
  const previousHitTarget = touchHitTarget;
  if (type === 'touchstart' && touchHitTarget === undefined) {
    const touchTarget = touches[0]?.target;
    touchHitTarget = touchTarget instanceof Element ? touchTarget : null;
  }
  target.dispatchEvent(event);
  touchHitTarget = previousHitTarget;
  return event;
}

function query(selector: string): HTMLElement {
  return document.querySelector<HTMLElement>(selector)!;
}

function rect(width: number, height: number): DOMRect {
  return {
    bottom: height,
    height,
    left: 0,
    right: width,
    top: 0,
    width,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  };
}

function setDimensions(element: HTMLElement, values: Record<string, number>): void {
  for (const [key, value] of Object.entries(values)) {
    Object.defineProperty(element, key, { configurable: true, value, writable: true });
  }
}

function animationFrame(): Promise<void> {
  return new Promise(resolve => requestAnimationFrame(() => resolve()));
}
