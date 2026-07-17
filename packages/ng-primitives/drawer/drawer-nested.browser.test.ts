import { OverlayContainer, OverlayModule } from '@angular/cdk/overlay';
import { Component, signal, viewChildren } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgpDrawerBackdrop } from './backdrop/drawer-backdrop';
import { NgpDrawerClose } from './close/drawer-close';
import { NgpDrawerPopup } from './popup/drawer-popup';
import { NgpDrawerPortal } from './portal/drawer-portal';
import { NgpDrawerProvider } from './provider/drawer-provider';
import { NgpDrawer } from './drawer/drawer';
import { NgpDrawerTrigger } from './trigger/drawer-trigger';
import { NgpDrawerViewport } from './viewport/drawer-viewport';

@Component({
  imports: [
    OverlayModule,
    NgpDrawerBackdrop,
    NgpDrawerClose,
    NgpDrawerPopup,
    NgpDrawerPortal,
    NgpDrawerProvider,
    NgpDrawer,
    NgpDrawerTrigger,
    NgpDrawerViewport,
  ],
  template: `
    <ng-container ngpDrawerProvider>
      <ng-container ngpDrawer>
        <button data-test-parent-trigger ngpDrawerTrigger>Open parent</button>
        <ng-template [keepMounted]="keepParentMounted()" ngpDrawerPortal>
          <div data-test-parent-backdrop ngpDrawerBackdrop></div>
          <div data-test-parent-viewport ngpDrawerViewport>
            <section data-test-parent-popup ngpDrawerPopup style="height: 200px">
              <div data-test-regular-dialog role="dialog"></div>
              <ng-container ngpDrawer>
                <button data-test-child-trigger ngpDrawerTrigger>Open child</button>
                <ng-template ngpDrawerPortal>
                  <div data-test-child-backdrop ngpDrawerBackdrop></div>
                  <div data-test-child-viewport ngpDrawerViewport>
                    <section
                      [class.animated-child-exit]="animateChildExit()"
                      data-test-child-popup
                      ngpDrawerPopup
                      style="height: 300px"
                    >
                      <ng-container ngpDrawer>
                        <button data-test-grandchild-trigger ngpDrawerTrigger>
                          Open grandchild
                        </button>
                        <ng-template ngpDrawerPortal>
                          <div data-test-grandchild-viewport ngpDrawerViewport>
                            <section
                              data-test-grandchild-popup
                              ngpDrawerPopup
                              style="height: 400px"
                            >
                              <button data-test-grandchild-close ngpDrawerClose>
                                Close grandchild
                              </button>
                            </section>
                          </div>
                        </ng-template>
                      </ng-container>
                      <button data-test-child-close ngpDrawerClose>Close child</button>
                    </section>
                  </div>
                </ng-template>
              </ng-container>
            </section>
          </div>
        </ng-template>
      </ng-container>
    </ng-container>
    <button data-test-outside>Outside</button>
  `,
  styles: `
    [data-test-parent-popup] {
      transform: translateY(var(--ngp-drawer-swipe-movement-y))
        scale(calc(1 - (var(--ngp-drawer-nested-drawers) * 0.05)));
    }
    .animated-child-exit {
      opacity: 1;
      transition: opacity 160ms linear;
    }
    .animated-child-exit[data-ending-style] {
      opacity: 0;
    }
  `,
})
class NestedHost {
  readonly keepParentMounted = signal(false);
  readonly animateChildExit = signal(false);
  readonly roots = viewChildren(NgpDrawer);
}

describe('nested Drawer roots', () => {
  let fixture: ComponentFixture<NestedHost>;
  let overlayContainer: OverlayContainer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [NestedHost] }).compileComponents();
    overlayContainer = TestBed.inject(OverlayContainer);
    fixture = TestBed.createComponent(NestedHost);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    overlayContainer.ngOnDestroy();
  });

  it('propagates two and three-level presence, count, and frontmost height', async () => {
    await openThrough(2);
    const parent = getElement('[data-test-parent-popup]');
    const child = getElement('[data-test-child-popup]');
    const childViewport = getElement('[data-test-child-viewport]');
    expect(parent.hasAttribute('data-nested')).toBe(false);
    expect(childViewport.hasAttribute('data-nested')).toBe(true);
    expect(parent.hasAttribute('data-nested-drawer-open')).toBe(true);
    expect(parent.style.getPropertyValue('--ngp-drawer-nested-drawers')).toBe('2');
    expect(parent.style.getPropertyValue('--ngp-drawer-frontmost-height')).toBe('400px');
    expect(child.style.getPropertyValue('--ngp-drawer-nested-drawers')).toBe('1');
    expect(child.style.getPropertyValue('--ngp-drawer-frontmost-height')).toBe('400px');
    expect(document.querySelector('[data-test-regular-dialog]')).not.toBeNull();
  });

  it('keeps composed nested transforms valid before any swipe', async () => {
    await openThrough(1);
    const parent = getElement('[data-test-parent-popup]');

    expect(parent.style.getPropertyValue('--ngp-drawer-swipe-movement-y')).toBe('0px');
    expect(getComputedStyle(parent).transform).toContain('0.95');
  });

  it('gives Viewport gesture ownership to the frontmost open Drawer', async () => {
    fixture.componentInstance.roots()[0].show();
    fixture.detectChanges();
    await vi.waitFor(() => expect(fixture.componentInstance.roots().length).toBeGreaterThan(1));
    const roots = fixture.componentInstance.roots();
    const parentViewport = getElement('[data-test-parent-viewport]');
    const parentPopup = getElement('[data-test-parent-popup]');
    const parentBackdrop = getElement('[data-test-parent-backdrop]');

    dispatchPointer(parentViewport, 'pointerdown', 0, 1, 30, 0);
    dispatchPointer(parentViewport, 'pointermove', 20, 1, 30, 1);
    expect(parentPopup.style.getPropertyValue('--ngp-drawer-swipe-movement-y')).toBe('20px');
    fixture.detectChanges();
    expect(parentPopup.hasAttribute('data-swiping')).toBe(true);
    expect(parentBackdrop.hasAttribute('data-swiping')).toBe(true);

    roots[1].show();
    fixture.detectChanges();
    await vi.waitFor(() =>
      expect(document.querySelector('[data-test-child-popup]')).not.toBeNull(),
    );
    expect(parentPopup.hasAttribute('data-swiping')).toBe(false);
    expect(parentBackdrop.hasAttribute('data-swiping')).toBe(false);
    expect(parentPopup.style.getPropertyValue('--ngp-drawer-swipe-movement-y')).toBe('0px');
    expect(parentPopup.style.getPropertyValue('--ngp-drawer-swipe-progress')).toBe('0');

    dispatchPointer(parentViewport, 'pointerdown', 0, 1, 31, 2);
    dispatchPointer(parentViewport, 'pointermove', 20, 1, 31, 3);
    expect(parentPopup.hasAttribute('data-swiping')).toBe(false);
    expect(parentBackdrop.hasAttribute('data-swiping')).toBe(false);
    expect(parentPopup.style.getPropertyValue('--ngp-drawer-swipe-movement-y')).toBe('0px');

    roots[1].hide();
    fixture.detectChanges();
    expect(parentPopup.hasAttribute('data-nested-drawer-open')).toBe(false);
    dispatchPointer(parentViewport, 'pointerdown', 0, 1, 32, 4);
    fixture.detectChanges();
    expect(parentPopup.hasAttribute('data-swiping')).toBe(true);
    parentViewport.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
    fixture.detectChanges();
    expect(parentPopup.hasAttribute('data-swiping')).toBe(false);
  });

  it('repeats Viewport gesture ownership for a nested grandchild', async () => {
    await openThrough(1);
    await vi.waitFor(() => expect(fixture.componentInstance.roots().length).toBe(3));
    const roots = fixture.componentInstance.roots();
    const childViewport = getElement('[data-test-child-viewport]');
    const childPopup = getElement('[data-test-child-popup]');
    const childBackdrop = getElement('[data-test-child-backdrop]');

    dispatchPointer(childViewport, 'pointerdown', 0, 1, 40, 0);
    fixture.detectChanges();
    expect(childPopup.hasAttribute('data-swiping')).toBe(true);

    roots[2].show();
    fixture.detectChanges();
    await vi.waitFor(() =>
      expect(document.querySelector('[data-test-grandchild-popup]')).not.toBeNull(),
    );
    expect(childPopup.hasAttribute('data-swiping')).toBe(false);
    expect(childBackdrop.hasAttribute('data-swiping')).toBe(false);
    expect(childPopup.style.getPropertyValue('--ngp-drawer-swipe-movement-y')).toBe('0px');

    dispatchPointer(childViewport, 'pointerdown', 0, 1, 41, 1);
    fixture.detectChanges();
    expect(childPopup.hasAttribute('data-swiping')).toBe(false);
    expect(childBackdrop.hasAttribute('data-swiping')).toBe(false);

    roots[2].unmount();
    fixture.detectChanges();
    expect(roots[1].open()).toBe(true);
    expect(roots[2].mounted()).toBe(false);
    dispatchPointer(childViewport, 'pointerdown', 0, 1, 42, 2);
    fixture.detectChanges();
    expect(childPopup.hasAttribute('data-swiping')).toBe(true);
    childViewport.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
    fixture.detectChanges();
    expect(childPopup.hasAttribute('data-swiping')).toBe(false);
  });

  it('clears semantic child state on close while portal presence survives exit', async () => {
    await openThrough(1);
    const parent = getElement('[data-test-parent-popup]');
    const child = getElement('[data-test-child-popup]');
    const childViewport = getElement('[data-test-child-viewport]');
    fixture.componentInstance.roots()[1].hide();
    fixture.detectChanges();
    expect(parent.hasAttribute('data-nested-drawer-open')).toBe(false);
    expect(parent.hasAttribute('data-nested')).toBe(false);
    expect(childViewport.hasAttribute('data-nested')).toBe(true);
    expect(child.isConnected).toBe(true);
    await vi.waitFor(() => expect(child.isConnected).toBe(false));
    expect(childViewport.isConnected).toBe(false);
    expect(parent.style.getPropertyValue('--ngp-drawer-nested-drawers')).toBe('');
  });

  it('shrinks parent geometry in parallel with a nested child exit, keeping a pinned height for the transition', async () => {
    await openThrough(1);
    const parent = getElement('[data-test-parent-popup]');
    const child = getElement('[data-test-child-popup]');
    expect(parent.style.getPropertyValue('--ngp-drawer-height')).toBe('200px');
    expect(parent.style.getPropertyValue('--ngp-drawer-frontmost-height')).toBe('300px');

    fixture.componentInstance.animateChildExit.set(true);
    fixture.detectChanges();
    fixture.componentInstance.roots()[1].hide();
    fixture.detectChanges();

    await vi.waitFor(() => expect(child).toHaveAttribute('data-ending-style'));
    expect(parent).not.toHaveAttribute('data-nested-drawer-open');
    // The pinned --ngp-drawer-height stays a fixed pixel value (never `auto`) for as
    // long as the child's exit keeps it present, so the CSS transition can
    // animate smoothly instead of jumping to/from `auto`.
    expect(parent.style.getPropertyValue('--ngp-drawer-height')).toBe('200px');
    // --ngp-drawer-frontmost-height cascades from `open()` immediately (base UI
    // parity), so the parent starts shrinking back to its own height in
    // parallel with the child's exit transition instead of waiting for it.
    expect(parent.style.getPropertyValue('--ngp-drawer-frontmost-height')).toBe('200px');

    await vi.waitFor(() => expect(child.isConnected).toBe(false));
    await vi.waitFor(() => expect(parent.style.getPropertyValue('--ngp-drawer-height')).toBe(''));
  });

  it('propagates nested swipe hooks and progress without signal-frame rendering', async () => {
    await openThrough(1);
    const parent = getElement('[data-test-parent-popup]');
    const parentBackdrop = getElement('[data-test-parent-backdrop]');
    const childViewport = getElement('[data-test-child-viewport]');
    const childPopup = getElement('[data-test-child-popup]');
    dispatchPointer(childViewport, 'pointerdown', 0, 1, 1, 0);
    dispatchPointer(childViewport, 'pointermove', 60, 1, 1, 200);
    expect(childPopup.style.getPropertyValue('--ngp-drawer-swipe-movement-y')).toBe('60px');
    expect(childPopup.style.transform).toContain('translate3d(0px, 60px, 0px)');
    expect(Number(parent.style.getPropertyValue('--ngp-drawer-swipe-progress'))).toBeCloseTo(0.2);
    fixture.detectChanges();
    expect(parent.hasAttribute('data-nested-drawer-swiping')).toBe(true);
    expect(parentBackdrop.hasAttribute('data-nested-drawer-swiping')).toBe(false);
    expect(getElement('[data-test-child-backdrop]').hasAttribute('data-swiping')).toBe(true);
    expect(childViewport.hasAttribute('data-swiping')).toBe(false);
    dispatchPointer(childViewport, 'pointerup', 60, 0, 1, 201);
    fixture.detectChanges();
    expect(childPopup.style.getPropertyValue('--ngp-drawer-swipe-movement-y')).toBe('60px');
    expect(parent.hasAttribute('data-nested-drawer-swiping')).toBe(false);
    expect(getElement('[data-test-child-backdrop]').hasAttribute('data-swiping')).toBe(false);
    expect(parent.style.getPropertyValue('--ngp-drawer-swipe-progress')).toBe('0');
  });

  it('keeps focus and outside dismissal on the topmost Drawer only', async () => {
    await openThrough(2);
    const grandchild = getElement('[data-test-grandchild-popup]');
    await vi.waitFor(() => expect(document.activeElement).toBe(grandchild));
    const roots = fixture.componentInstance.roots();
    outsidePress(10);
    fixture.detectChanges();
    expect(roots[0].open()).toBe(true);
    expect(roots[1].open()).toBe(true);
    expect(roots[2].open()).toBe(false);
    outsidePress(11);
    fixture.detectChanges();
    expect(roots[0].open()).toBe(true);
    expect(roots[1].open()).toBe(false);
  });

  it('keeps retargeted touch clicks on nested triggers and close buttons', async () => {
    getElement('[data-test-parent-trigger]').click();
    fixture.detectChanges();
    await vi.waitFor(() =>
      expect(document.querySelector('[data-test-child-trigger]')).not.toBeNull(),
    );

    touchClickRetargeted(getElement('[data-test-child-trigger]'), 20);
    fixture.detectChanges();
    await vi.waitFor(() =>
      expect(document.querySelector('[data-test-child-popup]')).not.toBeNull(),
    );
    expect(fixture.componentInstance.roots()[0].open()).toBe(true);
    expect(fixture.componentInstance.roots()[1].open()).toBe(true);

    touchClickRetargeted(getElement('[data-test-grandchild-trigger]'), 21);
    fixture.detectChanges();
    await vi.waitFor(() =>
      expect(document.querySelector('[data-test-grandchild-popup]')).not.toBeNull(),
    );
    expect(fixture.componentInstance.roots()[0].open()).toBe(true);
    expect(fixture.componentInstance.roots()[1].open()).toBe(true);
    expect(fixture.componentInstance.roots()[2].open()).toBe(true);

    touchClickRetargeted(getElement('[data-test-grandchild-close]'), 22);
    fixture.detectChanges();
    expect(fixture.componentInstance.roots()[2].open()).toBe(false);

    touchClickRetargeted(getElement('[data-test-child-close]'), 23);
    fixture.detectChanges();
    expect(fixture.componentInstance.roots()[1].open()).toBe(false);
    expect(fixture.componentInstance.roots()[0].open()).toBe(true);
  });

  it('keeps native touch taps with Pointer jitter through the three-level sequence', async () => {
    getElement('[data-test-parent-trigger]').click();
    fixture.detectChanges();
    await vi.waitFor(() =>
      expect(document.querySelector('[data-test-child-trigger]')).not.toBeNull(),
    );

    touchClickWithJitter(getElement('[data-test-child-trigger]'), 30);
    fixture.detectChanges();
    await vi.waitFor(() =>
      expect(document.querySelector('[data-test-child-popup]')).not.toBeNull(),
    );
    expect(fixture.componentInstance.roots()[1].open()).toBe(true);

    touchClickWithJitter(getElement('[data-test-grandchild-trigger]'), 31);
    fixture.detectChanges();
    await vi.waitFor(() =>
      expect(document.querySelector('[data-test-grandchild-popup]')).not.toBeNull(),
    );
    expect(fixture.componentInstance.roots()[2].open()).toBe(true);

    touchClickWithJitter(getElement('[data-test-grandchild-close]'), 32);
    fixture.detectChanges();
    expect(fixture.componentInstance.roots()[2].open()).toBe(false);

    touchClickWithJitter(getElement('[data-test-child-close]'), 33);
    fixture.detectChanges();
    expect(fixture.componentInstance.roots()[1].open()).toBe(false);
    expect(fixture.componentInstance.roots()[0].open()).toBe(true);
  });

  it('keeps child state independent when a retained parent closes', async () => {
    fixture.componentInstance.keepParentMounted.set(true);
    await openThrough(1);
    const [parent, child] = fixture.componentInstance.roots();
    const childOpenRequest = vi.fn();
    child.beforeOpenChange.subscribe(childOpenRequest);

    parent.hide();
    fixture.detectChanges();

    expect(parent.open()).toBe(false);
    expect(parent.mounted()).toBe(true);
    expect(child.open()).toBe(true);
    expect(child.mounted()).toBe(true);
    expect(childOpenRequest).not.toHaveBeenCalled();
    expect(getElement('[data-test-child-popup]').isConnected).toBe(true);

    outsidePress(12);
    fixture.detectChanges();

    expect(child.open()).toBe(false);
    expect(childOpenRequest).toHaveBeenCalledTimes(1);
    fixture.componentInstance.keepParentMounted.set(false);
    fixture.detectChanges();
    await vi.waitFor(() => expect(document.querySelector('[data-test-parent-popup]')).toBeNull());
  });

  it('cleans parent nesting state when a child root is destroyed', async () => {
    await openThrough(1);
    const parent = getElement('[data-test-parent-popup]');
    fixture.componentInstance.roots()[0].unmount();
    fixture.detectChanges();
    expect(fixture.componentInstance.roots()[0].open()).toBe(false);
    await vi.waitFor(() => expect(parent.isConnected).toBe(false));
    expect(document.querySelector('[data-test-child-popup]')).toBeNull();
  });

  async function openThrough(depth: 1 | 2): Promise<void> {
    fixture.componentInstance.roots()[0].show();
    fixture.detectChanges();
    await vi.waitFor(() => expect(fixture.componentInstance.roots().length).toBeGreaterThan(1));
    fixture.componentInstance.roots()[1].show();
    fixture.detectChanges();
    await vi.waitFor(() =>
      expect(document.querySelector('[data-test-child-popup]')).not.toBeNull(),
    );
    if (depth === 2) {
      await vi.waitFor(() => expect(fixture.componentInstance.roots().length).toBe(3));
      fixture.componentInstance.roots()[2].show();
      fixture.detectChanges();
      await vi.waitFor(() =>
        expect(document.querySelector('[data-test-grandchild-popup]')).not.toBeNull(),
      );
    }
    await vi.waitFor(() => {
      const expected = depth === 2 ? '400px' : '300px';
      expect(
        getElement('[data-test-parent-popup]').style.getPropertyValue(
          '--ngp-drawer-frontmost-height',
        ),
      ).toBe(expected);
    });
  }
});

function getElement(selector: string): HTMLElement {
  return document.querySelector<HTMLElement>(selector)!;
}

function outsidePress(pointerId: number): void {
  const outside = getElement('[data-test-outside]');
  const options = {
    bubbles: true,
    button: 0,
    buttons: 1,
    composed: true,
    isPrimary: true,
    pointerId,
    pointerType: 'mouse',
  };
  outside.dispatchEvent(new PointerEvent('pointerdown', options));
  outside.dispatchEvent(new PointerEvent('pointerup', { ...options, buttons: 0 }));
}

function touchClickWithJitter(target: HTMLElement, pointerId: number): void {
  const touch = new Touch({ clientX: 0, clientY: 0, identifier: pointerId, target });
  target.dispatchEvent(
    new TouchEvent('touchstart', {
      bubbles: true,
      cancelable: true,
      changedTouches: [touch],
      composed: true,
      targetTouches: [touch],
      touches: [touch],
    }),
  );
  const options = {
    bubbles: true,
    button: 0,
    buttons: 1,
    cancelable: true,
    composed: true,
    isPrimary: true,
    pointerId,
    pointerType: 'touch',
  };
  target.dispatchEvent(new PointerEvent('pointerdown', options));
  const move = new PointerEvent('pointermove', { ...options, clientY: 2 });
  target.dispatchEvent(move);
  target.dispatchEvent(new PointerEvent('pointerup', { ...options, buttons: 0, clientY: 2 }));
  target.dispatchEvent(
    new TouchEvent('touchend', {
      bubbles: true,
      cancelable: true,
      changedTouches: [touch],
      composed: true,
      targetTouches: [],
      touches: [],
    }),
  );
  expect(move.defaultPrevented).toBe(false);
  for (const viewport of document.querySelectorAll<HTMLElement>(
    '[data-test-parent-viewport], [data-test-child-viewport], [data-test-grandchild-viewport]',
  )) {
    expect(viewport.hasAttribute('data-swiping')).toBe(false);
  }
  target.click();
}

function touchClickRetargeted(target: HTMLElement, pointerId: number): void {
  const outside = getElement('[data-test-outside]');
  const options = {
    bubbles: true,
    button: 0,
    buttons: 1,
    composed: true,
    isPrimary: true,
    pointerId,
    pointerType: 'touch',
  };
  outside.dispatchEvent(new PointerEvent('pointerdown', options));
  outside.dispatchEvent(new PointerEvent('pointerup', { ...options, buttons: 0 }));
  target.click();
}

function dispatchPointer(
  target: EventTarget,
  type: 'pointerdown' | 'pointermove',
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
