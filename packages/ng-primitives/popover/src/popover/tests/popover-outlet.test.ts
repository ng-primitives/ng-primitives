import { Component, Type } from '@angular/core';
import { By } from '@angular/platform-browser';
import { render } from '@testing-library/angular';
import { NgpPopover, NgpPopoverTrigger } from 'ng-primitives/popover';
import { afterEach, describe, expect, it, vi } from 'vitest';

const POPOVER_STYLE = 'position: absolute; width: 100px; height: 20px';

/** The `ngpPopover` element is a child of the portal root, not the root itself. */
@Component({
  selector: 'app-wrapped-popover',
  imports: [NgpPopover],
  template: `
    <div ngpPopover style="${POPOVER_STYLE}">Popover content</div>
  `,
})
class WrappedPopover {}

/** The host element is both the portal root and the `ngpPopover` element. */
@Component({
  selector: 'app-host-directive-popover',
  hostDirectives: [NgpPopover],
  host: { style: POPOVER_STYLE },
  template: `
    Popover content
  `,
})
class HostDirectivePopover {}

@Component({
  imports: [NgpPopoverTrigger],
  template: `
    <div style="padding: 200px">
      <button [ngpPopoverTrigger]="popover" style="width: 40px">Trigger</button>
    </div>
  `,
})
class ComponentClassTrigger {
  readonly popover: Type<unknown> = WrappedPopover;
}

/**
 * Opens the popover and asserts it is centred under the trigger. A popover that is
 * positioned relative to the wrong element is offset by half its own width.
 */
async function expectCentredUnderTrigger(
  fixture: Awaited<ReturnType<typeof render>>['fixture'],
): Promise<void> {
  const trigger = fixture.debugElement
    .query(By.directive(NgpPopoverTrigger))
    .injector.get(NgpPopoverTrigger);
  await trigger.show();

  await vi.waitFor(() => expect(document.querySelector('[data-overlay]')).not.toBeNull());
  const popover = document.querySelector<HTMLElement>('[data-overlay]')!;
  await vi.waitFor(() => expect(popover.style.left).not.toBe(''));

  const triggerRect = fixture.nativeElement.querySelector('button').getBoundingClientRect();
  const popoverRect = popover.getBoundingClientRect();

  const triggerCentre = triggerRect.left + triggerRect.width / 2;
  const popoverCentre = popoverRect.left + popoverRect.width / 2;
  expect(Math.abs(popoverCentre - triggerCentre)).toBeLessThan(2);
}

describe('NgpPopover outlet element positioning', () => {
  afterEach(() => {
    document
      .querySelectorAll('[ngpPopover], app-host-directive-popover')
      .forEach(el => el.remove());
  });

  it('should position a popover rendered by a child component of the template', async () => {
    const { fixture } = await render(
      `
        <div style="padding: 200px">
          <button [ngpPopoverTrigger]="popover" style="width: 40px">Trigger</button>

          <ng-template #popover>
            <app-wrapped-popover />
          </ng-template>
        </div>
      `,
      { imports: [NgpPopoverTrigger, WrappedPopover] },
    );

    await expectCentredUnderTrigger(fixture);
  });

  it('should position a popover applied through hostDirectives', async () => {
    const { fixture } = await render(
      `
        <div style="padding: 200px">
          <button [ngpPopoverTrigger]="popover" style="width: 40px">Trigger</button>

          <ng-template #popover>
            <app-host-directive-popover />
          </ng-template>
        </div>
      `,
      { imports: [NgpPopoverTrigger, HostDirectivePopover] },
    );

    await expectCentredUnderTrigger(fixture);
  });

  it('should position a popover when a component class is passed to the trigger', async () => {
    const { fixture } = await render(ComponentClassTrigger);

    await expectCentredUnderTrigger(fixture);
  });
});
