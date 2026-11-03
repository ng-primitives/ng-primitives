import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import {
  NGP_MODAL_EXEMPT_ATTRIBUTE,
  NgpOverlayEntry,
  NgpOverlayRegistry,
} from './overlay-registry';

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
  /**
   * The registry entry of the overlay the layer belongs to. Overlays registered after it, such as
   * a dialog opened from a modal popover, are above it and stay exposed.
   */
  readonly entryId?: string;
}

/**
 * Something whose elements stay exposed while it leaves, see {@link NgpOutsideHiding.keepExposed}.
 * @internal
 */
export interface NgpExposedSource {
  getElements(): HTMLElement[];
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

  /** Sources every layer keeps exposed, see `keepExposed()`. */
  private readonly exposedSources = new Set<NgpExposedSource>();

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

  /**
   * Keep the source's elements exposed by every layer, from the next recompute until
   * `releaseExposed()`. A dialog closing above a modal overlay has left the registry, but runs its
   * exit animation while it still holds focus.
   */
  keepExposed(source: NgpExposedSource): void {
    this.exposedSources.add(source);
  }

  /** Stop keeping the source exposed, from the next recompute. */
  releaseExposed(source: NgpExposedSource): void {
    this.exposedSources.delete(source);
  }

  /**
   * Recompute the open layers, for an overlay that opened or closed while they are open: one
   * opened from inside a layer into another container must not stay hidden.
   */
  refresh(): void {
    if (this.layers.length === 0 && this.previousValues.size === 0) {
      return;
    }

    this.restore();

    // A layer hides what is below it, never the layers opened above it.
    this.layers.forEach((layer, index) => {
      const exposedElements = [
        ...this.layers.slice(index).flatMap(each => each.getElements()),
        ...this.getEntriesAbove(layer).flatMap(entry => entry.getElements()),
        ...Array.from(this.exposedSources).flatMap(source => source.getElements()),
      ];
      this.hideOutside(exposedElements, layer.attribute);
    });
  }

  /** The overlays registered after the layer's own entry. */
  private getEntriesAbove(layer: NgpHidingLayer): readonly NgpOverlayEntry[] {
    const entries = this.registry.getEntries();
    const index = layer.entryId ? entries.findIndex(entry => entry.id === layer.entryId) : -1;
    return index === -1 ? [] : entries.slice(index + 1);
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

    const addPath = (exposedElement: Node) => {
      // A portal's root nodes can include comments (an `<ng-container>` root), so anchor the walk
      // on the nearest element.
      let current: Element | null =
        exposedElement instanceof Element ? exposedElement : exposedElement.parentElement;

      while (current && current !== body) {
        exposedPaths.add(current);
        current = current.parentElement;
      }
    };

    exposedElements.filter(element => element.isConnected).forEach(addPath);

    // Nothing of the layer is in the document, so there is nothing to hide it from.
    if (exposedPaths.size === 0) {
      return;
    }

    // `inert` applies to the whole subtree, so an exempt element nested in hidden content would
    // be hidden with it: keep its ancestors exposed too.
    this.document.querySelectorAll(`[${NGP_MODAL_EXEMPT_ATTRIBUTE}]`).forEach(addPath);

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
