import { Component } from '@angular/core';
import { fireEvent, render } from '@testing-library/angular';
import {
  NgpCombobox,
  NgpComboboxButton,
  NgpComboboxDropdown,
  NgpComboboxInput,
  NgpComboboxPortal,
} from 'ng-primitives/combobox';
import { NgpMenu, NgpMenuTrigger } from 'ng-primitives/menu';
import { NgpPopover, NgpPopoverTrigger } from 'ng-primitives/popover';
import { NgpSelect, NgpSelectDropdown, NgpSelectPortal } from 'ng-primitives/select';
import { afterEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

const VIEWPORT_HEIGHT = 400;
const TRIGGER_TOP = 300;
const TRIGGER_HEIGHT = 20;

/** A trigger 300px from the top with 80px below, and a 500px overlay capped to its room. */
function cappedStyles(overlay: string, property: string): string {
  return `
    .trigger {
      position: fixed;
      top: ${TRIGGER_TOP}px;
      left: 0;
      height: ${TRIGGER_HEIGHT}px;
    }

    ${overlay} {
      position: fixed;
      width: 120px;
      max-height: var(${property});
      overflow: auto;
    }

    .content {
      height: 500px;
    }
  `;
}

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
  styles: cappedStyles('[ngpPopover]', '--ngp-popover-available-height'),
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
  styles: cappedStyles('[ngpPopover]', '--ngp-popover-available-height'),
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
    <button
      class="trigger"
      [ngpMenuTrigger]="menu"
      [ngpMenuTriggerOffset]="0"
      ngpMenuTriggerPlacement="top"
    >
      Open Menu
    </button>

    <ng-template #menu>
      <div ngpMenu>
        <div class="content"></div>
      </div>
    </ng-template>
  `,
  styles: cappedStyles('[ngpMenu]', '--ngp-menu-available-height'),
  imports: [NgpMenuTrigger, NgpMenu],
})
class TallMenuTestComponent {}

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
  styles: cappedStyles('[ngpComboboxDropdown]', '--ngp-combobox-available-height'),
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
  styles: cappedStyles('[ngpSelectDropdown]', '--ngp-select-available-height'),
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

/** Open the overlay and expect it capped to the room above its trigger in its first three frames. */
async function expectCappedFromFirstFrame(selector: string, open: () => void): Promise<void> {
  const recording = recordFrames(selector, 3);
  open();
  const frames = await recording;

  expect(frames.map(frame => [Math.round(frame.top), Math.round(frame.bottom)])).toEqual([
    [0, TRIGGER_TOP],
    [0, TRIGGER_TOP],
    [0, TRIGGER_TOP],
  ]);
}

describe('overlay size', () => {
  afterEach(async () => {
    document
      .querySelectorAll('[ngpPopover], [ngpMenu], [ngpComboboxDropdown], [ngpSelectDropdown]')
      .forEach(el => el.remove());
    await page.viewport(414, 896);
  });

  it('should position an overlay for the size it is capped to from its first frame', async () => {
    await page.viewport(400, VIEWPORT_HEIGHT);
    const { getByRole } = await render(TallPopoverTestComponent);

    await expectCappedFromFirstFrame('[ngpPopover]', () => fireEvent.click(getByRole('button')));
  });

  it('should position a menu for the size it is capped to from its first frame', async () => {
    await page.viewport(400, VIEWPORT_HEIGHT);
    const { getByRole } = await render(TallMenuTestComponent);

    await expectCappedFromFirstFrame('[ngpMenu]', () => fireEvent.click(getByRole('button')));
  });

  it('should position a combobox dropdown for the size it is capped to from its first frame', async () => {
    await page.viewport(400, VIEWPORT_HEIGHT);
    const { getByRole } = await render(TallComboboxTestComponent);

    await expectCappedFromFirstFrame('[ngpComboboxDropdown]', () =>
      fireEvent.click(getByRole('button')),
    );
  });

  it('should position a select dropdown for the size it is capped to from its first frame', async () => {
    await page.viewport(400, VIEWPORT_HEIGHT);
    const { getByRole } = await render(TallSelectTestComponent);

    await expectCappedFromFirstFrame('[ngpSelectDropdown]', () =>
      fireEvent.click(getByRole('combobox')),
    );
  });

  it('should keep the cap of an overlay that renders dropdowns in place', async () => {
    await page.viewport(400, VIEWPORT_HEIGHT);
    const { getByRole } = await render(PopoverWithInlineDropdownsTestComponent);

    await expectCappedFromFirstFrame('[ngpPopover]', () => fireEvent.click(getByRole('button')));
  });
});
