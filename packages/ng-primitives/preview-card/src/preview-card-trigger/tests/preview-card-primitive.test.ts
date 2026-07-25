import { fireEvent, render, waitFor } from '@testing-library/angular';
import { NgpPreviewCard, NgpPreviewCardTrigger } from 'ng-primitives/preview-card';
import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * Every fixture labels its card so assertions can never be satisfied by a card
 * left behind by an earlier test - overlay content is attached to the document
 * body rather than the fixture, so a leaked card is otherwise indistinguishable
 * from the one under test.
 */
function template(label: string, attrs = ''): string {
  return wrap(
    `
    <a
      href="/ashley"
      [ngpPreviewCardTrigger]="card"
      ngpPreviewCardTriggerShowDelay="0"
      ngpPreviewCardTriggerHideDelay="0"
      ${attrs}
      >@ashley</a
    >

    <ng-template #card>
      <div ngpPreviewCard>${label}</div>
    </ng-template>
  `,
  );
}

/**
 * Offsets the fixture away from the viewport origin.
 *
 * The headless browser parks its real cursor at (0, 0). A fixture rendered at the
 * origin therefore appears *under* that cursor, and the browser dispatches a
 * genuine `pointerenter` (pointerType "mouse", isTrusted true) at render time -
 * opening the card before the test dispatches anything. Pushing the trigger away
 * from the origin keeps the real cursor off it so only dispatched events count.
 */
function wrap(content: string): string {
  return `<div style="padding: 200px">${content}</div>`;
}

function card(label: string): HTMLElement | null {
  return (
    [...document.querySelectorAll<HTMLElement>('[ngpPreviewCard]')].find(
      el => el.textContent?.trim() === label,
    ) ?? null
  );
}

/** Settle time for asserting that something did *not* happen. */
function settle(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 50));
}

describe('NgpPreviewCardTrigger (primitive)', () => {
  afterEach(() => {
    document.querySelectorAll('[ngpPreviewCard]').forEach(el => el.remove());
    vi.useRealTimers();
  });

  describe('opening', () => {
    it('should show the preview card when the pointer enters the trigger', async () => {
      const { getByRole } = await render(template('open-on-enter'), {
        imports: [NgpPreviewCardTrigger, NgpPreviewCard],
      });

      expect(card('open-on-enter')).toBeNull();

      fireEvent.pointerEnter(getByRole('link'), { pointerType: 'mouse' });

      await waitFor(() => {
        expect(card('open-on-enter')).toBeInTheDocument();
      });
    });
  });

  describe('closing on pointer leave', () => {
    it('should hide the preview card when the pointer leaves the trigger', async () => {
      const { getByRole } = await render(template('close-on-leave'), {
        imports: [NgpPreviewCardTrigger, NgpPreviewCard],
      });

      const trigger = getByRole('link');
      fireEvent.pointerEnter(trigger, { pointerType: 'mouse' });

      await waitFor(() => {
        expect(card('close-on-leave')).toBeInTheDocument();
      });

      fireEvent.pointerLeave(trigger, { pointerType: 'mouse' });

      await waitFor(() => {
        expect(card('close-on-leave')).toBeNull();
      });
    });
  });

  describe('touch', () => {
    /**
     * Preview cards are a pointer/keyboard affordance. Touch has no hover state, so
     * a tap would otherwise reveal a card over the page the user is navigating to.
     */
    it('should not open on a touch pointer entering the trigger', async () => {
      const { getByRole } = await render(template('touch-enter'), {
        imports: [NgpPreviewCardTrigger, NgpPreviewCard],
      });

      fireEvent.pointerEnter(getByRole('link'), { pointerType: 'touch' });
      await settle();

      expect(card('touch-enter')).toBeNull();
    });

    it('should ignore a touch pointer leaving the trigger', async () => {
      const { getByRole } = await render(template('touch-leave'), {
        imports: [NgpPreviewCardTrigger, NgpPreviewCard],
      });

      const trigger = getByRole('link');
      fireEvent.pointerEnter(trigger, { pointerType: 'mouse' });

      await waitFor(() => {
        expect(card('touch-leave')).toBeInTheDocument();
      });

      fireEvent.pointerLeave(trigger, { pointerType: 'touch' });
      await settle();

      expect(card('touch-leave')).toBeInTheDocument();
    });
  });

  describe('teardown', () => {
    it('should remove the preview card when the trigger is destroyed', async () => {
      const { getByRole, fixture } = await render(template('teardown'), {
        imports: [NgpPreviewCardTrigger, NgpPreviewCard],
      });

      fireEvent.pointerEnter(getByRole('link'), { pointerType: 'mouse' });

      await waitFor(() => {
        expect(card('teardown')).toBeInTheDocument();
      });

      fixture.destroy();

      await waitFor(() => {
        expect(card('teardown')).toBeNull();
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
    async function openCard(label: string) {
      const view = await render(
        wrap(`
          <a
            href="/ashley"
            [ngpPreviewCardTrigger]="card"
            ngpPreviewCardTriggerShowDelay="0"
            ngpPreviewCardTriggerHideDelay="0"
            >@ashley</a
          >

          <ng-template #card>
            <div ngpPreviewCard>
              <span>${label}</span>
              <a href="/ashley/repos">Repositories</a>
            </div>
          </ng-template>
        `),
        { imports: [NgpPreviewCardTrigger, NgpPreviewCard] },
      );

      const trigger = view.getByRole('link', { name: '@ashley' });
      fireEvent.pointerEnter(trigger, { pointerType: 'mouse' });

      let element: HTMLElement | undefined;

      await waitFor(() => {
        element = [...document.querySelectorAll<HTMLElement>('[ngpPreviewCard]')].find(el =>
          el.textContent?.includes(label),
        );
        expect(element).toBeInTheDocument();
      });

      return { ...view, trigger, element: element! };
    }

    it('should not assign any role to the preview card', async () => {
      const { element } = await openCard('aria-role');
      expect(element.hasAttribute('role')).toBe(false);
    });

    it('should not link the trigger to the preview card via ARIA', async () => {
      const { trigger } = await openCard('aria-linkage');

      expect(trigger.hasAttribute('aria-describedby')).toBe(false);
      expect(trigger.hasAttribute('aria-controls')).toBe(false);
      expect(trigger.hasAttribute('aria-expanded')).toBe(false);
      expect(trigger.hasAttribute('aria-haspopup')).toBe(false);
    });

    it('should keep the preview card root out of the tab sequence', async () => {
      const { element } = await openCard('aria-tabindex');
      expect(element.getAttribute('tabindex')).toBe('-1');
    });

    it('should leave focusable content inside the card reachable', async () => {
      const { element } = await openCard('aria-focusable-content');
      const link = element.querySelector('a');

      expect(link).toBeInTheDocument();
      expect(link?.hasAttribute('tabindex')).toBe(false);
    });

    it('should expose state as data attributes for styling', async () => {
      const { trigger, element } = await openCard('aria-data-attributes');

      expect(trigger.getAttribute('data-open')).toBe('');
      expect(element.getAttribute('data-overlay')).toBe('');

      await waitFor(() => {
        expect(element.getAttribute('data-placement')).toBeTruthy();
      });
    });

    it('should not set data-open on the trigger while closed', async () => {
      const { getByRole } = await render(template('aria-closed'), {
        imports: [NgpPreviewCardTrigger, NgpPreviewCard],
      });

      expect(getByRole('link').hasAttribute('data-open')).toBe(false);
    });
  });
});
