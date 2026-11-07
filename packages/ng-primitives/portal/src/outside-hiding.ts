import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { NgpOverlayRegistry } from './overlay-registry';

/**
 * How a layer hides the content outside it: `aria-hidden` from assistive technology only,
 * `inert` from pointer, focus and assistive technology alike.
 * @internal
 */
export type NgpHidingAttribute = 'aria-hidden' | 'inert';

/**
 * An open dialog or modal overlay, as seen by {@link NgpOutsideHiding}.
 * @internal
 */
export interface NgpHidingLayer {
  /** The elements that stay exposed. */
  getElements(): HTMLElement[];
  /** The attribute set on the content outside the layer. */
  readonly attribute: NgpHidingAttribute;
}

const hiddenValues: Record<NgpHidingAttribute, string> = {
  'aria-hidden': 'true',
  inert: '',
};

/**
 * Hides the content outside the open layers. Dialogs and modal overlays share it so their
 * attributes are set and restored from one record, rather than overwriting each other.
 * @internal
 */
@Injectable({ providedIn: 'root' })
export class NgpOutsideHiding {
  private readonly document = inject(DOCUMENT);
  private readonly registry = inject(NgpOverlayRegistry);

  /** Open layers, bottom first. */
  private readonly layers: NgpHidingLayer[] = [];

  /** The value each attribute had before it was overwritten, per element. */
  private readonly previousValues = new Map<Element, Map<NgpHidingAttribute, string | null>>();

  /**
   * Add the layer on top if it is new, then recompute every layer.
   *
   * Recomputes from scratch every time: layers can render into different containers, so a
   * container hidden for one layer may be the very container the next one opens into.
   */
  update(layer: NgpHidingLayer): void {
    if (!this.layers.includes(layer)) {
      this.layers.push(layer);
    }
    this.refresh();
  }

  /** Remove the layer and restore what it hid. */
  remove(layer: NgpHidingLayer): void {
    const index = this.layers.indexOf(layer);

    if (index > -1) {
      this.layers.splice(index, 1);
      this.refresh();
    }
  }

  private refresh(): void {
    this.restore();

    // A layer hides what is below it, never the layers opened above it.
    this.layers.forEach((layer, index) => {
      const exposedElements = this.layers.slice(index).flatMap(each => each.getElements());
      this.hideOutside(exposedElements, layer.attribute);
    });
  }

  private restore(): void {
    this.previousValues.forEach((attributes, element) => {
      attributes.forEach((previousValue, attribute) => {
        if (previousValue === null) {
          element.removeAttribute(attribute);
        } else {
          element.setAttribute(attribute, previousValue);
        }
      });
    });

    this.previousValues.clear();
  }

  private hideOutside(exposedElements: HTMLElement[], attribute: NgpHidingAttribute): void {
    // Overlays opened from inside the layer (a popover, a select) render outside it but are part
    // of it. Entries are in open order, so a submenu's parent is collected before the submenu.
    for (const entry of this.registry.getEntries()) {
      if (exposedElements.some(element => element.contains(entry.triggerElement))) {
        exposedElements.push(...entry.getElements());
      }
    }

    const body = this.document.body;

    // Collect every element on a path from the body down to an exposed element. Hiding only the
    // body children would hide the layer itself when it renders into a nested container, and the
    // paths must all be known up front - with two portals in different containers, one portal's
    // ancestors are the other's siblings.
    const exposedPaths = new Set<Element>();

    for (const exposedElement of exposedElements) {
      // A portal's root nodes can include comments (an `<ng-container>` root), so anchor the walk
      // on the nearest element.
      let current: Element | null =
        exposedElement instanceof Element ? exposedElement : (exposedElement as Node).parentElement;

      while (current && current !== body) {
        exposedPaths.add(current);
        current = current.parentElement;
      }
    }

    // Hide everything sitting beside those paths.
    for (const element of exposedPaths) {
      const parent = element.parentElement;

      if (!parent) {
        continue;
      }

      for (const sibling of Array.from(parent.children)) {
        if (!exposedPaths.has(sibling)) {
          this.hide(sibling, attribute);
        }
      }
    }
  }

  private hide(element: Element, attribute: NgpHidingAttribute): void {
    if (
      this.previousValues.get(element)?.has(attribute) ||
      element.nodeName === 'SCRIPT' ||
      element.nodeName === 'STYLE' ||
      element.hasAttribute('aria-live')
    ) {
      return;
    }

    let attributes = this.previousValues.get(element);

    if (!attributes) {
      attributes = new Map();
      this.previousValues.set(element, attributes);
    }

    attributes.set(attribute, element.getAttribute(attribute));
    element.setAttribute(attribute, hiddenValues[attribute]);
  }
}
