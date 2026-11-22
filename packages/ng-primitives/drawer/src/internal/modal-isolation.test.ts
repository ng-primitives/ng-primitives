import { isolateDrawerModal, releaseDrawerIsolation } from './modal-isolation';

describe('isolateDrawerModal', () => {
  const owned: Element[] = [];

  afterEach(() => {
    for (const element of owned) {
      element.remove();
    }
    owned.length = 0;
  });

  function append<T extends Element>(element: T, parent: Element = document.body): T {
    parent.append(element);
    owned.push(element);
    return element;
  }

  function appendPopup(): HTMLElement {
    const host = append(document.createElement('div'));
    return append(document.createElement('section'), host);
  }

  it('isolates the panes already in the CDK overlay container but not the container', () => {
    const container = append(document.createElement('div'));
    container.className = 'cdk-overlay-container';
    const existingPane = append(document.createElement('div'), container);

    const restore = isolateDrawerModal(document, appendPopup(), null);

    expect(existingPane.inert).toBe(true);
    expect(existingPane.getAttribute('aria-hidden')).toBe('true');
    expect(container.inert).toBe(false);
    expect(container.hasAttribute('aria-hidden')).toBe(false);

    const laterPane = append(document.createElement('div'), container);
    expect(laterPane.inert).toBe(false);

    restore();

    expect(existingPane.inert).toBe(false);
    expect(existingPane.hasAttribute('aria-hidden')).toBe(false);
  });

  it('isolates and restores a top-level SVG sibling', () => {
    const svg = append(document.createElementNS('http://www.w3.org/2000/svg', 'svg'));
    svg.style.pointerEvents = 'auto';

    const restore = isolateDrawerModal(document, appendPopup(), null);

    expect(svg.hasAttribute('inert')).toBe(true);
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.style.pointerEvents).toBe('none');

    restore();

    expect(svg.hasAttribute('inert')).toBe(false);
    expect(svg.hasAttribute('aria-hidden')).toBe(false);
    expect(svg.style.pointerEvents).toBe('auto');
  });

  it('does not let a stale disposer lift the isolation a later modal applied', () => {
    const outside = append(document.createElement('div'));
    const restoreFirst = isolateDrawerModal(document, appendPopup(), null);

    releaseDrawerIsolation(outside);
    expect(outside.inert).toBe(false);

    const restoreSecond = isolateDrawerModal(document, appendPopup(), null);
    expect(outside.inert).toBe(true);

    restoreFirst();
    expect(outside.inert).toBe(true);
    expect(outside.getAttribute('aria-hidden')).toBe('true');

    restoreSecond();
    expect(outside.inert).toBe(false);
    expect(outside.hasAttribute('aria-hidden')).toBe(false);
  });
});
