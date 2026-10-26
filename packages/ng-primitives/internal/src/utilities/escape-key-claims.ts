import { DestroyRef, inject, Injectable } from '@angular/core';

export type NgpEscapeKeyClaim = (event: KeyboardEvent) => boolean;

/**
 * Escape keys that a control will handle itself, so overlays leave them alone.
 * Overlays listen in the capture phase, before the control sees the key, so they
 * ask here rather than relying on the control to stop the event.
 */
@Injectable({ providedIn: 'root' })
export class NgpEscapeKeyClaims {
  private readonly claims = new Set<NgpEscapeKeyClaim>();

  add(claim: NgpEscapeKeyClaim): () => void {
    // wrap so each registration is released on its own, even for a shared claim
    const entry: NgpEscapeKeyClaim = event => claim(event);
    this.claims.add(entry);
    return () => this.claims.delete(entry);
  }

  isClaimed(event: KeyboardEvent): boolean {
    return [...this.claims].some(claim => claim(event));
  }
}

/**
 * Claim the Escape keys `claim` returns true for, for the lifetime of the current injection context.
 */
export function claimEscapeKey(claim: NgpEscapeKeyClaim): void {
  inject(DestroyRef).onDestroy(inject(NgpEscapeKeyClaims).add(claim));
}
