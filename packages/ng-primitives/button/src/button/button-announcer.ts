import { DOCUMENT } from '@angular/common';
import { DestroyRef, inject, Injectable, NgZone } from '@angular/core';

/** How long an announcement stays in the live region before it is removed. */
const ANNOUNCEMENT_TIMEOUT = 7000;

/** Gives a screen reader time to register a live region that was just created. */
const NEW_REGION_DELAY = 100;

/**
 * Announces an element's accessible name through an assertive live region.
 *
 * The announcement is a node with `aria-labelledby` pointing at the element, or at what names
 * it when it is named by `aria-labelledby`, so the screen reader computes the name itself
 * instead of reading a string we derive from the DOM.
 * @internal
 */
@Injectable({ providedIn: 'root' })
export class NgpButtonAnnouncer {
  private readonly document = inject(DOCUMENT);
  private readonly ngZone = inject(NgZone);
  private region: HTMLElement | null = null;
  /** Ids announced while a new region is still being registered, in call order. */
  private queue: string[] | null = null;
  private readonly timeouts = new Set<ReturnType<typeof setTimeout>>();

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.timeouts.forEach(clearTimeout);
      this.region?.remove();
      this.region = null;
      this.queue = null;
    });
  }

  /** Announce the accessible name of the element with the given id. */
  announceName(id: string): void {
    if (!this.region) {
      this.createRegion();
    }

    if (this.queue) {
      this.queue.push(id);
    } else {
      this.append(id);
    }
  }

  private append(id: string): void {
    // The element can leave the DOM before the append runs (e.g. a dialog closing as its
    // request ends); a node labelled by a missing id would be read as an unnamed image.
    const element = this.document.getElementById(id);
    if (!this.region || !element) {
      return;
    }

    const node = this.document.createElement('div');
    // `aria-labelledby` is not allowed on a generic element, so give the node a role that takes a name.
    node.setAttribute('role', 'img');
    // Accessible name computation follows one `aria-labelledby` hop, not a second one. Without a
    // label in the page, the element is named by its content instead.
    const labelIds = (element.getAttribute('aria-labelledby') ?? '')
      .split(/\s+/)
      .filter(labelId => this.document.getElementById(labelId));
    node.setAttribute('aria-labelledby', labelIds.join(' ') || id);
    this.region.appendChild(node);
    this.schedule(() => node.remove(), ANNOUNCEMENT_TIMEOUT);
  }

  private createRegion(): void {
    const region = this.document.createElement('div');
    region.setAttribute('aria-live', 'assertive');
    region.setAttribute('data-ngp-button-announcer', '');
    Object.assign(region.style, {
      position: 'fixed',
      width: '1px',
      height: '1px',
      padding: '0',
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      border: '0',
    });
    this.document.body.appendChild(region);
    this.region = region;

    this.queue = [];
    this.schedule(() => {
      const queued = this.queue ?? [];
      this.queue = null;
      queued.forEach(id => this.append(id));
    }, NEW_REGION_DELAY);
  }

  // The callbacks only touch the live region, so they need no change detection, and a zone app
  // would otherwise stay unstable until the announcement is removed.
  private schedule(callback: () => void, delay: number): void {
    const timeout = this.ngZone.runOutsideAngular(() =>
      setTimeout(() => {
        this.timeouts.delete(timeout);
        callback();
      }, delay),
    );
    this.timeouts.add(timeout);
  }
}
