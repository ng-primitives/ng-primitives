import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgpTooltip } from 'ng-primitives/tooltip';
import { beforeEach, describe, expect, it } from 'vitest';
import { NgpTooltipTrigger } from '../tooltip-trigger';

/** Overflow is measured on demand now, so no observer should exist until then. */
function countObserverInstances(run: () => void): { resize: number; mutation: number } {
  let resize = 0;
  let mutation = 0;

  const OriginalResizeObserver = window.ResizeObserver;
  const OriginalMutationObserver = window.MutationObserver;

  window.ResizeObserver = class extends OriginalResizeObserver {
    constructor(...args: ConstructorParameters<typeof OriginalResizeObserver>) {
      resize++;
      super(...args);
    }
  };
  window.MutationObserver = class extends OriginalMutationObserver {
    constructor(...args: ConstructorParameters<typeof OriginalMutationObserver>) {
      mutation++;
      super(...args);
    }
  };

  try {
    run();
  } finally {
    window.ResizeObserver = OriginalResizeObserver;
    window.MutationObserver = OriginalMutationObserver;
  }

  return { resize, mutation };
}

/**
 * Guards the cost of rendering many `showOnOverflow` triggers at once. Counts layout
 * reads rather than elapsed time, since wall clock flakes or is set too loose to catch
 * a regression; the read count is deterministic and expresses the invariant directly.
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

  it('should not construct a ResizeObserver or MutationObserver while rendering', () => {
    const fixture = TestBed.createComponent(ManyOverflowTriggersComponent);

    const { resize, mutation } = countObserverInstances(() => fixture.detectChanges());

    expect(resize).toBe(0);
    expect(mutation).toBe(0);
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

    try {
      run();
    } finally {
      Object.defineProperty(prototype, 'offsetWidth', offsetWidth);
      Object.defineProperty(prototype, 'offsetHeight', offsetHeight);
      Element.prototype.getBoundingClientRect = boundingRect;
      window.getComputedStyle = computedStyle;
    }

    return reads;
  }
});
