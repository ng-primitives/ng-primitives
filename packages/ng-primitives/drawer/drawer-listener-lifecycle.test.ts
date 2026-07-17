import { Component, input, signal, viewChildren } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NgpDrawerPopup } from './popup/drawer-popup';
import { NgpDrawer } from './drawer/drawer';
import { NgpDrawerSwipeArea } from './swipe-area/drawer-swipe-area';
import { NgpDrawerViewport } from './viewport/drawer-viewport';

const CONTINUATION_EVENT_TYPES = [
  'pointermove',
  'pointerup',
  'pointercancel',
  'contextmenu',
] as const;
const TOUCH_CONTINUATION_EVENT_TYPES = ['touchmove', 'touchend', 'touchcancel'] as const;
const TOUCH_END_EVENT_TYPES = ['touchend', 'touchcancel'] as const;

@Component({
  imports: [NgpDrawerPopup, NgpDrawer, NgpDrawerSwipeArea, NgpDrawerViewport],
  template: `
    @for (_ of instances(); track $index) {
      <ng-container ngpDrawer>
        <div [disabled]="areaDisabled()" data-test-swipe-area ngpDrawerSwipeArea></div>
        <div [swipeEnabled]="viewportEnabled()" data-test-viewport ngpDrawerViewport>
          <section ngpDrawerPopup>
            @if (nested()) {
              <ng-container ngpDrawer>
                <div data-test-child-viewport ngpDrawerViewport>
                  <section ngpDrawerPopup></section>
                </div>
              </ng-container>
            }
          </section>
        </div>
      </ng-container>
    }
  `,
})
class ListenerHost {
  readonly instances = input.required<readonly number[]>();
  readonly roots = viewChildren(NgpDrawer);
  readonly areaDisabled = signal(false);
  readonly viewportEnabled = signal(true);
  readonly nested = signal(false);
}

describe('Drawer listener lifecycle', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ListenerHost] }).compileComponents();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
  });

  it('adds no per-instance document listeners for closed idle Drawers', () => {
    expect(documentRegistrationsFor(1)).toBe(0);
    expect(documentRegistrationsFor(10)).toBe(0);

    const addEventListener = vi.spyOn(document, 'addEventListener');
    const fixture = createHost(10);
    expect(touchContinuationCalls(addEventListener)).toEqual([]);
    fixture.destroy();
  });

  it('owns Viewport continuation listeners only for the active pointer', () => {
    const fixture = createHost(1);
    fixture.componentInstance.roots()[0].show();
    fixture.detectChanges();
    const viewport = query(fixture, '[data-test-viewport]');
    const addEventListener = vi.spyOn(document, 'addEventListener');
    const removeEventListener = vi.spyOn(document, 'removeEventListener');

    viewport.dispatchEvent(pointerEvent('pointerdown', 1, 0, 1));
    const registrations = continuationCalls(addEventListener);
    expect(registrations.map(([type]) => type)).toEqual(CONTINUATION_EVENT_TYPES);

    document.dispatchEvent(pointerEvent('pointercancel', 1, 0, 0));
    expectExactRemovals(registrations, removeEventListener);
    fixture.destroy();
  });

  it('pre-arms one stable Viewport touchmove and owns ending listeners only for the session', () => {
    const fixture = createHost(1);
    const addEventListener = vi.spyOn(document, 'addEventListener');
    const removeEventListener = vi.spyOn(document, 'removeEventListener');
    fixture.componentInstance.roots()[0].show();
    fixture.detectChanges();
    const viewport = query(fixture, '[data-test-viewport]');
    const moveRegistrations = touchMoveCalls(addEventListener);
    expect(moveRegistrations).toHaveLength(1);

    viewport.dispatchEvent(touchEvent(viewport, 'touchstart', 1, false));
    const endRegistrations = touchEndCalls(addEventListener);
    expect(endRegistrations.map(([type]) => type)).toEqual(TOUCH_END_EVENT_TYPES);
    expect(touchMoveCalls(addEventListener)).toEqual(moveRegistrations);

    document.dispatchEvent(touchEvent(viewport, 'touchcancel', 1, true));
    expectExactTouchRemovals(endRegistrations, removeEventListener);
    for (const registration of moveRegistrations) {
      expect(removeEventListener).not.toHaveBeenCalledWith(...registration);
    }

    viewport.dispatchEvent(touchEvent(viewport, 'touchstart', 2, false));
    document.dispatchEvent(touchEvent(viewport, 'touchcancel', 2, true));
    expect(touchMoveCalls(addEventListener)).toEqual(moveRegistrations);

    fixture.destroy();
    expectExactTouchRemovals(moveRegistrations, removeEventListener);
  });

  it('cleans Viewport continuation listeners when closed or disabled', () => {
    const fixture = createHost(1);
    const root = fixture.componentInstance.roots()[0];
    root.show();
    fixture.detectChanges();
    const viewport = query(fixture, '[data-test-viewport]');
    const addEventListener = vi.spyOn(document, 'addEventListener');
    const removeEventListener = vi.spyOn(document, 'removeEventListener');

    viewport.dispatchEvent(pointerEvent('pointerdown', 4, 0, 1));
    const closeRegistrations = continuationCalls(addEventListener);
    root.hide();
    fixture.detectChanges();
    expectExactRemovals(closeRegistrations, removeEventListener);

    addEventListener.mockClear();
    removeEventListener.mockClear();
    root.show();
    fixture.detectChanges();
    viewport.dispatchEvent(pointerEvent('pointerdown', 5, 0, 1));
    const disableRegistrations = continuationCalls(addEventListener);
    fixture.componentInstance.viewportEnabled.set(false);
    fixture.detectChanges();
    expectExactRemovals(disableRegistrations, removeEventListener);
    fixture.destroy();
  });

  it('cleans native touch continuation listeners when closed or disabled', () => {
    const fixture = createHost(1);
    const root = fixture.componentInstance.roots()[0];
    const addEventListener = vi.spyOn(document, 'addEventListener');
    const removeEventListener = vi.spyOn(document, 'removeEventListener');
    root.show();
    fixture.detectChanges();
    const viewport = query(fixture, '[data-test-viewport]');

    viewport.dispatchEvent(touchEvent(viewport, 'touchstart', 10, false));
    const closeRegistrations = touchContinuationCalls(addEventListener);
    root.hide();
    fixture.detectChanges();
    expectExactTouchRemovals(closeRegistrations, removeEventListener);

    addEventListener.mockClear();
    removeEventListener.mockClear();
    root.show();
    fixture.detectChanges();
    viewport.dispatchEvent(touchEvent(viewport, 'touchstart', 11, false));
    const disableRegistrations = touchContinuationCalls(addEventListener);
    fixture.componentInstance.viewportEnabled.set(false);
    fixture.detectChanges();
    expectExactTouchRemovals(disableRegistrations, removeEventListener);
    fixture.destroy();
  });

  it('suspends the parent Viewport listener and active continuation for a nested Drawer', () => {
    const fixture = createHost(1);
    const parent = fixture.componentInstance.roots()[0];
    const viewport = query(fixture, '[data-test-viewport]');
    const addStartListener = vi.spyOn(viewport, 'addEventListener');
    const removeStartListener = vi.spyOn(viewport, 'removeEventListener');

    parent.show();
    fixture.detectChanges();
    const startRegistrations = pointerDownCalls(addStartListener);
    expect(startRegistrations).toHaveLength(1);

    const addDocumentListener = vi.spyOn(document, 'addEventListener');
    const removeDocumentListener = vi.spyOn(document, 'removeEventListener');
    viewport.dispatchEvent(pointerEvent('pointerdown', 6, 0, 1));
    const continuationRegistrations = continuationCalls(addDocumentListener);
    expect(continuationRegistrations).toHaveLength(CONTINUATION_EVENT_TYPES.length);

    fixture.componentInstance.nested.set(true);
    fixture.detectChanges();
    const child = fixture.componentInstance.roots()[1];
    child.show();
    fixture.detectChanges();

    expectExactRemovals(startRegistrations, removeStartListener);
    expectExactRemovals(continuationRegistrations, removeDocumentListener);

    addStartListener.mockClear();
    child.hide();
    fixture.detectChanges();
    expect(pointerDownCalls(addStartListener)).toEqual(startRegistrations);
    fixture.destroy();
  });

  it('cleans an active parent touch continuation when a nested Drawer opens', () => {
    const fixture = createHost(1);
    const parent = fixture.componentInstance.roots()[0];
    const addEventListener = vi.spyOn(document, 'addEventListener');
    const removeEventListener = vi.spyOn(document, 'removeEventListener');
    parent.show();
    fixture.detectChanges();
    const viewport = query(fixture, '[data-test-viewport]');

    viewport.dispatchEvent(touchEvent(viewport, 'touchstart', 12, false));
    const registrations = touchContinuationCalls(addEventListener);
    fixture.componentInstance.nested.set(true);
    fixture.detectChanges();
    fixture.componentInstance.roots()[1].show();
    fixture.detectChanges();

    expectExactTouchRemovals(registrations, removeEventListener);
    fixture.destroy();
  });

  it('retains SwipeArea continuation through provisional open and cleans up on disable', () => {
    const fixture = createHost(1);
    const area = query(fixture, '[data-test-swipe-area]');
    const addEventListener = vi.spyOn(document, 'addEventListener');
    const removeEventListener = vi.spyOn(document, 'removeEventListener');

    area.dispatchEvent(pointerEvent('pointerdown', 2, 100, 1));
    const registrations = continuationCalls(addEventListener);
    expect(registrations.map(([type]) => type)).toEqual(CONTINUATION_EVENT_TYPES);

    document.dispatchEvent(pointerEvent('pointermove', 2, 70, 1));
    fixture.detectChanges();
    expect(fixture.componentInstance.roots()[0].open()).toBe(true);
    expect(continuationCalls(removeEventListener)).toEqual([]);

    fixture.componentInstance.areaDisabled.set(true);
    fixture.detectChanges();
    expect(fixture.componentInstance.roots()[0].open()).toBe(false);
    expectExactRemovals(registrations, removeEventListener);
    fixture.destroy();
  });

  it('owns native SwipeArea continuation only while its touch is active', () => {
    const fixture = createHost(1);
    const area = query(fixture, '[data-test-swipe-area]');
    const addEventListener = vi.spyOn(document, 'addEventListener');
    const removeEventListener = vi.spyOn(document, 'removeEventListener');

    area.dispatchEvent(swipeAreaTouchEvent(area, 'touchstart', 20, 100));
    const registrations = touchContinuationCalls(addEventListener);
    expect(registrations.map(([type]) => type)).toEqual(TOUCH_CONTINUATION_EVENT_TYPES);

    document.dispatchEvent(swipeAreaTouchEvent(area, 'touchmove', 20, 70));
    fixture.detectChanges();
    expect(fixture.componentInstance.roots()[0].open()).toBe(true);
    expect(touchContinuationCalls(removeEventListener)).toEqual([]);

    fixture.componentInstance.areaDisabled.set(true);
    fixture.detectChanges();
    expect(fixture.componentInstance.roots()[0].open()).toBe(false);
    expectExactTouchRemovals(registrations, removeEventListener);
    fixture.destroy();
  });

  it('removes an owned continuation set when its fixture is destroyed', () => {
    const fixture = createHost(1);
    const area = query(fixture, '[data-test-swipe-area]');
    const addEventListener = vi.spyOn(document, 'addEventListener');
    const removeEventListener = vi.spyOn(document, 'removeEventListener');

    area.dispatchEvent(pointerEvent('pointerdown', 3, 100, 1));
    const registrations = continuationCalls(addEventListener);
    fixture.destroy();

    expectExactRemovals(registrations, removeEventListener);
  });

  it('removes an owned native touch continuation set when its fixture is destroyed', () => {
    const fixture = createHost(1);
    const addEventListener = vi.spyOn(document, 'addEventListener');
    const removeEventListener = vi.spyOn(document, 'removeEventListener');
    fixture.componentInstance.roots()[0].show();
    fixture.detectChanges();
    const viewport = query(fixture, '[data-test-viewport]');

    viewport.dispatchEvent(touchEvent(viewport, 'touchstart', 13, false));
    const registrations = touchContinuationCalls(addEventListener);
    fixture.destroy();

    expectExactTouchRemovals(registrations, removeEventListener);
  });
});

function createHost(count: number): ComponentFixture<ListenerHost> {
  const fixture = TestBed.createComponent(ListenerHost);
  fixture.componentRef.setInput(
    'instances',
    Array.from({ length: count }, (_, index) => index),
  );
  fixture.detectChanges();
  return fixture;
}

function documentRegistrationsFor(count: number): number {
  const addEventListener = vi.spyOn(document, 'addEventListener');
  const fixture = createHost(count);
  const registrations = addEventListener.mock.calls.filter(
    ([type, , options]) =>
      [...CONTINUATION_EVENT_TYPES, 'click', 'focusin', 'keydown', 'pointerdown'].includes(type) &&
      options === true,
  ).length;

  fixture.destroy();
  addEventListener.mockRestore();
  return registrations;
}

function continuationCalls(spy: ReturnType<typeof vi.spyOn>): ListenerCall[] {
  return spy.mock.calls.filter(
    ([type, , options]) =>
      CONTINUATION_EVENT_TYPES.includes(type as (typeof CONTINUATION_EVENT_TYPES)[number]) &&
      options === true,
  ) as ListenerCall[];
}

function pointerDownCalls(spy: ReturnType<typeof vi.spyOn>): ListenerCall[] {
  return spy.mock.calls.filter(
    ([type, , options]) => type === 'pointerdown' && options === true,
  ) as ListenerCall[];
}

function touchContinuationCalls(spy: ReturnType<typeof vi.spyOn>): ListenerCall[] {
  return spy.mock.calls.filter(([type, , options]) => {
    if (!TOUCH_CONTINUATION_EVENT_TYPES.includes(type as never) || typeof options !== 'object') {
      return false;
    }
    return options.capture === true && (type !== 'touchmove' || options.passive === false);
  }) as ListenerCall[];
}

function touchMoveCalls(spy: ReturnType<typeof vi.spyOn>): ListenerCall[] {
  return touchContinuationCalls(spy).filter(([type]) => type === 'touchmove');
}

function touchEndCalls(spy: ReturnType<typeof vi.spyOn>): ListenerCall[] {
  return touchContinuationCalls(spy).filter(([type]) =>
    TOUCH_END_EVENT_TYPES.includes(type as (typeof TOUCH_END_EVENT_TYPES)[number]),
  );
}

function expectExactRemovals(
  registrations: ListenerCall[],
  removeEventListener: ReturnType<typeof vi.spyOn>,
): void {
  for (const [type, listener, options] of registrations) {
    expect(options).toBe(true);
    expect(removeEventListener).toHaveBeenCalledWith(type, listener, options);
  }
}

function expectExactTouchRemovals(
  registrations: ListenerCall[],
  removeEventListener: ReturnType<typeof vi.spyOn>,
): void {
  for (const [type, listener, options] of registrations) {
    expect(removeEventListener).toHaveBeenCalledWith(type, listener, options);
  }
}

function pointerEvent(
  type: string,
  pointerId: number,
  clientY: number,
  buttons: number,
): PointerEvent {
  const event = new MouseEvent(type, {
    bubbles: true,
    button: 0,
    buttons,
    cancelable: true,
    clientY,
    composed: true,
  }) as PointerEvent;
  Object.defineProperties(event, {
    isPrimary: { value: true },
    pointerId: { value: pointerId },
    pointerType: { value: 'mouse' },
  });
  return event;
}

function touchEvent(
  target: EventTarget,
  type: 'touchstart' | 'touchcancel',
  identifier: number,
  ending: boolean,
): TouchEvent {
  const touch = { clientX: 0, clientY: 0, identifier, target } as Touch;
  const event = new Event(type, { bubbles: true, cancelable: true }) as TouchEvent;
  Object.defineProperties(event, {
    changedTouches: { value: ending ? [touch] : [] },
    targetTouches: { value: ending ? [] : [touch] },
    touches: { value: ending ? [] : [touch] },
  });
  return event;
}

function swipeAreaTouchEvent(
  target: EventTarget,
  type: 'touchstart' | 'touchmove' | 'touchend' | 'touchcancel',
  identifier: number,
  clientY: number,
): TouchEvent {
  const touch = { clientX: 0, clientY, identifier, target } as Touch;
  const ending = type === 'touchend' || type === 'touchcancel';
  const event = new Event(type, { bubbles: true, cancelable: true }) as TouchEvent;
  Object.defineProperties(event, {
    changedTouches: { value: ending ? [touch] : type === 'touchstart' ? [touch] : [] },
    targetTouches: { value: ending ? [] : [touch] },
    touches: { value: ending ? [] : [touch] },
  });
  return event;
}

function query(fixture: ComponentFixture<ListenerHost>, selector: string): HTMLElement {
  return fixture.nativeElement.querySelector(selector);
}

type ListenerCall = [
  string,
  EventListenerOrEventListenerObject,
  boolean | AddEventListenerOptions | undefined,
];
