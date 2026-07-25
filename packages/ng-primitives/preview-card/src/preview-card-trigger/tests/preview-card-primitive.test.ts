import { fireEvent, render, waitFor } from '@testing-library/angular';
import { NgpPreviewCard, NgpPreviewCardTrigger } from 'ng-primitives/preview-card';
import { afterEach, describe, expect, it, vi } from 'vitest';

describe('NgpPreviewCardTrigger (primitive)', () => {
  afterEach(() => {
    // Overlay content is attached to the document body, not the fixture, so
    // remove any leftover cards between tests.
    document.querySelectorAll('[ngpPreviewCard]').forEach(el => el.remove());
    vi.useRealTimers();
  });

  describe('opening', () => {
    it('should show the preview card when the pointer enters the trigger', async () => {
      const { getByRole } = await render(
        `
          <a
            href="/ashley"
            [ngpPreviewCardTrigger]="card"
            ngpPreviewCardTriggerShowDelay="0"
            ngpPreviewCardTriggerHideDelay="0"
            >@ashley</a
          >

          <ng-template #card>
            <div ngpPreviewCard>Preview content</div>
          </ng-template>
        `,
        { imports: [NgpPreviewCardTrigger, NgpPreviewCard] },
      );

      expect(document.querySelector('[ngpPreviewCard]')).not.toBeInTheDocument();

      fireEvent.pointerEnter(getByRole('link'), { pointerType: 'mouse' });

      await waitFor(() => {
        expect(document.querySelector('[ngpPreviewCard]')).toBeInTheDocument();
      });
    });
  });

  describe('accessibility contract', () => {
    /**
     * A preview card is intentionally invisible to assistive technology. These tests
     * assert the *absence* of ARIA, which is the whole reason this primitive exists
     * separately from tooltip (role="tooltip" + aria-describedby) and popover
     * (role="dialog" + focus trap).
     */
    async function openCard() {
      const view = await render(
        `
          <a
            href="/ashley"
            [ngpPreviewCardTrigger]="card"
            ngpPreviewCardTriggerShowDelay="0"
            ngpPreviewCardTriggerHideDelay="0"
            >@ashley</a
          >

          <ng-template #card>
            <div ngpPreviewCard><a href="/ashley/repos">Repositories</a></div>
          </ng-template>
        `,
        { imports: [NgpPreviewCardTrigger, NgpPreviewCard] },
      );

      const trigger = view.getByRole('link', { name: '@ashley' });
      fireEvent.pointerEnter(trigger, { pointerType: 'mouse' });

      await waitFor(() => {
        expect(document.querySelector('[ngpPreviewCard]')).toBeInTheDocument();
      });

      return { ...view, trigger, card: document.querySelector('[ngpPreviewCard]')! };
    }

    it('should not assign any role to the preview card', async () => {
      const { card } = await openCard();
      expect(card.hasAttribute('role')).toBe(false);
    });

    it('should not link the trigger to the preview card via ARIA', async () => {
      const { trigger } = await openCard();

      expect(trigger.hasAttribute('aria-describedby')).toBe(false);
      expect(trigger.hasAttribute('aria-controls')).toBe(false);
      expect(trigger.hasAttribute('aria-expanded')).toBe(false);
      expect(trigger.hasAttribute('aria-haspopup')).toBe(false);
    });

    it('should keep the preview card root out of the tab sequence', async () => {
      const { card } = await openCard();
      expect(card.getAttribute('tabindex')).toBe('-1');
    });

    it('should leave focusable content inside the card reachable', async () => {
      const { card } = await openCard();
      const link = card.querySelector('a');

      expect(link).toBeInTheDocument();
      expect(link?.hasAttribute('tabindex')).toBe(false);
    });

    it('should expose state as data attributes for styling', async () => {
      const { trigger, card } = await openCard();

      expect(trigger.getAttribute('data-open')).toBe('');
      expect(card.getAttribute('data-overlay')).toBe('');

      await waitFor(() => {
        expect(card.getAttribute('data-placement')).toBeTruthy();
      });
    });

    it('should not set data-open on the trigger while closed', async () => {
      const { getByRole } = await render(
        `
          <a href="/ashley" [ngpPreviewCardTrigger]="card">@ashley</a>

          <ng-template #card>
            <div ngpPreviewCard>Preview content</div>
          </ng-template>
        `,
        { imports: [NgpPreviewCardTrigger, NgpPreviewCard] },
      );

      expect(getByRole('link').hasAttribute('data-open')).toBe(false);
    });
  });
});
