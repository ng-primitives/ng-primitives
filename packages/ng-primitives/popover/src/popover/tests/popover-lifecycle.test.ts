import { By } from '@angular/platform-browser';
import { render } from '@testing-library/angular';
import { NgpPopover, NgpPopoverTrigger } from 'ng-primitives/popover';
import { afterEach, describe, expect, it, vi } from 'vitest';

const TEMPLATE = `
  <div style="padding: 200px">
    <button
      [ngpPopoverTrigger]="popover"
      (ngpPopoverTriggerOpenChange)="onOpenChange($event)"
    >
      Trigger
    </button>

    <ng-template #popover>
      <div ngpPopover>Popover content</div>
    </ng-template>
  </div>
`;

describe('NgpPopoverTrigger lifecycle', () => {
  afterEach(() => {
    document.querySelectorAll('[ngpPopover]').forEach(el => el.remove());
  });

  it('should resolve show() when the popover is already open', async () => {
    const openChange = vi.fn();

    const { fixture } = await render(TEMPLATE, {
      imports: [NgpPopoverTrigger, NgpPopover],
      componentProperties: { onOpenChange: openChange },
    });

    const trigger = fixture.debugElement
      .query(By.directive(NgpPopoverTrigger))
      .injector.get(NgpPopoverTrigger);

    await trigger.show();

    // Previously this never settled, so awaiting it hung forever.
    await trigger.show();

    expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
  });

  it('should settle show() calls that arrive while an open is still scheduled', async () => {
    const openChange = vi.fn();

    const { fixture } = await render(
      `
        <div style="padding: 200px">
          <button
            [ngpPopoverTrigger]="popover"
            ngpPopoverTriggerShowDelay="100"
            (ngpPopoverTriggerOpenChange)="onOpenChange($event)"
          >
            Trigger
          </button>

          <ng-template #popover>
            <div ngpPopover>Popover content</div>
          </ng-template>
        </div>
      `,
      {
        imports: [NgpPopoverTrigger, NgpPopover],
        componentProperties: { onOpenChange: openChange },
      },
    );

    const trigger = fixture.debugElement
      .query(By.directive(NgpPopoverTrigger))
      .injector.get(NgpPopoverTrigger);

    // Both calls land inside the show delay, so the second joins an open that is
    // already scheduled rather than starting its own. It has to settle too.
    const outcome = await Promise.race([
      Promise.all([trigger.show(), trigger.show()]).then(() => 'settled'),
      new Promise(resolve => setTimeout(() => resolve('hung'), 1000)),
    ]);

    expect(outcome).toBe('settled');
    expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
    // A single open happened, so it should be announced once.
    expect(openChange.mock.calls).toEqual([[true]]);
  });

  it('should only emit openChange once for repeated show() calls', async () => {
    const openChange = vi.fn();

    const { fixture } = await render(TEMPLATE, {
      imports: [NgpPopoverTrigger, NgpPopover],
      componentProperties: { onOpenChange: openChange },
    });

    const trigger = fixture.debugElement
      .query(By.directive(NgpPopoverTrigger))
      .injector.get(NgpPopoverTrigger);

    await trigger.show();
    await trigger.show();

    expect(openChange.mock.calls).toEqual([[true]]);
  });
});
