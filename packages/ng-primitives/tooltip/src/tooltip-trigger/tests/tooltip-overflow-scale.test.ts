import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgpTooltip } from 'ng-primitives/tooltip';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { NgpTooltipTrigger } from '../tooltip-trigger';

/**
 * Guards the cost of rendering many `showOnOverflow` triggers at once.
 *
 * Every such trigger observes its element for resizes. If that observation measures
 * the element synchronously while Angular is still creating elements, each read
 * forces a layout flush in the middle of a pass full of DOM writes — so N triggers
 * cost N reflows, and each reflow grows with the document. That is not a constant
 * factor to tune later: it is what took a dense page from milliseconds to tens of
 * seconds of blocked main thread.
 *
 * The assertion counts layout reads rather than elapsed time deliberately. Wall
 * clock varies with the machine and would either flake or be set so loose it caught
 * nothing; the read count is deterministic and expresses the invariant directly.
 */
const TRIGGER_COUNT = 200;

@Component({
  template: `
    @for (item of items; track item) {
      <button
        class="trigger"
        [ngpTooltipTrigger]="tooltip"
        ngpTooltipTriggerShowOnOverflow="true"
        type="button"
      >
        A label long enough that it cannot fit inside the button it is rendered in
      </button>
    }

    <ng-template #tooltip>
      <div ngpTooltip>Tooltip content</div>
    </ng-template>
  `,
  styles: `
    .trigger {
      display: inline-block;
      width: 80px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `,
  imports: [NgpTooltipTrigger, NgpTooltip],
})
class ManyOverflowTriggersComponent {
  readonly items = Array.from({ length: TRIGGER_COUNT }, (_, index) => index);
}

describe('tooltip showOnOverflow at scale', () => {
  let restore: (() => void) | undefined;

  afterEach(() => {
    restore?.();
    restore = undefined;
  });

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should not force a layout read per trigger while rendering', () => {
    const fixture = TestBed.createComponent(ManyOverflowTriggersComponent);

    const reads = countLayoutReads(() => fixture.detectChanges());

    // Before the initial measurement was deferred this was at least two reads per
    // trigger — `offsetWidth` and `offsetHeight` each — plus the inline fallback's
    // `getComputedStyle`, all interleaved with Angular's own DOM writes.
    expect(reads).toBeLessThan(TRIGGER_COUNT);
  });

  /** Counts layout-invalidating reads on any element for the duration of `run`. */
  function countLayoutReads(run: () => void): number {
    let reads = 0;

    const prototype = HTMLElement.prototype;
    const offsetWidth = Object.getOwnPropertyDescriptor(prototype, 'offsetWidth')!;
    const offsetHeight = Object.getOwnPropertyDescriptor(prototype, 'offsetHeight')!;
    const boundingRect = Element.prototype.getBoundingClientRect;
    const computedStyle = window.getComputedStyle;

    Object.defineProperty(prototype, 'offsetWidth', {
      configurable: true,
      get() {
        reads++;
        return offsetWidth.get!.call(this);
      },
    });
    Object.defineProperty(prototype, 'offsetHeight', {
      configurable: true,
      get() {
        reads++;
        return offsetHeight.get!.call(this);
      },
    });
    Element.prototype.getBoundingClientRect = function (this: Element) {
      reads++;
      return boundingRect.call(this);
    };
    window.getComputedStyle = ((...args: Parameters<typeof computedStyle>) => {
      reads++;
      return computedStyle(...args);
    }) as typeof computedStyle;

    restore = () => {
      Object.defineProperty(prototype, 'offsetWidth', offsetWidth);
      Object.defineProperty(prototype, 'offsetHeight', offsetHeight);
      Element.prototype.getBoundingClientRect = boundingRect;
      window.getComputedStyle = computedStyle;
    };

    try {
      run();
    } finally {
      restore();
      restore = undefined;
    }

    return reads;
  }
});
