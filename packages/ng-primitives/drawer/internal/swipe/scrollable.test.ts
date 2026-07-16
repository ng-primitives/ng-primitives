import {
  canConsumeTouchDelta,
  canScrollAxis,
  canTransferTouchToDrawer,
  findConsumingScrollable,
  findRelevantScrollable,
  findTouchScrollContext,
  isAtDismissEdge,
  isTouchDeltaTowardDismissal,
  shouldIgnoreSwipeTarget,
  shouldTransferToDrawer,
} from './scrollable';

function dimensions(element: HTMLElement, values: Partial<Record<string, number>>): void {
  for (const [key, value] of Object.entries(values)) {
    Object.defineProperty(element, key, { configurable: true, value, writable: true });
  }
}

describe('scrollable swipe arbitration', () => {
  it.each([
    ['down', 20, true],
    ['down', -20, false],
    ['up', -20, true],
    ['up', 20, false],
    ['right', 20, true],
    ['right', -20, false],
    ['left', -20, true],
    ['left', 20, false],
  ] as const)('classifies exact touch delta toward %s dismissal', (direction, delta, expected) => {
    expect(isTouchDeltaTowardDismissal(direction, delta)).toBe(expected);
  });

  it.each([
    ['down', 0, true],
    ['down', 1, false],
    ['up', 100, true],
    ['up', 98, false],
    ['right', 0, true],
    ['right', 1, false],
    ['left', 100, true],
    ['left', 98, false],
  ] as const)('detects the %s dismiss edge', (direction, offset, expected) => {
    const element = document.createElement('div');
    dimensions(element, {
      scrollTop: offset,
      scrollLeft: offset,
      clientHeight: 100,
      scrollHeight: 200,
      clientWidth: 100,
      scrollWidth: 200,
    });
    expect(isAtDismissEdge(element, direction)).toBe(expected);
  });

  it.each([
    ['down', 50, 20, true],
    ['down', 0, 20, false],
    ['down', 10, 20, false],
    ['down', 50, -20, true],
    ['down', 100, -20, false],
    ['down', 90, -20, false],
    ['up', 50, -20, true],
    ['up', 100, -20, false],
    ['right', 50, 20, true],
    ['right', 0, 20, false],
    ['left', 50, -20, true],
    ['left', 100, -20, false],
  ] as const)(
    'answers whether a %s scroller at %d can consume touch delta %d',
    (direction, offset, delta, expected) => {
      const element = document.createElement('div');
      dimensions(element, {
        scrollTop: offset,
        scrollLeft: offset,
        clientHeight: 100,
        scrollHeight: 200,
        clientWidth: 100,
        scrollWidth: 200,
      });
      expect(canConsumeTouchDelta(element, direction, delta)).toBe(expected);
    },
  );

  it('rejects zero-size and non-overflowing scroll containers', () => {
    const element = document.createElement('div');
    element.style.overflow = 'auto';
    dimensions(element, {
      clientHeight: 0,
      scrollHeight: 0,
      clientWidth: 100,
      scrollWidth: 100,
    });
    document.body.append(element);
    expect(canScrollAxis(element, 'y')).toBe(false);
    expect(canScrollAxis(element, 'x')).toBe(false);
    element.remove();
  });

  it.each([
    ['down', 0, 20, true],
    ['down', 1, 20, false],
    ['up', 100, -20, true],
    ['up', 98, -20, false],
    ['right', 0, 20, true],
    ['right', 1, 20, false],
    ['left', 100, -20, true],
    ['left', 98, -20, false],
  ] as const)(
    'transfers %s only from its exact dismissal edge',
    (direction, offset, delta, expected) => {
      const element = document.createElement('div');
      dimensions(element, {
        scrollTop: offset,
        scrollLeft: offset,
        clientHeight: 100,
        scrollHeight: 200,
        clientWidth: 100,
        scrollWidth: 200,
      });
      expect(shouldTransferToDrawer(element, direction, delta)).toBe(expected);
    },
  );

  it('finds a relevant ancestor across a shadow root', () => {
    const boundary = document.createElement('div');
    boundary.style.overflowY = 'auto';
    dimensions(boundary, { clientHeight: 100, scrollHeight: 200 });
    const host = document.createElement('div');
    const shadow = host.attachShadow({ mode: 'open' });
    const child = document.createElement('span');
    shadow.append(child);
    boundary.append(host);
    document.body.append(boundary);
    expect(findRelevantScrollable(child, boundary, 'down')).toBe(boundary);
    boundary.remove();
  });

  it('does not treat a cross-axis scroller as relevant', () => {
    const boundary = document.createElement('div');
    const child = document.createElement('div');
    child.style.overflowX = 'auto';
    dimensions(child, { clientWidth: 100, scrollWidth: 200 });
    boundary.append(child);
    document.body.append(boundary);
    expect(findRelevantScrollable(child, boundary, 'down')).toBeNull();
    boundary.remove();
  });

  it('captures the nearest nested Drawer-axis and cross-axis scrollables independently', () => {
    const boundary = document.createElement('div');
    const vertical = document.createElement('div');
    const horizontal = document.createElement('div');
    const child = document.createElement('span');
    vertical.style.overflowY = 'auto';
    horizontal.style.overflowX = 'auto';
    dimensions(vertical, { clientHeight: 100, scrollHeight: 300 });
    dimensions(horizontal, { clientWidth: 100, scrollWidth: 300 });
    horizontal.append(child);
    vertical.append(horizontal);
    boundary.append(vertical);
    document.body.append(boundary);

    expect(findTouchScrollContext(child, boundary, 'down')).toEqual({
      crossAxis: horizontal,
      drawerAxis: vertical,
    });
    boundary.remove();
  });

  it('lets an outer ancestor consume when the nested scroller is at its edge', () => {
    const boundary = document.createElement('div');
    const outer = document.createElement('div');
    const inner = document.createElement('div');
    const child = document.createElement('span');
    outer.style.overflowY = 'auto';
    inner.style.overflowY = 'auto';
    dimensions(outer, { clientHeight: 100, scrollHeight: 300, scrollTop: 40 });
    dimensions(inner, { clientHeight: 100, scrollHeight: 300, scrollTop: 0 });
    inner.append(child);
    outer.append(inner);
    boundary.append(outer);
    document.body.append(boundary);

    expect(findRelevantScrollable(child, boundary, 'down')).toBe(inner);
    expect(findConsumingScrollable(child, boundary, 'down', 20)).toBe(outer);
    expect(canTransferTouchToDrawer(child, boundary, 'down', 20)).toBe(false);
    outer.scrollTop = 0;
    expect(findConsumingScrollable(child, boundary, 'down', 20)).toBeNull();
    expect(canTransferTouchToDrawer(child, boundary, 'down', 20)).toBe(true);
    boundary.remove();
  });

  it('walks through an assigned slot and a ShadowRoot host', () => {
    const boundary = document.createElement('div');
    boundary.style.overflowX = 'auto';
    dimensions(boundary, { clientWidth: 100, scrollWidth: 240 });
    const host = document.createElement('div');
    const shadow = host.attachShadow({ mode: 'open' });
    const slot = document.createElement('slot');
    shadow.append(slot);
    const assigned = document.createElement('span');
    host.append(assigned);
    boundary.append(host);
    document.body.append(boundary);
    expect(assigned.assignedSlot).toBe(slot);
    expect(findRelevantScrollable(assigned, boundary, 'right')).toBe(boundary);
    boundary.remove();
  });

  it('protects explicit markers, ranges, selection, and mouse controls', () => {
    const content = document.createElement('div');
    content.dataset['drawerContent'] = '';
    const button = document.createElement('button');
    content.append(button);
    document.body.append(content);
    expect(shouldIgnoreSwipeTarget(button, 'mouse')).toBe(true);
    expect(shouldIgnoreSwipeTarget(button, 'touch')).toBe(false);
    const range = document.createElement('input');
    range.type = 'range';
    expect(shouldIgnoreSwipeTarget(range, 'touch')).toBe(true);
    const textarea = document.createElement('textarea');
    expect(shouldIgnoreSwipeTarget(textarea, 'touch')).toBe(true);
    const editable = document.createElement('div');
    editable.setAttribute('contenteditable', 'true');
    expect(shouldIgnoreSwipeTarget(editable, 'touch')).toBe(true);
    content.remove();
  });

  it('recognizes ignore and editing ancestors across a shadow boundary', () => {
    const host = document.createElement('div');
    host.dataset['ngpDrawerSwipeIgnore'] = '';
    const shadow = host.attachShadow({ mode: 'open' });
    const child = document.createElement('span');
    shadow.append(child);
    document.body.append(host);
    expect(shouldIgnoreSwipeTarget(child, 'touch')).toBe(true);
    host.remove();
  });
});
