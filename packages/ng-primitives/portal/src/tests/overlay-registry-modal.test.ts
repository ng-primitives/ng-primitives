import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  NGP_MODAL_EXEMPT_ATTRIBUTE,
  NgpOverlayEntry,
  NgpOverlayRegistry,
} from '../overlay-registry';

type TestEntry = NgpOverlayEntry & { overlay: { hide: ReturnType<typeof vi.fn> } };

describe('NgpOverlayRegistry modal overlays', () => {
  let registry: NgpOverlayRegistry;
  let panel: HTMLElement;
  let trigger: HTMLElement;
  let outside: HTMLElement;
  let entries: TestEntry[];
  let nodes: HTMLElement[];

  function append<T extends HTMLElement>(node: T): T {
    document.body.append(node);
    nodes.push(node);
    return node;
  }

  function register(overrides: Partial<NgpOverlayEntry> & { id: string }): TestEntry {
    const entry: TestEntry = {
      parentId: null,
      overlay: { hide: vi.fn(), hideImmediate: vi.fn() },
      getElements: () => [],
      triggerElement: document.createElement('button'),
      dismissPolicy: { outsidePress: true, escapeKey: true },
      ...overrides,
    } as TestEntry;
    registry.register(entry);
    entries.push(entry);
    return entry;
  }

  function pointerDown(target: HTMLElement, init: PointerEventInit = {}): PointerEvent {
    const event = new PointerEvent('pointerdown', {
      bubbles: true,
      cancelable: true,
      composed: true,
      isPrimary: true,
      ...init,
    });
    target.dispatchEvent(event);
    return event;
  }

  /** A pointer click, which has a `detail` of 1 unlike a click from the keyboard. */
  function click(target: HTMLElement, detail = 1): MouseEvent {
    const event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail,
    });
    target.dispatchEvent(event);
    return event;
  }

  function mouseUp(target: HTMLElement): void {
    target.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, composed: true }));
  }

  /** A full press, with the `mouseup` a real browser leaves out after a cancelled `pointerdown`. */
  function press(from: HTMLElement, to: HTMLElement = from): MouseEvent {
    const down = pointerDown(from);
    if (!down.defaultPrevented) {
      mouseUp(to);
    }
    return click(to);
  }

  beforeEach(() => {
    registry = TestBed.inject(NgpOverlayRegistry);
    entries = [];
    nodes = [];
    panel = append(document.createElement('div'));
    trigger = append(document.createElement('button'));
    outside = append(document.createElement('button'));
  });

  afterEach(() => {
    entries.forEach(entry => registry.deregister(entry.id));
    nodes.forEach(node => node.remove());
  });

  it('swallows a press outside and closes the overlay on the click', () => {
    const modal = register({
      id: 'modal',
      modal: true,
      getElements: () => [panel],
      triggerElement: trigger,
    });
    const onClick = vi.fn();
    outside.addEventListener('click', onClick);

    const down = pointerDown(outside);
    expect(down.defaultPrevented).toBe(true);
    expect(modal.overlay.hide).not.toHaveBeenCalled();

    const up = click(outside);

    expect(up.defaultPrevented).toBe(true);
    expect(onClick).not.toHaveBeenCalled();
    expect(modal.overlay.hide).toHaveBeenCalledTimes(1);
    expect(modal.overlay.hide).toHaveBeenCalledWith({ origin: 'mouse', restoreFocus: true });
  });

  it('leaves a click with no press before it alone', () => {
    const modal = register({ id: 'modal', modal: true, getElements: () => [panel] });
    const onClick = vi.fn();
    outside.addEventListener('click', onClick);

    const event = click(outside, 0);

    expect(event.defaultPrevented).toBe(false);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(modal.overlay.hide).not.toHaveBeenCalled();
  });

  it('stays open when code inside it clicks an element outside, like a download link', () => {
    const modal = register({ id: 'modal', modal: true, getElements: () => [panel] });
    const exportButton = document.createElement('button');
    panel.append(exportButton);
    const onDownload = vi.fn();
    outside.addEventListener('click', onDownload);
    exportButton.addEventListener('click', () => outside.click());

    press(exportButton);

    expect(onDownload).toHaveBeenCalledTimes(1);
    expect(modal.overlay.hide).not.toHaveBeenCalled();
  });

  it('leaves a press inside the overlay alone', () => {
    const modal = register({ id: 'modal', modal: true, getElements: () => [panel] });

    expect(pointerDown(panel).defaultPrevented).toBe(false);
    mouseUp(panel);
    expect(click(panel).defaultPrevented).toBe(false);
    expect(modal.overlay.hide).not.toHaveBeenCalled();
  });

  it('stays open when a press starts inside and is released outside', () => {
    const modal = register({ id: 'modal', modal: true, getElements: () => [panel] });

    pointerDown(panel);
    mouseUp(outside);
    // the click lands on the closest common ancestor
    click(document.body);

    expect(modal.overlay.hide).not.toHaveBeenCalled();
  });

  it('leaves a press on the trigger to the trigger', () => {
    const modal = register({
      id: 'modal',
      modal: true,
      getElements: () => [panel],
      triggerElement: trigger,
    });

    expect(pointerDown(trigger).defaultPrevented).toBe(false);
    click(trigger);

    expect(modal.overlay.hide).not.toHaveBeenCalled();
  });

  it('leaves a press inside an exempt element alone', () => {
    const modal = register({ id: 'modal', modal: true, getElements: () => [panel] });
    const region = append(document.createElement('section'));
    region.setAttribute(NGP_MODAL_EXEMPT_ATTRIBUTE, '');
    const action = document.createElement('button');
    region.append(action);
    const onClick = vi.fn();
    action.addEventListener('click', onClick);

    const event = press(action);

    expect(event.defaultPrevented).toBe(false);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(modal.overlay.hide).not.toHaveBeenCalled();
  });

  it('leaves a press with another button than the primary one alone', () => {
    register({ id: 'modal', modal: true, getElements: () => [panel] });

    const event = new PointerEvent('pointerdown', {
      bubbles: true,
      cancelable: true,
      composed: true,
      button: 2,
    });
    outside.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
  });

  it('closes one layer at a time: a non-modal overlay below stays open', () => {
    const parentPanel = append(document.createElement('div'));
    const nestedTrigger = document.createElement('button');
    parentPanel.append(nestedTrigger);
    const parent = register({ id: 'parent', getElements: () => [parentPanel] });
    const modal = register({
      id: 'modal',
      parentId: 'parent',
      modal: true,
      getElements: () => [panel],
      triggerElement: nestedTrigger,
    });

    // a synthetic mouseup still arrives here, unlike in a browser
    pointerDown(outside);
    mouseUp(outside);
    click(outside);

    expect(modal.overlay.hide).toHaveBeenCalledTimes(1);
    expect(parent.overlay.hide).not.toHaveBeenCalled();
  });

  it('swallows a press on an overlay below the modal one, and closes only the modal one', () => {
    const lowerPanel = append(document.createElement('div'));
    const lowerButton = document.createElement('button');
    lowerPanel.append(lowerButton);
    const lower = register({ id: 'lower', getElements: () => [lowerPanel] });
    const modal = register({ id: 'modal', modal: true, getElements: () => [panel] });
    const onClick = vi.fn();
    lowerButton.addEventListener('click', onClick);

    press(lowerButton);

    expect(onClick).not.toHaveBeenCalled();
    expect(modal.overlay.hide).toHaveBeenCalledTimes(1);
    expect(lower.overlay.hide).not.toHaveBeenCalled();
  });

  it('keeps an overlay opened above the modal one closing on a press outside it', () => {
    const childPanel = append(document.createElement('div'));
    const modal = register({ id: 'modal', modal: true, getElements: () => [panel] });
    const child = register({ id: 'child', parentId: 'modal', getElements: () => [childPanel] });

    // inside the modal overlay but outside its child
    press(panel);

    expect(child.overlay.hide).toHaveBeenCalledTimes(1);
    expect(modal.overlay.hide).not.toHaveBeenCalled();
  });

  it('swallows the click but stays open when outside clicks do not close it', () => {
    const modal = register({
      id: 'modal',
      modal: true,
      getElements: () => [panel],
      dismissPolicy: { outsidePress: false, escapeKey: true },
    });
    const onClick = vi.fn();
    outside.addEventListener('click', onClick);

    press(outside);

    expect(onClick).not.toHaveBeenCalled();
    expect(modal.overlay.hide).not.toHaveBeenCalled();
  });

  it('asks the guard with the clicked element', () => {
    const guard = vi.fn(() => true);
    const modal = register({
      id: 'modal',
      modal: true,
      getElements: () => [panel],
      dismissPolicy: { outsidePress: guard, escapeKey: true },
    });

    press(outside);

    expect(guard).toHaveBeenCalledWith(outside);
    expect(modal.overlay.hide).toHaveBeenCalledTimes(1);
  });

  it('does not carry a cancelled press over to the next click', () => {
    register({ id: 'modal', modal: true, getElements: () => [panel] });
    const onClick = vi.fn();
    outside.addEventListener('click', onClick);

    pointerDown(outside);
    outside.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true, composed: true }));
    click(outside);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not carry a press that opened a context menu over to the next click', () => {
    register({ id: 'modal', modal: true, getElements: () => [panel] });
    const action = document.createElement('button');
    panel.append(action);
    const onClick = vi.fn();
    action.addEventListener('click', onClick);

    // a macOS Ctrl+click: a primary press that ends in a context menu, not a click
    pointerDown(outside);
    outside.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, composed: true }));
    const event = click(action);

    expect(event.defaultPrevented).toBe(false);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('never swallows a click from the keyboard', () => {
    register({ id: 'modal', modal: true, getElements: () => [panel] });
    const action = document.createElement('button');
    panel.append(action);
    const onClick = vi.fn();
    action.addEventListener('click', onClick);

    // a press outside whose click never came
    pointerDown(outside);
    click(action, 0);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('closes only the topmost of two modal overlays on an outside press', () => {
    const lowerPanel = append(document.createElement('div'));
    const lower = register({ id: 'lower', modal: true, getElements: () => [lowerPanel] });
    const upper = register({ id: 'upper', modal: true, getElements: () => [panel] });

    press(outside);

    expect(upper.overlay.hide).toHaveBeenCalledTimes(1);
    expect(lower.overlay.hide).not.toHaveBeenCalled();
  });

  it('keeps the press of the first finger when a second one touches down', () => {
    const modal = register({ id: 'modal', modal: true, getElements: () => [panel] });
    const onClick = vi.fn();
    outside.addEventListener('click', onClick);

    pointerDown(outside);
    pointerDown(panel, { isPrimary: false });
    click(outside);

    expect(onClick).not.toHaveBeenCalled();
    expect(modal.overlay.hide).toHaveBeenCalledTimes(1);
  });

  it('swallows the click of a press that started outside, after the modal overlay is gone', () => {
    const otherPanel = append(document.createElement('div'));
    register({ id: 'other', getElements: () => [otherPanel] });
    const modal = register({ id: 'modal', modal: true, getElements: () => [panel] });
    const onClick = vi.fn();
    outside.addEventListener('click', onClick);

    pointerDown(outside);
    registry.deregister(modal.id);
    const event = click(outside);

    expect(event.defaultPrevented).toBe(true);
    expect(onClick).not.toHaveBeenCalled();
    expect(modal.overlay.hide).not.toHaveBeenCalled();
  });

  it('keeps closing every non-modal overlay tree on an outside press', () => {
    const otherPanel = append(document.createElement('div'));
    const first = register({ id: 'first', getElements: () => [panel] });
    const second = register({ id: 'second', getElements: () => [otherPanel] });

    expect(press(outside).defaultPrevented).toBe(false);
    expect(first.overlay.hide).toHaveBeenCalledTimes(1);
    expect(second.overlay.hide).toHaveBeenCalledTimes(1);
  });
});
