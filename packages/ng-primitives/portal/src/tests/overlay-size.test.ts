import { Component } from '@angular/core';
import { fireEvent, render } from '@testing-library/angular';
import {
  NgpCombobox,
  NgpComboboxButton,
  NgpComboboxDropdown,
  NgpComboboxInput,
  NgpComboboxPortal,
} from 'ng-primitives/combobox';
import { NgpPopover, NgpPopoverTrigger } from 'ng-primitives/popover';
import { NgpSelect, NgpSelectDropdown, NgpSelectPortal } from 'ng-primitives/select';
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
        <!-- Dropdowns rendered in place rather than in their own portal. -->
        <div ngpCombobox>
          <input ngpComboboxInput />
          <div ngpComboboxDropdown></div>
        </div>
        <div ngpSelect>
          <div ngpSelectDropdown></div>
        </div>
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
  imports: [
    NgpPopoverTrigger,
    NgpPopover,
    NgpCombobox,
    NgpComboboxInput,
    NgpComboboxDropdown,
    NgpSelect,
    NgpSelectDropdown,
  ],
})
class PopoverWithInlineDropdownsTestComponent {}

@Component({
  template: `
    <div
      class="trigger"
      [ngpComboboxDropdownOffset]="0"
      ngpCombobox
      ngpComboboxDropdownPlacement="top"
    >
      <input ngpComboboxInput />
      <button ngpComboboxButton>Open</button>

      <div *ngpComboboxPortal ngpComboboxDropdown>
        <div class="content"></div>
      </div>
    </div>
  `,
  styles: `
    .trigger {
      position: fixed;
      top: ${TRIGGER_TOP}px;
      left: 0;
      height: ${TRIGGER_HEIGHT}px;
    }

    [ngpComboboxDropdown] {
      position: fixed;
      width: 120px;
      max-height: var(--ngp-combobox-available-height);
      overflow: auto;
    }

    .content {
      height: 500px;
    }
  `,
  imports: [
    NgpCombobox,
    NgpComboboxInput,
    NgpComboboxButton,
    NgpComboboxPortal,
    NgpComboboxDropdown,
  ],
})
class TallComboboxTestComponent {}

@Component({
  template: `
    <div class="trigger" [ngpSelectDropdownOffset]="0" ngpSelect ngpSelectDropdownPlacement="top">
      Open
      <div *ngpSelectPortal ngpSelectDropdown>
        <div class="content"></div>
      </div>
    </div>
  `,
  styles: `
    .trigger {
      position: fixed;
      top: ${TRIGGER_TOP}px;
      left: 0;
      height: ${TRIGGER_HEIGHT}px;
    }

    [ngpSelectDropdown] {
      position: fixed;
      width: 120px;
      max-height: var(--ngp-select-available-height);
      overflow: auto;
    }

    .content {
      height: 500px;
    }
  `,
  imports: [NgpSelect, NgpSelectPortal, NgpSelectDropdown],
})
class TallSelectTestComponent {}

/** The rect of the element matching `selector` in each of the first `count` painted frames in which it exists. */
function recordFrames(selector: string, count: number): Promise<DOMRect[]> {
  return new Promise(resolve => {
    const frames: DOMRect[] = [];
    const tick = () => {
      const element = document.querySelector<HTMLElement>(selector);
      if (element) frames.push(element.getBoundingClientRect());
      if (frames.length >= count) return resolve(frames);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

describe('overlay size', () => {
  afterEach(async () => {
    document
      .querySelectorAll('[ngpPopover], [ngpComboboxDropdown], [ngpSelectDropdown]')
      .forEach(el => el.remove());
    await page.viewport(414, 896);
  });

  it('should position an overlay for the size it is capped to from its first frame', async () => {
    // 300px above the trigger, 80px below: the 500px popover opens above and shrinks to 300px.
    await page.viewport(400, VIEWPORT_HEIGHT);
    const { getByRole } = await render(TallPopoverTestComponent);

    const recording = recordFrames('[ngpPopover]', 3);
    fireEvent.click(getByRole('button'));
    const frames = await recording;

    expect(frames.map(frame => [Math.round(frame.top), Math.round(frame.bottom)])).toEqual([
      [0, TRIGGER_TOP],
      [0, TRIGGER_TOP],
      [0, TRIGGER_TOP],
    ]);
  });

  it('should position a combobox dropdown for the size it is capped to from its first frame', async () => {
    await page.viewport(400, VIEWPORT_HEIGHT);
    const { getByRole } = await render(TallComboboxTestComponent);

    const recording = recordFrames('[ngpComboboxDropdown]', 3);
    fireEvent.click(getByRole('button'));
    const frames = await recording;

    expect(frames.map(frame => [Math.round(frame.top), Math.round(frame.bottom)])).toEqual([
      [0, TRIGGER_TOP],
      [0, TRIGGER_TOP],
      [0, TRIGGER_TOP],
    ]);
  });

  it('should position a select dropdown for the size it is capped to from its first frame', async () => {
    await page.viewport(400, VIEWPORT_HEIGHT);
    const { getByRole } = await render(TallSelectTestComponent);

    const recording = recordFrames('[ngpSelectDropdown]', 3);
    fireEvent.click(getByRole('combobox'));
    const frames = await recording;

    expect(frames.map(frame => [Math.round(frame.top), Math.round(frame.bottom)])).toEqual([
      [0, TRIGGER_TOP],
      [0, TRIGGER_TOP],
      [0, TRIGGER_TOP],
    ]);
  });

  it('should keep the cap of an overlay that renders dropdowns in place', async () => {
    await page.viewport(400, VIEWPORT_HEIGHT);
    const { getByRole } = await render(PopoverWithInlineDropdownsTestComponent);

    const recording = recordFrames('[ngpPopover]', 3);
    fireEvent.click(getByRole('button'));
    const frames = await recording;

    expect(frames.map(frame => [Math.round(frame.top), Math.round(frame.bottom)])).toEqual([
      [0, TRIGGER_TOP],
      [0, TRIGGER_TOP],
      [0, TRIGGER_TOP],
    ]);
  });
});
