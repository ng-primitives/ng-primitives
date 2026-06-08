import { fireEvent, render, waitFor } from '@testing-library/angular';
import { NgpTooltip, NgpTooltipArrow, NgpTooltipTrigger } from 'ng-primitives/tooltip';
import { afterEach, describe, expect, it } from 'vitest';

describe('NgpTooltipArrow', () => {
  afterEach(() => {
    // Overlay content is attached to the document body, not the fixture, so remove
    // any leftover tooltips between tests.
    document.querySelectorAll('[ngpTooltip]').forEach(el => el.remove());
  });

  it('should render the arrow inside the tooltip with a data-placement attribute', async () => {
    const { getByRole } = await render(
      `
        <button [ngpTooltipTrigger]="content" ngpTooltipTriggerShowDelay="0"></button>

        <ng-template #content>
          <div ngpTooltip>
            Tooltip content
            <div ngpTooltipArrow></div>
          </div>
        </ng-template>
      `,
      {
        imports: [NgpTooltipTrigger, NgpTooltip, NgpTooltipArrow],
      },
    );

    fireEvent.mouseEnter(getByRole('button'));

    // Once positioning settles the arrow reflects the resolved placement.
    await waitFor(() => {
      const arrow = document.querySelector('[ngpTooltipArrow]');
      expect(arrow).toBeInTheDocument();
      expect(arrow).toHaveAttribute('data-placement');
    });
  });

  it('should accept the padding input', async () => {
    const { getByRole } = await render(
      `
        <button [ngpTooltipTrigger]="content" ngpTooltipTriggerShowDelay="0"></button>

        <ng-template #content>
          <div ngpTooltip>
            Tooltip content
            <div ngpTooltipArrow ngpTooltipArrowPadding="8"></div>
          </div>
        </ng-template>
      `,
      {
        imports: [NgpTooltipTrigger, NgpTooltip, NgpTooltipArrow],
      },
    );

    fireEvent.mouseEnter(getByRole('button'));

    await waitFor(() => {
      expect(document.querySelector('[ngpTooltipArrow]')).toBeInTheDocument();
    });
  });
});
