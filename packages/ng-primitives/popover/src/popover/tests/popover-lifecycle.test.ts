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
