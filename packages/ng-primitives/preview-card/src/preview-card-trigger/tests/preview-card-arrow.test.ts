import { fireEvent, render, waitFor } from '@testing-library/angular';
import {
  NgpPreviewCard,
  NgpPreviewCardArrow,
  NgpPreviewCardTrigger,
} from 'ng-primitives/preview-card';
import { afterEach, describe, expect, it } from 'vitest';

describe('NgpPreviewCardArrow', () => {
  afterEach(() => {
    document.querySelectorAll('[ngpPreviewCard]').forEach(el => el.remove());
  });

  async function openWithArrow() {
    const { getByRole } = await render(
      // Offset from the viewport origin so the headless browser's parked cursor
      // does not sit on the trigger and open the card by itself.
      `
        <div style="padding: 200px">
          <a
            href="/ashley"
            [ngpPreviewCardTrigger]="card"
            ngpPreviewCardTriggerShowDelay="0"
            ngpPreviewCardTriggerHideDelay="0"
            >@ashley</a
          >

          <ng-template #card>
            <div ngpPreviewCard>
              Preview content
              <div ngpPreviewCardArrow></div>
            </div>
          </ng-template>
        </div>
      `,
      { imports: [NgpPreviewCardTrigger, NgpPreviewCard, NgpPreviewCardArrow] },
    );

    fireEvent.pointerEnter(getByRole('link'), { pointerType: 'mouse' });

    await waitFor(() => {
      expect(document.querySelector('[ngpPreviewCardArrow]')).toBeInTheDocument();
    });

    return document.querySelector<HTMLElement>('[ngpPreviewCardArrow]')!;
  }

  it('should reflect the resolved placement so the arrow can be styled per side', async () => {
    const arrow = await openWithArrow();

    await waitFor(() => {
      expect(arrow.getAttribute('data-placement')).toBeTruthy();
    });
  });

  it('should position the arrow against the trigger', async () => {
    const arrow = await openWithArrow();

    await waitFor(() => {
      const { insetInlineStart, insetBlockStart } = arrow.style;
      expect(insetInlineStart !== '' || insetBlockStart !== '').toBe(true);
    });
  });
});
