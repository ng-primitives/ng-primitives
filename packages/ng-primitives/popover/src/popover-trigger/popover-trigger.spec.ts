import { fireEvent, render, waitFor } from '@testing-library/angular';
import { NgpPopover, NgpPopoverTrigger } from 'ng-primitives/popover';

describe('NgpPopoverTrigger', () => {
  it('should destroy the overlay when the trigger is destroyed', async () => {
    const { fixture, getByRole } = await render(
      `
        <button [ngpPopoverTrigger]="content"></button>

        <ng-template #content>
          <div ngpPopover>
            Popover content
          </div>
        </ng-template>
      `,
      {
        imports: [NgpPopoverTrigger, NgpPopover],
      },
    );

    const trigger = getByRole('button');
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
    });

    fixture.destroy();

    await waitFor(() => {
      expect(document.querySelector('[ngpPopover]')).not.toBeInTheDocument();
    });
  });
});
