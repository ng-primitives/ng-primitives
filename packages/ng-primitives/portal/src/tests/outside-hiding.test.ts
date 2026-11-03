import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NgpHidingAttribute, NgpHidingLayer, NgpOutsideHiding } from '../outside-hiding';
import { NGP_MODAL_EXEMPT_ATTRIBUTE, NgpOverlayRegistry } from '../overlay-registry';

describe('NgpOutsideHiding', () => {
  let hiding: NgpOutsideHiding;
  let page: HTMLElement;
  let container: HTMLElement;
  let panel: HTMLElement;
  let layers: NgpHidingLayer[];
  let nodes: Node[];

  function layer(
    elements: HTMLElement[],
    attribute: NgpHidingAttribute = 'aria-hidden',
  ): NgpHidingLayer {
    const created = { attribute, getElements: () => elements };
    layers.push(created);
    return created;
  }

  /** Append to the body, removed after the test. */
  function append<T extends Node>(node: T): T {
    document.body.append(node);
    nodes.push(node);
    return node;
  }

  beforeEach(() => {
    hiding = TestBed.inject(NgpOutsideHiding);
    layers = [];
    nodes = [];
    page = append(document.createElement('main'));
    container = append(document.createElement('div'));
    panel = document.createElement('div');
    container.append(panel, document.createElement('aside'));
  });

  afterEach(() => {
    layers.forEach(each => hiding.remove(each));
    nodes.forEach(node => node.parentNode?.removeChild(node));
  });

  it('hides the siblings on the path to the layer, but not its ancestors', () => {
    const dialog = layer([panel]);
    hiding.update(dialog);

    expect(page.getAttribute('aria-hidden')).toBe('true');
    expect(container.querySelector('aside')?.getAttribute('aria-hidden')).toBe('true');
    expect(container.hasAttribute('aria-hidden')).toBe(false);
    expect(panel.hasAttribute('aria-hidden')).toBe(false);

    hiding.remove(dialog);

    expect(page.hasAttribute('aria-hidden')).toBe(false);
  });

  it('restores the values it overwrote', () => {
    page.setAttribute('aria-hidden', 'false');
    const dialog = layer([panel]);

    hiding.update(dialog);
    expect(page.getAttribute('aria-hidden')).toBe('true');

    hiding.remove(dialog);
    expect(page.getAttribute('aria-hidden')).toBe('false');
  });

  it('restores an empty value as empty', () => {
    page.setAttribute('aria-hidden', '');
    const dialog = layer([panel]);

    hiding.update(dialog);
    hiding.remove(dialog);

    expect(page.getAttribute('aria-hidden')).toBe('');
  });

  it('sets inert for an inert layer', () => {
    const popover = layer([panel], 'inert');

    hiding.update(popover);
    expect(page.hasAttribute('inert')).toBe(true);
    expect(page.hasAttribute('aria-hidden')).toBe(false);

    hiding.remove(popover);
    expect(page.hasAttribute('inert')).toBe(false);
  });

  it('leaves live regions, scripts and styles alone', () => {
    const liveRegion = append(document.createElement('div'));
    liveRegion.setAttribute('aria-live', 'polite');
    const script = append(document.createElement('script'));
    const style = append(document.createElement('style'));

    hiding.update(layer([panel]));

    expect(liveRegion.hasAttribute('aria-hidden')).toBe(false);
    expect(script.hasAttribute('aria-hidden')).toBe(false);
    expect(style.hasAttribute('aria-hidden')).toBe(false);
  });

  it('hides the layer below from the layer on top, and restores it when the top one closes', () => {
    const popoverPanel = append(document.createElement('div'));
    const dialog = layer([panel]);
    const popover = layer([popoverPanel], 'inert');

    hiding.update(dialog);
    hiding.update(popover);

    expect(container.hasAttribute('inert')).toBe(true);
    expect(popoverPanel.hasAttribute('aria-hidden')).toBe(false);
    expect(popoverPanel.hasAttribute('inert')).toBe(false);
    expect(page.getAttribute('aria-hidden')).toBe('true');
    expect(page.hasAttribute('inert')).toBe(true);

    hiding.remove(popover);

    expect(container.hasAttribute('inert')).toBe(false);
    expect(page.hasAttribute('inert')).toBe(false);
    expect(page.getAttribute('aria-hidden')).toBe('true');
    expect(popoverPanel.getAttribute('aria-hidden')).toBe('true');
  });

  it('keeps the layer on top as it is when the layer below closes', () => {
    const popoverPanel = append(document.createElement('div'));
    const dialog = layer([panel]);
    const popover = layer([popoverPanel], 'inert');
    hiding.update(dialog);
    hiding.update(popover);

    hiding.remove(dialog);

    expect(page.hasAttribute('aria-hidden')).toBe(false);
    expect(page.hasAttribute('inert')).toBe(true);
    expect(container.hasAttribute('inert')).toBe(true);
    expect(popoverPanel.hasAttribute('inert')).toBe(false);
  });

  it('reads the layer elements again on each update', () => {
    const second = document.createElement('section');
    container.append(second);
    const elements = [panel];
    const dialog = layer(elements);

    hiding.update(dialog);
    expect(second.getAttribute('aria-hidden')).toBe('true');

    elements.push(second);
    hiding.update(dialog);
    expect(second.hasAttribute('aria-hidden')).toBe(false);
  });

  it('keeps an overlay opened from inside the layer exposed', () => {
    const registry = TestBed.inject(NgpOverlayRegistry);
    const trigger = document.createElement('button');
    panel.append(trigger);
    const popoverPanel = append(document.createElement('div'));
    registry.register({
      id: 'popover',
      parentId: null,
      overlay: { hide: vi.fn(), hideImmediate: vi.fn() },
      getElements: () => [popoverPanel],
      triggerElement: trigger,
      dismissPolicy: { outsidePress: true, escapeKey: true },
    });

    try {
      hiding.update(layer([panel]));

      expect(popoverPanel.hasAttribute('aria-hidden')).toBe(false);
      expect(page.getAttribute('aria-hidden')).toBe('true');
    } finally {
      registry.deregister('popover');
    }
  });

  it('anchors a comment root node on its parent element', () => {
    const comment = document.createComment('ng-container');
    panel.append(comment);
    // a portal's root nodes can include comments, though they are typed as elements
    hiding.update(layer([comment as unknown as HTMLElement]));

    expect(panel.hasAttribute('aria-hidden')).toBe(false);
    expect(page.getAttribute('aria-hidden')).toBe('true');
  });

  it('hides nothing for an element outside the document', () => {
    hiding.update(layer([document.createElement('div')]));

    expect(page.hasAttribute('aria-hidden')).toBe(false);
  });

  it('keeps an exempt element exposed, with its ancestors', () => {
    const wrapper = append(document.createElement('div'));
    const region = document.createElement('section');
    region.setAttribute(NGP_MODAL_EXEMPT_ATTRIBUTE, '');
    const beside = document.createElement('p');
    wrapper.append(region, beside);

    hiding.update(layer([panel], 'inert'));

    expect(wrapper.hasAttribute('inert')).toBe(false);
    expect(region.hasAttribute('inert')).toBe(false);
    expect(beside.hasAttribute('inert')).toBe(true);
    expect(page.hasAttribute('inert')).toBe(true);
  });

  describe('a layer that belongs to an overlay', () => {
    let registry: NgpOverlayRegistry;
    let ids: string[];

    function registerOverlay(id: string, element: HTMLElement): void {
      registry.register({
        id,
        parentId: null,
        overlay: { hide: vi.fn(), hideImmediate: vi.fn() },
        getElements: () => [element],
        triggerElement: document.createElement('button'),
        dismissPolicy: { outsidePress: true, escapeKey: true },
      });
      ids.push(id);
    }

    beforeEach(() => {
      registry = TestBed.inject(NgpOverlayRegistry);
      ids = [];
    });

    afterEach(() => ids.forEach(id => registry.deregister(id)));

    it('keeps the overlays registered after it exposed', () => {
      const dialogPanel = append(document.createElement('div'));
      registerOverlay('popover', panel);
      const popoverLayer = { ...layer([panel], 'inert'), entryId: 'popover' };
      hiding.update(popoverLayer);
      // a dialog opened from the popover joins the dialog layer, which may sit below this one
      registerOverlay('dialog', dialogPanel);

      hiding.update(popoverLayer);

      expect(dialogPanel.hasAttribute('inert')).toBe(false);
      expect(page.hasAttribute('inert')).toBe(true);
      hiding.remove(popoverLayer);
    });

    it('hides the overlays registered before it', () => {
      const below = append(document.createElement('div'));
      registerOverlay('below', below);
      registerOverlay('popover', panel);
      const popoverLayer = { ...layer([panel], 'inert'), entryId: 'popover' };

      hiding.update(popoverLayer);

      expect(below.hasAttribute('inert')).toBe(true);
      hiding.remove(popoverLayer);
    });
  });

  it('keeps a leaving element exposed until it is released', () => {
    const leaving = append(document.createElement('div'));
    const source = { getElements: () => [leaving] };
    const popover = layer([panel], 'inert');

    hiding.keepExposed(source);
    hiding.update(popover);

    expect(leaving.hasAttribute('inert')).toBe(false);

    hiding.releaseExposed(source);
    hiding.update(popover);

    expect(leaving.hasAttribute('inert')).toBe(true);
  });

  it('ignores the removal of a layer it does not hold', () => {
    page.setAttribute('aria-hidden', 'true');

    hiding.remove(layer([panel]));

    expect(page.getAttribute('aria-hidden')).toBe('true');
  });
});
