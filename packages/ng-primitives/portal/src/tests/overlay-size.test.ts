import { Component } from '@angular/core';
import { fireEvent, render } from '@testing-library/angular';
import { NgpPopover, NgpPopoverTrigger } from 'ng-primitives/popover';
import { afterEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

const VIEWPORT_HEIGHT = 400;
const TRIGGER_TOP = 300;
const TRIGGER_HEIGHT = 20;

@Component({
  template: `
    <button
      class="trigger"
      [ngpPopoverTrigger]="content"
      [ngpPopoverTriggerOffset]="0"
      ngpPopoverTriggerPlacement="top"
    >
      Open Popover
    </button>

    <ng-template #content>
      <div ngpPopover>
        <div class="content"></div>
      </div>
    </ng-template>
  `,
  styles: `
    .trigger {
      position: fixed;
      top: ${TRIGGER_TOP}px;
      left: 0;
      height: ${TRIGGER_HEIGHT}px;
    }

    /* The usual recipe: the popover shrinks to the room on its side and scrolls inside. */
    [ngpPopover] {
      position: fixed;
      width: 120px;
      max-height: var(--ngp-popover-available-height);
      overflow: auto;
    }

    .content {
      height: 500px;
    }
  `,
  imports: [NgpPopoverTrigger, NgpPopover],
})
class TallPopoverTestComponent {}

/** The popover's rect in each of the first `count` painted frames in which it exists. */
function recordFrames(count: number): Promise<DOMRect[]> {
  return new Promise(resolve => {
    const frames: DOMRect[] = [];
    const tick = () => {
      const popover = document.querySelector<HTMLElement>('[ngpPopover]');
      if (popover) frames.push(popover.getBoundingClientRect());
      if (frames.length >= count) return resolve(frames);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

describe('overlay size', () => {
  afterEach(async () => {
    document.querySelectorAll('[ngpPopover]').forEach(el => el.remove());
    await page.viewport(414, 896);
  });

  it('should position an overlay for the size it is capped to from its first frame', async () => {
    // 300px above the trigger, 80px below: the 500px popover opens above and shrinks to 300px.
    await page.viewport(400, VIEWPORT_HEIGHT);
    const { getByRole } = await render(TallPopoverTestComponent);

    const recording = recordFrames(3);
    fireEvent.click(getByRole('button'));
    const frames = await recording;

    expect(frames.map(frame => [Math.round(frame.top), Math.round(frame.bottom)])).toEqual([
      [0, TRIGGER_TOP],
      [0, TRIGGER_TOP],
      [0, TRIGGER_TOP],
    ]);
  });
});
