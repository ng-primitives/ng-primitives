// Adapted from Base UI DrawerVirtualKeyboardProvider (MIT), pinned at c33f4210.
import { DrawerState } from '../drawer-state';
import {
  containsComposed,
  findKeyboardScrollTarget,
  isInteractiveNonKeyboardTarget,
  resolveKeyboardInputTarget,
  resolveKeyboardTouchTarget,
} from './keyboard-target';
import { getDrawerKeyboardInset, getDrawerKeyboardViewport } from './visual-viewport';

const INPUT_TAP_MOVE_THRESHOLD = 10;
const KEYBOARD_SCROLL_SLACK = 48;
const KEYBOARD_VISIBILITY_MARGIN = 16;

interface TouchStart {
  readonly x: number;
  readonly y: number;
  readonly target: EventTarget | null;
}

interface ScrollAdjustment {
  readonly element: HTMLElement;
  readonly overflowAnchor: string;
  readonly paddingBottom: string;
  readonly scrollPaddingBottom: string;
  readonly computedPaddingBottom: number;
  readonly computedScrollPaddingBottom: number;
}

export class DrawerKeyboardController {
  private focusedTarget: HTMLElement | null = null;
  private touchStart: TouchStart | null = null;
  private touchMoved = false;
  private frame = 0;
  private adjustment: ScrollAdjustment | null = null;
  private destroyed = false;
  private listenersAttached = false;
  private readonly capture = true;
  private readonly touchOptions: AddEventListenerOptions = { capture: true, passive: false };
  private readonly window: Window | null;
  private readonly visualViewport: VisualViewport | null;
  private readonly initialKeyboardInset: string;

  private readonly onFocusIn = (event: FocusEvent): void => this.handleFocusIn(event);
  private readonly onFocusOut = (event: FocusEvent): void => this.handleFocusOut(event);
  private readonly onTouchStart = (event: TouchEvent): void => this.handleTouchStart(event);
  private readonly onTouchMove = (event: TouchEvent): void => this.handleTouchMove(event);
  private readonly onTouchEnd = (event: TouchEvent): void => this.handleTouchEnd(event);
  private readonly onTouchCancel = (): void => this.resetTouch();
  private readonly onViewportChange = (): void => this.handleViewportChange();

  constructor(
    private readonly state: DrawerState,
    private readonly viewport: HTMLElement,
    private readonly document: Document,
    private readonly isOwner: () => boolean,
  ) {
    this.window = document.defaultView;
    this.visualViewport = this.window?.visualViewport ?? null;
    this.initialKeyboardInset = viewport.style.getPropertyValue('--ngp-drawer-keyboard-inset');
  }

  sync(): void {
    if (!this.isActive()) {
      this.deactivate();
      return;
    }

    this.addListeners();
    if (this.captureFocusedTarget(this.document.activeElement)) {
      this.scheduleAlignment();
    }
  }

  destroy(): void {
    if (this.destroyed) {
      return;
    }
    this.destroyed = true;
    this.removeListeners();
    this.clear();
    this.restoreProperty(this.viewport, '--ngp-drawer-keyboard-inset', this.initialKeyboardInset);
  }

  private isActive(): boolean {
    return !this.destroyed && this.state.open() && this.state.mounted() && this.isOwner();
  }

  private addListeners(): void {
    if (this.listenersAttached) {
      return;
    }
    this.listenersAttached = true;
    this.document.addEventListener('focusin', this.onFocusIn, this.capture);
    this.document.addEventListener('focusout', this.onFocusOut, this.capture);
    this.document.addEventListener('touchstart', this.onTouchStart, this.touchOptions);
    this.document.addEventListener('touchmove', this.onTouchMove, this.touchOptions);
    this.document.addEventListener('touchend', this.onTouchEnd, this.touchOptions);
    this.document.addEventListener('touchcancel', this.onTouchCancel, this.touchOptions);
    this.visualViewport?.addEventListener('resize', this.onViewportChange);
    this.visualViewport?.addEventListener('scroll', this.onViewportChange);
  }

  private removeListeners(): void {
    if (!this.listenersAttached) {
      return;
    }
    this.listenersAttached = false;
    this.document.removeEventListener('focusin', this.onFocusIn, this.capture);
    this.document.removeEventListener('focusout', this.onFocusOut, this.capture);
    this.document.removeEventListener('touchstart', this.onTouchStart, this.touchOptions);
    this.document.removeEventListener('touchmove', this.onTouchMove, this.touchOptions);
    this.document.removeEventListener('touchend', this.onTouchEnd, this.touchOptions);
    this.document.removeEventListener('touchcancel', this.onTouchCancel, this.touchOptions);
    this.visualViewport?.removeEventListener('resize', this.onViewportChange);
    this.visualViewport?.removeEventListener('scroll', this.onViewportChange);
  }

  private deactivate(): void {
    this.removeListeners();
    this.clear();
  }

  private handleFocusIn(event: FocusEvent): void {
    if (!this.isActive()) {
      return;
    }
    if (this.captureFocusedTarget(event.composedPath()[0] ?? event.target)) {
      this.scheduleAlignment();
    }
  }

  private handleFocusOut(event: FocusEvent): void {
    if (!this.isActive()) {
      this.clear();
      return;
    }
    if (this.captureFocusedTarget(event.relatedTarget)) {
      this.scheduleAlignment();
    } else {
      this.clear();
    }
  }

  private captureFocusedTarget(target: EventTarget | null): boolean {
    const resolved = resolveKeyboardInputTarget(target);
    if (!resolved || !containsComposed(this.viewport, resolved)) {
      return false;
    }
    this.focusedTarget = resolved;
    return true;
  }

  private handleViewportChange(): void {
    if (this.focusedTarget || this.captureFocusedTarget(this.document.activeElement)) {
      this.scheduleAlignment();
    }
  }

  private handleTouchStart(event: TouchEvent): void {
    const target = event.composedPath()[0] ?? event.target;
    if (
      !this.isActive() ||
      event.touches.length !== 1 ||
      !(target instanceof HTMLElement) ||
      !containsComposed(this.viewport, target)
    ) {
      this.resetTouch();
      return;
    }

    const touch = event.touches[0];
    this.touchStart = { x: touch.clientX, y: touch.clientY, target };
    this.touchMoved = false;
  }

  private handleTouchMove(event: TouchEvent): void {
    const start = this.touchStart;
    if (!start || event.touches.length !== 1) {
      this.touchMoved = true;
      return;
    }

    const touch = event.touches[0];
    if (
      Math.abs(touch.clientX - start.x) > INPUT_TAP_MOVE_THRESHOLD ||
      Math.abs(touch.clientY - start.y) > INPUT_TAP_MOVE_THRESHOLD
    ) {
      this.touchMoved = true;
    }
  }

  private handleTouchEnd(event: TouchEvent): void {
    const start = this.touchStart;
    const touch = event.changedTouches[0] ?? event.touches[0];
    if (!this.isActive() || !start || this.touchMoved || !touch) {
      this.resetTouch();
      return;
    }

    const pointTarget = this.document.elementFromPoint(touch.clientX, touch.clientY);
    if (pointTarget && isInteractiveNonKeyboardTarget(pointTarget)) {
      this.resetTouch();
      return;
    }
    const target = resolveKeyboardTouchTarget(pointTarget ?? start.target);
    if (
      !target ||
      !containsComposed(this.viewport, target.focusTarget) ||
      !containsComposed(this.viewport, target.clickTarget)
    ) {
      this.resetTouch();
      return;
    }
    if (this.visualViewport && this.visualViewport.scale !== 1) {
      this.resetTouch();
      return;
    }
    if (
      this.document.activeElement === target.focusTarget &&
      (!this.window || !this.window.visualViewport || getDrawerKeyboardViewport(this.window))
    ) {
      this.resetTouch();
      return;
    }

    event.preventDefault();
    focusWithoutPageScroll(target.focusTarget);
    dispatchReplacementClick(target.clickTarget, touch);
    this.resetTouch();
  }

  private scheduleAlignment(): void {
    if (!this.window || this.frame) {
      return;
    }
    this.frame = this.window.requestAnimationFrame(() => {
      this.frame = 0;
      this.alignFocusedTarget();
    });
  }

  private alignFocusedTarget(): void {
    const target = this.focusedTarget;
    const window = this.window;
    if (!target || !window || !this.isActive() || !containsComposed(this.viewport, target)) {
      this.resetInsetAndAdjustment();
      return;
    }

    const keyboardViewport = getDrawerKeyboardViewport(window);
    if (!keyboardViewport) {
      this.resetInsetAndAdjustment();
      return;
    }

    this.viewport.style.setProperty(
      '--ngp-drawer-keyboard-inset',
      `${Math.ceil(getDrawerKeyboardInset(window, keyboardViewport))}px`,
    );
    const scrollTarget = findKeyboardScrollTarget(target, this.viewport);
    if (!scrollTarget?.isConnected) {
      this.restoreAdjustment();
      return;
    }

    const scrollRect = scrollTarget.getBoundingClientRect();
    const overlap = Math.max(0, scrollRect.bottom - keyboardViewport.bottom);
    this.setScrollSlack(scrollTarget, overlap > 0 ? overlap + KEYBOARD_SCROLL_SLACK : 0);

    const maximum = Math.max(0, scrollTarget.scrollHeight - scrollTarget.clientHeight);
    if (maximum <= 0) {
      return;
    }
    const visibleTop = Math.max(scrollRect.top, keyboardViewport.top) + KEYBOARD_VISIBILITY_MARGIN;
    const visibleBottom =
      Math.min(scrollRect.bottom, keyboardViewport.bottom) - KEYBOARD_VISIBILITY_MARGIN;
    if (visibleBottom <= visibleTop) {
      return;
    }

    const targetRect = target.getBoundingClientRect();
    const next =
      scrollTarget.scrollTop +
      (targetRect.top + targetRect.bottom) / 2 -
      (visibleTop + visibleBottom) / 2;
    const top = Math.max(0, Math.min(maximum, next));
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    scrollTarget.scrollTo({ top, behavior: reducedMotion ? 'auto' : 'smooth' });
  }

  private setScrollSlack(element: HTMLElement, slack: number): void {
    const rounded = Math.max(0, Math.ceil(slack));
    if (rounded === 0) {
      this.restoreAdjustment();
      return;
    }
    if (this.adjustment?.element !== element) {
      this.restoreAdjustment();
    }

    this.adjustment ??= {
      element,
      overflowAnchor: element.style.overflowAnchor,
      paddingBottom: element.style.paddingBottom,
      scrollPaddingBottom: element.style.scrollPaddingBottom,
      computedPaddingBottom:
        Number.parseFloat(this.window?.getComputedStyle(element).paddingBottom ?? '') || 0,
      computedScrollPaddingBottom:
        Number.parseFloat(this.window?.getComputedStyle(element).scrollPaddingBottom ?? '') || 0,
    };
    element.style.overflowAnchor = 'none';
    element.style.paddingBottom = `${this.adjustment.computedPaddingBottom + rounded}px`;
    element.style.scrollPaddingBottom = `${
      this.adjustment.computedScrollPaddingBottom + KEYBOARD_VISIBILITY_MARGIN
    }px`;
  }

  private clear(): void {
    this.focusedTarget = null;
    this.resetTouch();
    this.cancelFrame();
    this.resetInsetAndAdjustment();
  }

  private resetInsetAndAdjustment(): void {
    this.viewport.style.setProperty('--ngp-drawer-keyboard-inset', '0px');
    this.restoreAdjustment();
  }

  private restoreAdjustment(): void {
    const adjustment = this.adjustment;
    if (!adjustment) {
      return;
    }
    adjustment.element.style.overflowAnchor = adjustment.overflowAnchor;
    adjustment.element.style.paddingBottom = adjustment.paddingBottom;
    adjustment.element.style.scrollPaddingBottom = adjustment.scrollPaddingBottom;
    this.adjustment = null;
  }

  private resetTouch(): void {
    this.touchStart = null;
    this.touchMoved = false;
  }

  private cancelFrame(): void {
    if (this.frame && this.window) {
      this.window.cancelAnimationFrame(this.frame);
      this.frame = 0;
    }
  }

  private restoreProperty(element: HTMLElement, name: string, value: string): void {
    if (value) {
      element.style.setProperty(name, value);
    } else {
      element.style.removeProperty(name);
    }
  }
}

function focusWithoutPageScroll(target: HTMLElement): void {
  const wasFocused = target.ownerDocument.activeElement === target;
  const opacity = target.style.opacity;
  const transform = target.style.transform;
  const transition = target.style.transition;
  target.style.transition = 'none';
  target.style.opacity = '0';
  target.style.transform = 'translateY(-2000px)';
  try {
    if (wasFocused) {
      target.blur();
    }
    target.focus({ preventScroll: true });
  } finally {
    target.style.opacity = opacity;
    target.style.transform = transform;
    target.style.transition = transition;
  }
}

function dispatchReplacementClick(
  target: HTMLElement,
  touch: Pick<Touch, 'clientX' | 'clientY'>,
): void {
  const window = target.ownerDocument.defaultView;
  if (!window) {
    return;
  }
  const ClickEvent = window.PointerEvent ?? window.MouseEvent;
  target.dispatchEvent(
    new ClickEvent('click', {
      bubbles: true,
      cancelable: true,
      clientX: touch.clientX,
      clientY: touch.clientY,
      detail: 1,
      view: window,
    }),
  );
}
