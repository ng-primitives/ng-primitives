import { fireEvent, render, waitFor } from '@testing-library/angular';
import { NgpPopover, NgpPopoverArrow, NgpPopoverTrigger } from 'ng-primitives/popover';
import { afterEach, describe, expect, it } from 'vitest';

describe('NgpPopoverArrow', () => {
  afterEach(() => {
    document.querySelectorAll('[ngpPopover]').forEach(el => el.remove());
  });

  it('should reflect the resolved placement on the arrow via data-placement', async () => {
    const { getByRole } = await render(
      `
        <button [ngpPopoverTrigger]="content" ngpPopoverTriggerPlacement="bottom">Open</button>

        <ng-template #content>
          <div ngpPopover>
            Popover content
            <div ngpPopoverArrow></div>
          </div>
        </ng-template>
      `,
      { imports: [NgpPopoverTrigger, NgpPopover, NgpPopoverArrow] },
    );

    fireEvent.click(getByRole('button'));

    await waitFor(() =>
      expect(document.querySelector('[ngpPopoverArrow]')).toHaveAttribute(
        'data-placement',
        'bottom',
      ),
    );
  });
});
