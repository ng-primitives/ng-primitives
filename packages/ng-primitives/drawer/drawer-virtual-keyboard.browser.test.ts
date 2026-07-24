import { Component, signal, viewChildren } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgpDrawer } from './drawer/drawer';
import {
  resolveKeyboardInputTarget,
  resolveKeyboardTouchTarget,
} from './internal/virtual-keyboard/keyboard-target';
import { NgpDrawerPopup } from './popup/drawer-popup';
import { NgpDrawerPortal } from './portal/drawer-portal';
import { NgpDrawerViewport } from './viewport/drawer-viewport';
import { NgpDrawerVirtualKeyboard } from './virtual-keyboard/drawer-virtual-keyboard';

@Component({
  imports: [
    NgpDrawerPopup,
    NgpDrawerPortal,
    NgpDrawer,
    NgpDrawerViewport,
    NgpDrawerVirtualKeyboard,
  ],
  template: `
    <ng-container ngpDrawerVirtualKeyboard>
      <ng-container [modal]="false" ngpDrawer>
        <ng-template ngpDrawerPortal>
          <div
            data-test-keyboard-viewport
            ngpDrawerViewport
            style="--ngp-drawer-keyboard-inset: 7px"
          >
            <section data-test-keyboard-popup ngpDrawerPopup>
              <div
                data-test-keyboard-scroll
                style="
                  height: 300px;
                  overflow-y: auto;
                  overflow-anchor: auto;
                  padding-bottom: 5px;
                  scroll-padding-bottom: 7px;
                "
              >
                <label data-test-label for="keyboard-input">
                  <span data-test-label-span>Label</span>
                </label>
                <input
                  id="keyboard-input"
                  (click)="clicks.update(value => value + 1)"
                  data-test-input
                  style="opacity: 0.8; transform: translateX(1px); transition: opacity 1s"
                />
                <input data-test-email type="email" />
                <input data-test-checkbox type="checkbox" />
                <input data-test-disabled disabled />
                <textarea data-test-textarea></textarea>
                <textarea data-test-disabled-textarea disabled></textarea>
                <div contenteditable="true" data-test-editable>
                  <span data-test-editable-child>Text</span>
                </div>
                <button data-test-button type="button">Button</button>
              </div>

              @if (nested()) {
                <ng-container [modal]="false" ngpDrawer>
                  <ng-template ngpDrawerPortal>
                    <div data-test-child-keyboard-viewport ngpDrawerViewport>
                      <section data-test-child-keyboard-popup ngpDrawerPopup>
                        <input
                          (click)="childClicks.update(value => value + 1)"
                          data-test-child-input
                        />
                      </section>
                    </div>
                  </ng-template>
                </ng-container>
              }
            </section>
          </div>
        </ng-template>
      </ng-container>
    </ng-container>
  `,
})
class KeyboardHost {
  readonly clicks = signal(0);
  readonly childClicks = signal(0);
  readonly nested = signal(false);
  readonly roots = viewChildren(NgpDrawer);
}

describe('Drawer VirtualKeyboard', () => {
  let fixture: ComponentFixture<KeyboardHost>;
  let fixtureDestroyed: boolean;
  let visualViewport: FakeVisualViewport;
  let visualViewportDescriptor: PropertyDescriptor | undefined;
  let innerHeightDescriptor: PropertyDescriptor | undefined;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [KeyboardHost] }).compileComponents();
    visualViewportDescriptor = Object.getOwnPropertyDescriptor(window, 'visualViewport');
    innerHeightDescriptor = Object.getOwnPropertyDescriptor(window, 'innerHeight');
    visualViewport = new FakeVisualViewport();
    setInnerHeight(800);
    setVisualViewport(visualViewport);
    fixture = TestBed.createComponent(KeyboardHost);
    fixtureDestroyed = false;
    fixture.detectChanges();
  });

  afterEach(() => {
    destroyFixture();
    expect(visualViewport.listenerCount()).toBe(0);
    expect(document.querySelectorAll('[data-ngp-drawer-overlay-host]')).toHaveLength(0);
    restoreDescriptor(window, 'visualViewport', visualViewportDescriptor);
    restoreDescriptor(window, 'innerHeight', innerHeightDescriptor);
    vi.restoreAllMocks();
  });

  it('recognizes keyboard targets, labels, textarea, and contenteditable hosts', async () => {
    await openParent();
    const input = getElement<HTMLInputElement>('[data-test-input]');
    const labelSpan = getElement('[data-test-label-span]');
    const textarea = getElement('[data-test-textarea]');
    const editable = getElement('[data-test-editable]');
    const editableChild = getElement('[data-test-editable-child]');

    expect(resolveKeyboardInputTarget(input)).toBe(input);
    expect(resolveKeyboardInputTarget(labelSpan)).toBe(input);
    expect(resolveKeyboardTouchTarget(labelSpan)).toEqual({
      focusTarget: input,
      clickTarget: labelSpan,
    });
    expect(resolveKeyboardInputTarget(textarea)).toBe(textarea);
    expect(resolveKeyboardInputTarget(editableChild)).toBe(editable);
  });

  it('skips disabled and non-keyboard controls', async () => {
    await openParent();
    expect(resolveKeyboardInputTarget(getElement('[data-test-disabled]'))).toBeNull();
    expect(resolveKeyboardInputTarget(getElement('[data-test-disabled-textarea]'))).toBeNull();
    expect(resolveKeyboardInputTarget(getElement('[data-test-checkbox]'))).toBeNull();
    expect(resolveKeyboardInputTarget(getElement('[data-test-button]'))).toBeNull();
    expect(resolveKeyboardInputTarget(getElement('[data-test-email]'))).toBe(
      getElement('[data-test-email]'),
    );
  });

  it('writes keyboard inset on viewport resize and resets it when the keyboard closes', async () => {
    await openParent();
    const viewport = getElement('[data-test-keyboard-viewport]');
    getElement<HTMLInputElement>('[data-test-input]').focus();

    visualViewport.setGeometry({ height: 500, offsetTop: 0, scale: 1 });
    await animationFrame();
    expect(viewport.style.getPropertyValue('--ngp-drawer-keyboard-inset')).toBe('300px');

    visualViewport.setGeometry({ height: 760, offsetTop: 0, scale: 1 });
    await animationFrame();
    expect(viewport.style.getPropertyValue('--ngp-drawer-keyboard-inset')).toBe('0px');
  });

  it('focuses synchronously on touch and recreates exactly one controlled click', async () => {
    await openParent();
    const input = getElement<HTMLInputElement>('[data-test-input]');
    vi.spyOn(document, 'elementFromPoint').mockReturnValue(input);
    const originalFocus = input.focus.bind(input);
    let dispatching = false;
    const focus = vi.spyOn(input, 'focus').mockImplementation(options => {
      expect(dispatching).toBe(true);
      originalFocus(options);
    });

    dispatchTouch(input, 'touchstart', 10, 20);
    dispatching = true;
    const allowed = dispatchTouch(input, 'touchend', 10, 20);
    dispatching = false;
    fixture.detectChanges();

    expect(allowed).toBe(false);
    expect(focus).toHaveBeenCalledOnce();
    expect(document.activeElement).toBe(input);
    expect(fixture.componentInstance.clicks()).toBe(1);
    expect(input.style.opacity).toBe('0.8');
    expect(input.style.transform).toBe('translateX(1px)');
    expect(input.style.transition).toBe('opacity 1s');
  });

  it('does not recreate a click after a drag, pinch, or non-keyboard tap', async () => {
    await openParent();
    const input = getElement<HTMLInputElement>('[data-test-input]');
    const button = getElement<HTMLButtonElement>('[data-test-button]');
    const pointTarget = vi.spyOn(document, 'elementFromPoint').mockReturnValue(input);
    const buttonClick = vi.fn();
    button.addEventListener('click', buttonClick);

    dispatchTouch(input, 'touchstart', 10, 20);
    dispatchTouch(input, 'touchmove', 10, 40);
    expect(dispatchTouch(input, 'touchend', 10, 40)).toBe(true);

    dispatchTouch(input, 'touchstart', 10, 20, 2);
    expect(dispatchTouch(input, 'touchend', 10, 20, 2)).toBe(true);

    pointTarget.mockReturnValue(button);
    dispatchTouch(button, 'touchstart', 10, 20);
    expect(dispatchTouch(button, 'touchend', 10, 20)).toBe(true);
    fixture.detectChanges();

    expect(fixture.componentInstance.clicks()).toBe(0);
    expect(buttonClick).not.toHaveBeenCalled();
  });

  it('adds alignment slack and restores all scroll styles on close', async () => {
    await openParent();
    const input = getElement<HTMLInputElement>('[data-test-input]');
    const scroller = getElement('[data-test-keyboard-scroll]');
    setDimensions(scroller, { clientHeight: 300, scrollHeight: 1000, scrollTop: 25 });
    vi.spyOn(scroller, 'getBoundingClientRect').mockReturnValue(rect(0, 800));
    vi.spyOn(input, 'getBoundingClientRect').mockReturnValue(rect(700, 760));
    const scrollTo = vi.spyOn(scroller, 'scrollTo').mockImplementation(() => undefined);

    visualViewport.setGeometry({ height: 500, offsetTop: 0, scale: 1 });
    input.focus();
    await animationFrame();

    expect(scroller.style.overflowAnchor).toBe('none');
    expect(scroller.style.paddingBottom).toBe('353px');
    expect(scroller.style.scrollPaddingBottom).toBe('23px');
    expect(scrollTo).toHaveBeenCalledOnce();

    fixture.componentInstance.roots()[0].hide();
    fixture.detectChanges();
    expect(scroller.style.overflowAnchor).toBe('auto');
    expect(scroller.style.paddingBottom).toBe('5px');
    expect(scroller.style.scrollPaddingBottom).toBe('7px');
    expect(visualViewport.listenerCount()).toBe(0);
  });

  it('suspends inset, focus recreation, and alignment while pinch-zoomed', async () => {
    await openParent();
    const input = getElement<HTMLInputElement>('[data-test-input]');
    vi.spyOn(document, 'elementFromPoint').mockReturnValue(input);

    visualViewport.setGeometry({ height: 400, offsetTop: 0, scale: 2 });
    input.focus();
    await animationFrame();
    expect(
      getElement('[data-test-keyboard-viewport]').style.getPropertyValue(
        '--ngp-drawer-keyboard-inset',
      ),
    ).toBe('0px');

    input.blur();
    dispatchTouch(input, 'touchstart', 10, 20);
    expect(dispatchTouch(input, 'touchend', 10, 20)).toBe(true);
    fixture.detectChanges();
    expect(fixture.componentInstance.clicks()).toBe(0);
  });

  it('gives touch-focus and inset ownership to the frontmost nested drawer', async () => {
    fixture.componentInstance.nested.set(true);
    fixture.detectChanges();
    await openParent();
    await openChild();

    const parentViewport = getElement('[data-test-keyboard-viewport]');
    const childViewport = getElement('[data-test-child-keyboard-viewport]');
    const parentInput = getElement<HTMLInputElement>('[data-test-input]');
    const childInput = getElement<HTMLInputElement>('[data-test-child-input]');
    const pointTarget = vi.spyOn(document, 'elementFromPoint');

    pointTarget.mockReturnValue(parentInput);
    dispatchTouch(parentInput, 'touchstart', 10, 20);
    dispatchTouch(parentInput, 'touchend', 10, 20);
    pointTarget.mockReturnValue(childInput);
    dispatchTouch(childInput, 'touchstart', 10, 20);
    dispatchTouch(childInput, 'touchend', 10, 20);
    fixture.detectChanges();

    expect(fixture.componentInstance.clicks()).toBe(0);
    expect(fixture.componentInstance.childClicks()).toBe(1);
    expect(document.activeElement).toBe(childInput);

    visualViewport.setGeometry({ height: 500, offsetTop: 0, scale: 1 });
    await animationFrame();
    expect(parentViewport.style.getPropertyValue('--ngp-drawer-keyboard-inset')).toBe('0px');
    expect(childViewport.style.getPropertyValue('--ngp-drawer-keyboard-inset')).toBe('300px');
  });

  it('is safe without VisualViewport', async () => {
    destroyFixture();
    setVisualViewport(undefined);
    fixture = TestBed.createComponent(KeyboardHost);
    fixtureDestroyed = false;
    fixture.detectChanges();
    await openParent();
    const input = getElement<HTMLInputElement>('[data-test-input]');

    input.focus();
    await animationFrame();
    expect(
      getElement('[data-test-keyboard-viewport]').style.getPropertyValue(
        '--ngp-drawer-keyboard-inset',
      ),
    ).toBe('0px');
  });

  it('cleans touch state, listeners, rAF, variables, and styles on close and destroy', async () => {
    await openParent();
    const host = fixture.componentInstance;
    const input = getElement<HTMLInputElement>('[data-test-input]');
    const viewport = getElement('[data-test-keyboard-viewport]');
    const scroller = getElement('[data-test-keyboard-scroll]');
    setDimensions(scroller, { clientHeight: 300, scrollHeight: 1000, scrollTop: 25 });
    vi.spyOn(scroller, 'getBoundingClientRect').mockReturnValue(rect(0, 800));
    vi.spyOn(input, 'getBoundingClientRect').mockReturnValue(rect(700, 760));
    vi.spyOn(scroller, 'scrollTo').mockImplementation(() => undefined);
    vi.spyOn(document, 'elementFromPoint').mockReturnValue(input);

    visualViewport.setGeometry({ height: 500, offsetTop: 0, scale: 1 });
    input.focus();
    await animationFrame();
    expect(scroller.style.overflowAnchor).toBe('none');

    dispatchTouch(input, 'touchstart', 10, 20);
    visualViewport.setGeometry({ height: 480, offsetTop: 0, scale: 1 });
    destroyFixture();
    await animationFrame();

    expect(viewport.style.getPropertyValue('--ngp-drawer-keyboard-inset')).toBe('7px');
    expect(scroller.style.overflowAnchor).toBe('auto');
    expect(scroller.style.paddingBottom).toBe('5px');
    expect(scroller.style.scrollPaddingBottom).toBe('7px');
    expect(input.style.opacity).toBe('0.8');
    expect(input.style.transform).toBe('translateX(1px)');
    expect(input.style.transition).toBe('opacity 1s');
    expect(visualViewport.listenerCount()).toBe(0);
    expect(host.clicks()).toBe(0);
  });

  async function openParent(): Promise<void> {
    fixture.componentInstance.roots()[0].show();
    fixture.detectChanges();
    await vi.waitFor(() =>
      expect(document.querySelector('[data-test-keyboard-viewport]')).not.toBeNull(),
    );
    const popup = getElement('[data-test-keyboard-popup]');
    await vi.waitFor(() => expect(document.activeElement).toBe(popup));
  }

  async function openChild(): Promise<void> {
    await vi.waitFor(() => expect(fixture.componentInstance.roots().length).toBe(2));
    fixture.componentInstance.roots()[1].show();
    fixture.detectChanges();
    await vi.waitFor(() =>
      expect(document.querySelector('[data-test-child-keyboard-popup]')).not.toBeNull(),
    );
    const popup = getElement('[data-test-child-keyboard-popup]');
    await vi.waitFor(() => expect(document.activeElement).toBe(popup));
  }

  function destroyFixture(): void {
    if (!fixtureDestroyed) {
      fixture.destroy();
      fixtureDestroyed = true;
    }
  }

  function setVisualViewport(value: VisualViewport | undefined): void {
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value,
      writable: true,
    });
  }

  function setInnerHeight(value: number): void {
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value,
      writable: true,
    });
  }
});

class FakeVisualViewport extends EventTarget {
  height = 800;
  offsetTop = 0;
  scale = 1;
  private readonly listeners = new Map<string, Set<EventListenerOrEventListenerObject>>();

  override addEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject | null,
    options?: AddEventListenerOptions | boolean,
  ): void {
    super.addEventListener(type, callback, options);
    if (callback) {
      const listeners = this.listeners.get(type) ?? new Set();
      listeners.add(callback);
      this.listeners.set(type, listeners);
    }
  }

  override removeEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject | null,
    options?: EventListenerOptions | boolean,
  ): void {
    super.removeEventListener(type, callback, options);
    if (callback) {
      this.listeners.get(type)?.delete(callback);
    }
  }

  setGeometry(values: { height: number; offsetTop: number; scale: number }): void {
    Object.assign(this, values);
    this.dispatchEvent(new Event('resize'));
  }

  listenerCount(): number {
    return [...this.listeners.values()].reduce((count, listeners) => count + listeners.size, 0);
  }
}

function dispatchTouch(
  target: EventTarget,
  type: 'touchstart' | 'touchmove' | 'touchend',
  clientX: number,
  clientY: number,
  count = 1,
): boolean {
  const touches = Array.from(
    { length: count },
    (_, index) =>
      new Touch({
        clientX: clientX + index,
        clientY: clientY + index,
        identifier: index,
        target,
      }),
  );
  const event = new TouchEvent(type, {
    bubbles: true,
    cancelable: true,
    changedTouches: type === 'touchend' ? touches : [],
    composed: true,
    targetTouches: type === 'touchend' ? [] : touches,
    touches: type === 'touchend' ? [] : touches,
  });
  return target.dispatchEvent(event);
}

function getElement<T extends HTMLElement = HTMLElement>(selector: string): T {
  return document.querySelector<T>(selector)!;
}

function setDimensions(element: HTMLElement, values: Record<string, number>): void {
  for (const [key, value] of Object.entries(values)) {
    Object.defineProperty(element, key, { configurable: true, value, writable: true });
  }
}

function rect(top: number, bottom: number): DOMRect {
  return {
    bottom,
    height: bottom - top,
    left: 0,
    right: 300,
    top,
    width: 300,
    x: 0,
    y: top,
    toJSON: () => ({}),
  };
}

function animationFrame(): Promise<void> {
  return new Promise(resolve => requestAnimationFrame(() => resolve()));
}

function restoreDescriptor(
  target: Window,
  property: 'visualViewport' | 'innerHeight',
  descriptor: PropertyDescriptor | undefined,
): void {
  if (descriptor) {
    Object.defineProperty(target, property, descriptor);
  } else {
    delete (target as unknown as Record<string, unknown>)[property];
  }
}
