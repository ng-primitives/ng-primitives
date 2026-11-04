import { Directive } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { fireEvent, render, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import {
  injectPreviewCardTriggerState,
  NgpPreviewCard,
  NgpPreviewCardTrigger,
} from 'ng-primitives/preview-card';
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
      href="https://angularprimitives.com"
      [ngpPreviewCardTrigger]="card"
      ngpPreviewCardTriggerShowDelay="0"
      ngpPreviewCardTriggerHideDelay="0"
      ${attrs}
      >Angular Primitives</a
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
    [...document.querySelectorAll<HTMLElement>('[ngpPreviewCard]')].find(el =>
      el.textContent?.includes(label),
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

    it('should not error when the pointer leaves before a card has ever opened', async () => {
      const { getByRole } = await render(template('leave-before-open'), {
        imports: [NgpPreviewCardTrigger, NgpPreviewCard],
      });

      expect(() =>
        fireEvent.pointerLeave(getByRole('link'), { pointerType: 'mouse' }),
      ).not.toThrow();

      await settle();

      expect(card('leave-before-open')).toBeNull();
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

  describe('traversal from trigger to card', () => {
    /**
     * Hoverable content is inherent to a preview card - the whole point is to move
     * into it and read or click through. The pointer must survive the gap between
     * the trigger and the card, which is what the shared hover bridge is for.
     */
    function hoverableTemplate(label: string): string {
      return wrap(`
        <a
          href="https://angularprimitives.com"
          [ngpPreviewCardTrigger]="card"
          ngpPreviewCardTriggerShowDelay="0"
          ngpPreviewCardTriggerHideDelay="80"
          >Angular Primitives</a
        >

        <ng-template #card>
          <div ngpPreviewCard>${label}</div>
        </ng-template>
      `);
    }

    it('should keep the card open when the pointer moves from the trigger into it', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });

      const { getByRole } = await render(hoverableTemplate('traverse-in'), {
        imports: [NgpPreviewCardTrigger, NgpPreviewCard],
      });

      const trigger = getByRole('link', { name: 'Angular Primitives' });
      fireEvent.pointerEnter(trigger, { pointerType: 'mouse' });

      await waitFor(() => {
        expect(card('traverse-in')).toBeInTheDocument();
      });

      fireEvent.pointerLeave(trigger, { pointerType: 'mouse' });
      fireEvent.pointerEnter(card('traverse-in')!, { pointerType: 'mouse' });
      vi.advanceTimersByTime(200);
      // The overlay tears down asynchronously, so flush before asserting that it
      // did *not* tear down - otherwise the element is still present either way.
      await settle();

      expect(card('traverse-in')).toBeInTheDocument();
    });

    it('should close the card when the pointer leaves it', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });

      const { getByRole } = await render(hoverableTemplate('traverse-out'), {
        imports: [NgpPreviewCardTrigger, NgpPreviewCard],
      });

      const trigger = getByRole('link', { name: 'Angular Primitives' });
      fireEvent.pointerEnter(trigger, { pointerType: 'mouse' });

      await waitFor(() => {
        expect(card('traverse-out')).toBeInTheDocument();
      });

      const element = card('traverse-out')!;
      fireEvent.pointerLeave(trigger, { pointerType: 'mouse' });
      fireEvent.pointerEnter(element, { pointerType: 'mouse' });
      vi.advanceTimersByTime(200);
      await settle();

      expect(card('traverse-out')).toBeInTheDocument();

      fireEvent.pointerLeave(element, { pointerType: 'mouse' });
      vi.advanceTimersByTime(200);

      await waitFor(() => {
        expect(card('traverse-out')).toBeNull();
      });
    });
  });

  describe('the hover corridor', () => {
    /**
     * With no hide delay at all, leaving the trigger would close the card instantly
     * were it not for the corridor. These two tests pin the corridor itself: it holds
     * the card open across the gap, and it gives up once the pointer stops making
     * progress toward the card.
     */
    function noDelayTemplate(label: string): string {
      return wrap(`
        <a
          href="https://angularprimitives.com"
          [ngpPreviewCardTrigger]="card"
          ngpPreviewCardTriggerShowDelay="0"
          ngpPreviewCardTriggerHideDelay="0"
          >Angular Primitives</a
        >

        <ng-template #card>
          <div ngpPreviewCard>${label}</div>
        </ng-template>
      `);
    }

    async function openAndLeaveTowardCard(label: string) {
      const { getByRole } = await render(noDelayTemplate(label), {
        imports: [NgpPreviewCardTrigger, NgpPreviewCard],
      });

      const trigger = getByRole('link', { name: 'Angular Primitives' });
      fireEvent.pointerEnter(trigger, { pointerType: 'mouse' });

      await waitFor(() => {
        expect(card(label)).toBeInTheDocument();
      });

      // Leave from the bottom edge, i.e. heading toward the card below.
      const rect = trigger.getBoundingClientRect();
      fireEvent.pointerLeave(trigger, {
        pointerType: 'mouse',
        clientX: rect.left + rect.width / 2,
        clientY: rect.bottom,
      });
    }

    it('should hold the card open while the pointer crosses the gap', async () => {
      await openAndLeaveTowardCard('corridor-hold');

      // Flush the overlay's asynchronous teardown, but stay under the corridor's
      // idle timeout. With no hide delay, a card that closed on pointer leave would
      // be gone by now; one held by the corridor is still here.
      await settle();

      expect(card('corridor-hold')).toBeInTheDocument();
    });

    it('should close once the pointer stops progressing toward the card', async () => {
      await openAndLeaveTowardCard('corridor-idle');

      await waitFor(() => {
        expect(card('corridor-idle')).toBeNull();
      });
    });

    it('should close immediately when a corridor cannot be built', async () => {
      const { getByRole } = await render(noDelayTemplate('corridor-unbuildable'), {
        imports: [NgpPreviewCardTrigger, NgpPreviewCard],
      });

      const trigger = getByRole('link', { name: 'Angular Primitives' });
      fireEvent.pointerEnter(trigger, { pointerType: 'mouse' });

      await waitFor(() => {
        expect(card('corridor-unbuildable')).toBeInTheDocument();
      });

      // A rect-less card (e.g. one torn out of the layout mid-transition) leaves
      // the polygon builder nothing to work with, so the fallback must close
      // rather than strand the card open.
      vi.spyOn(card('corridor-unbuildable')!, 'getBoundingClientRect').mockReturnValue(
        null as unknown as DOMRect,
      );

      fireEvent.pointerLeave(trigger, { pointerType: 'mouse' });

      await waitFor(() => {
        expect(card('corridor-unbuildable')).toBeNull();
      });
    });
  });

  describe('focus', () => {
    /**
     * Focus is how a sighted keyboard user reaches a preview card - without it they
     * get nothing at all. Only *keyboard* focus opens it though: a tap on a touch
     * device focuses the link too, and opening there would cover the page the user
     * is navigating to.
     */
    function focusTemplate(label: string): string {
      return wrap(`
        <button type="button" data-testid="before">before</button>

        <a
          href="https://angularprimitives.com"
          [ngpPreviewCardTrigger]="card"
          ngpPreviewCardTriggerShowDelay="0"
          ngpPreviewCardTriggerHideDelay="0"
          >Angular Primitives</a
        >

        <button type="button" data-testid="after">after</button>

        <ng-template #card>
          <div ngpPreviewCard>
            <span>${label}</span>
            <button type="button" data-testid="inside">inside</button>
          </div>
        </ng-template>
      `);
    }

    it('should open when the trigger receives keyboard focus', async () => {
      const { getByTestId } = await render(focusTemplate('focus-keyboard'), {
        imports: [NgpPreviewCardTrigger, NgpPreviewCard],
      });

      getByTestId('before').focus();
      await userEvent.keyboard('{Tab}');

      await waitFor(() => {
        expect(card('focus-keyboard')).toBeInTheDocument();
      });
    });

    it('should not open when the trigger is focused by a pointer', async () => {
      const { getByRole } = await render(focusTemplate('focus-mouse'), {
        imports: [NgpPreviewCardTrigger, NgpPreviewCard],
      });

      const trigger = getByRole('link', { name: 'Angular Primitives' });
      const rect = trigger.getBoundingClientRect();

      // FocusMonitor derives the origin from the preceding interaction. The event needs
      // real button/coordinate values: CDK's InputModalityDetector discards a mousedown
      // with `buttons: 0` at the origin as a screen-reader artefact, which would leave
      // the modality as whatever came before.
      fireEvent.mouseDown(trigger, {
        buttons: 1,
        detail: 1,
        clientX: rect.left + 1,
        clientY: rect.top + 1,
      });
      trigger.focus();
      await settle();

      expect(card('focus-mouse')).toBeNull();
    });

    it('should close when focus leaves the trigger entirely', async () => {
      const { getByTestId } = await render(focusTemplate('focus-blur'), {
        imports: [NgpPreviewCardTrigger, NgpPreviewCard],
      });

      getByTestId('before').focus();
      await userEvent.keyboard('{Tab}');

      await waitFor(() => {
        expect(card('focus-blur')).toBeInTheDocument();
      });

      getByTestId('before').focus();

      await waitFor(() => {
        expect(card('focus-blur')).toBeNull();
      });
    });

    it('should not error when focus leaves before a card has ever opened', async () => {
      const { getByRole } = await render(focusTemplate('focus-before-open'), {
        imports: [NgpPreviewCardTrigger, NgpPreviewCard],
      });

      expect(() =>
        fireEvent.focusOut(getByRole('link'), { relatedTarget: document.body }),
      ).not.toThrow();

      await settle();

      expect(card('focus-before-open')).toBeNull();
    });

    it('should stay open when focus moves to a node inside the trigger itself', async () => {
      const { getByTestId, getByRole } = await render(
        wrap(`
          <button type="button" data-testid="before">before</button>

          <a
            href="https://angularprimitives.com"
            [ngpPreviewCardTrigger]="card"
            ngpPreviewCardTriggerShowDelay="0"
            ngpPreviewCardTriggerHideDelay="0"
            >Angular Primitives <span data-testid="trigger-child">icon</span></a
          >

          <ng-template #card>
            <div ngpPreviewCard>focus-inside-trigger</div>
          </ng-template>
        `),
        { imports: [NgpPreviewCardTrigger, NgpPreviewCard] },
      );

      getByTestId('before').focus();
      await userEvent.keyboard('{Tab}');

      await waitFor(() => {
        expect(card('focus-inside-trigger')).toBeInTheDocument();
      });

      // Focus moving to a nested node inside the trigger itself (e.g. an icon)
      // is not focus leaving the trigger - the card must stay open.
      fireEvent.focusOut(getByRole('link'), { relatedTarget: getByTestId('trigger-child') });
      await settle();

      expect(card('focus-inside-trigger')).toBeInTheDocument();
    });

    it('should stay open when focus moves from the trigger into the card', async () => {
      const { getByTestId } = await render(focusTemplate('focus-into-card'), {
        imports: [NgpPreviewCardTrigger, NgpPreviewCard],
      });

      getByTestId('before').focus();
      await userEvent.keyboard('{Tab}');

      await waitFor(() => {
        expect(card('focus-into-card')).toBeInTheDocument();
      });

      const inside = card('focus-into-card')!.querySelector<HTMLElement>('[data-testid="inside"]')!;
      inside.focus();
      await settle();

      expect(card('focus-into-card')).toBeInTheDocument();
      expect(document.activeElement).toBe(inside);
    });

    it('should close when focus leaves the card', async () => {
      const { getByTestId } = await render(focusTemplate('focus-out-of-card'), {
        imports: [NgpPreviewCardTrigger, NgpPreviewCard],
      });

      getByTestId('before').focus();
      await userEvent.keyboard('{Tab}');

      await waitFor(() => {
        expect(card('focus-out-of-card')).toBeInTheDocument();
      });

      card('focus-out-of-card')!.querySelector<HTMLElement>('[data-testid="inside"]')!.focus();
      await settle();

      getByTestId('after').focus();

      await waitFor(() => {
        expect(card('focus-out-of-card')).toBeNull();
      });
    });
  });

  describe('tab order', () => {
    const afterButton = '<button type="button" data-testid="after">after</button>';

    /**
     * The card is portalled to the end of the body, so the trigger handles Tab to put it in
     * the tab sequence right after the trigger.
     */
    function tabTemplate(label: string, content: string, after = afterButton): string {
      return wrap(`
        <button type="button" data-testid="before">before</button>

        <a
          href="https://angularprimitives.com"
          data-testid="trigger"
          [ngpPreviewCardTrigger]="card"
          ngpPreviewCardTriggerShowDelay="0"
          ngpPreviewCardTriggerHideDelay="0"
          >Angular Primitives</a
        >

        ${after}

        <ng-template #card>
          <div ngpPreviewCard>
            <span>${label}</span>
            ${content}
          </div>
        </ng-template>
      `);
    }

    const twoLinks = `
      <a href="#" data-testid="first">first</a>
      <a href="#" data-testid="last">last</a>
    `;

    async function openWithKeyboard(label: string, content = twoLinks, after = afterButton) {
      const result = await render(tabTemplate(label, content, after), {
        imports: [NgpPreviewCardTrigger, NgpPreviewCard],
      });

      result.getByTestId('before').focus();
      await userEvent.tab();

      await waitFor(() => {
        expect(card(label)).toBeInTheDocument();
      });
      expect(result.getByTestId('trigger')).toHaveFocus();

      return result;
    }

    function inCard(label: string, testId: string): HTMLElement {
      return card(label)!.querySelector<HTMLElement>(`[data-testid="${testId}"]`)!;
    }

    it('should move focus from the trigger to the first tabbable element in the card', async () => {
      await openWithKeyboard('tab-into-card');

      await userEvent.tab();

      expect(inCard('tab-into-card', 'first')).toHaveFocus();
      await settle();
      expect(card('tab-into-card')).toBeInTheDocument();
    });

    it('should tab through the card in order', async () => {
      await openWithKeyboard('tab-through-card');

      await userEvent.tab();
      await userEvent.tab();

      expect(inCard('tab-through-card', 'last')).toHaveFocus();
    });

    it('should move focus from the last element in the card to the element after the trigger', async () => {
      const { getByTestId } = await openWithKeyboard('tab-out-of-card');

      inCard('tab-out-of-card', 'last').focus();
      await userEvent.tab();

      expect(getByTestId('after')).toHaveFocus();
      await waitFor(() => {
        expect(card('tab-out-of-card')).toBeNull();
      });
    });

    it('should skip elements that are not tabbable when tabbing out of the card', async () => {
      const { getByTestId } = await openWithKeyboard(
        'tab-out-past-untabbable',
        twoLinks,
        `
          <p>Some text</p>
          <button type="button" disabled>disabled</button>
          <div><button type="button" data-testid="after">after</button></div>
        `,
      );

      inCard('tab-out-past-untabbable', 'last').focus();
      await userEvent.tab();

      expect(getByTestId('after')).toHaveFocus();
    });

    it('should not move focus back into the card when nothing tabbable follows the trigger', async () => {
      await openWithKeyboard('tab-out-nothing-after', twoLinks, '');

      const first = inCard('tab-out-nothing-after', 'first');

      inCard('tab-out-nothing-after', 'last').focus();
      await userEvent.tab();

      expect(first).not.toHaveFocus();
      await waitFor(() => {
        expect(card('tab-out-nothing-after')).toBeNull();
      });
    });

    it('should return focus to the trigger on Shift+Tab from the first element in the card', async () => {
      const { getByTestId } = await openWithKeyboard('shift-tab-to-trigger');

      inCard('shift-tab-to-trigger', 'first').focus();
      await userEvent.tab({ shift: true });

      expect(getByTestId('trigger')).toHaveFocus();
      await settle();
      expect(card('shift-tab-to-trigger')).toBeInTheDocument();
    });

    it('should move focus to the element before the trigger on Shift+Tab from the trigger', async () => {
      const { getByTestId } = await openWithKeyboard('shift-tab-from-trigger');

      await userEvent.tab({ shift: true });

      expect(getByTestId('before')).toHaveFocus();
      await waitFor(() => {
        expect(card('shift-tab-from-trigger')).toBeNull();
      });
    });

    it('should leave Tab to the browser when the card has nothing tabbable', async () => {
      const { getByTestId } = await openWithKeyboard('tab-empty-card', '');

      await userEvent.tab();

      expect(getByTestId('after')).toHaveFocus();
      await waitFor(() => {
        expect(card('tab-empty-card')).toBeNull();
      });
    });

    it('should leave Tab to the browser while the card is closed', async () => {
      const { getByTestId } = await render(
        tabTemplate('tab-closed-card', twoLinks).replace(
          'ngpPreviewCardTriggerShowDelay="0"',
          'ngpPreviewCardTriggerShowDelay="10000"',
        ),
        { imports: [NgpPreviewCardTrigger, NgpPreviewCard] },
      );

      getByTestId('before').focus();
      await userEvent.tab();
      await userEvent.tab();

      expect(getByTestId('after')).toHaveFocus();
      expect(card('tab-closed-card')).toBeNull();
    });

    it('should leave Tab to the browser from a control nested in the trigger', async () => {
      const { getByTestId } = await render(
        wrap(`
          <div
            tabindex="0"
            data-testid="trigger"
            [ngpPreviewCardTrigger]="card"
            ngpPreviewCardTriggerShowDelay="0"
            ngpPreviewCardTriggerHideDelay="0"
          >
            <button type="button" data-testid="nested-first">nested first</button>
            <button type="button" data-testid="nested-last">nested last</button>
          </div>

          <ng-template #card>
            <div ngpPreviewCard>
              <span>tab-nested-in-trigger</span>
              ${twoLinks}
            </div>
          </ng-template>
        `),
        { imports: [NgpPreviewCardTrigger, NgpPreviewCard] },
      );

      fireEvent.pointerEnter(getByTestId('trigger'), { pointerType: 'mouse' });

      await waitFor(() => {
        expect(card('tab-nested-in-trigger')).toBeInTheDocument();
      });

      getByTestId('nested-first').focus();
      await userEvent.tab();

      expect(getByTestId('nested-last')).toHaveFocus();
    });

    it('should return focus to the trigger without reopening when Escape closes the card from inside', async () => {
      const { getByTestId } = await openWithKeyboard('escape-from-card');

      await userEvent.tab();
      expect(inCard('escape-from-card', 'first')).toHaveFocus();

      await userEvent.keyboard('{Escape}');

      await waitFor(() => {
        expect(card('escape-from-card')).toBeNull();
      });
      expect(getByTestId('trigger')).toHaveFocus();

      await settle();
      expect(card('escape-from-card')).toBeNull();
    });

    it('should not move focus to the trigger when Escape closes a card focus is not in', async () => {
      const { getByTestId } = await render(tabTemplate('escape-focus-outside', twoLinks), {
        imports: [NgpPreviewCardTrigger, NgpPreviewCard],
      });

      getByTestId('after').focus();
      fireEvent.pointerEnter(getByTestId('trigger'), { pointerType: 'mouse' });

      await waitFor(() => {
        expect(card('escape-focus-outside')).toBeInTheDocument();
      });

      await userEvent.keyboard('{Escape}');

      await waitFor(() => {
        expect(card('escape-focus-outside')).toBeNull();
      });
      expect(getByTestId('after')).toHaveFocus();
    });
  });

  describe('dismissal', () => {
    it('should close when Escape is pressed', async () => {
      const { getByRole } = await render(template('dismiss-escape'), {
        imports: [NgpPreviewCardTrigger, NgpPreviewCard],
      });

      fireEvent.pointerEnter(getByRole('link'), { pointerType: 'mouse' });

      await waitFor(() => {
        expect(card('dismiss-escape')).toBeInTheDocument();
      });

      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(card('dismiss-escape')).toBeNull();
      });
    });

    it('should close when clicking outside the card', async () => {
      const { getByRole } = await render(template('dismiss-outside'), {
        imports: [NgpPreviewCardTrigger, NgpPreviewCard],
      });

      fireEvent.pointerEnter(getByRole('link'), { pointerType: 'mouse' });

      await waitFor(() => {
        expect(card('dismiss-outside')).toBeInTheDocument();
      });

      // The overlay registry dismisses on mouseup, not click - the click listener
      // only feeds CDK-compatible outside-pointer notifications.
      fireEvent.pointerDown(document.body);
      fireEvent.mouseUp(document.body);

      await waitFor(() => {
        expect(card('dismiss-outside')).toBeNull();
      });
    });
  });

  describe('disabled', () => {
    it('should not open on pointer enter while disabled', async () => {
      const { getByRole } = await render(
        template('disabled-pointer', 'ngpPreviewCardTriggerDisabled="true"'),
        { imports: [NgpPreviewCardTrigger, NgpPreviewCard] },
      );

      fireEvent.pointerEnter(getByRole('link'), { pointerType: 'mouse' });
      await settle();

      expect(card('disabled-pointer')).toBeNull();
    });

    it('should mark the trigger as disabled for styling', async () => {
      const { getByRole } = await render(
        template('disabled-attribute', 'ngpPreviewCardTriggerDisabled="true"'),
        { imports: [NgpPreviewCardTrigger, NgpPreviewCard] },
      );

      expect(getByRole('link').getAttribute('data-disabled')).toBe('');
    });
  });

  describe('missing content', () => {
    it('should log an error and stay closed when no preview card content is provided', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { getByRole } = await render(
        wrap(
          `<a href="https://angularprimitives.com" ngpPreviewCardTrigger ngpPreviewCardTriggerShowDelay="0">Angular Primitives</a>`,
        ),
        { imports: [NgpPreviewCardTrigger, NgpPreviewCard] },
      );

      fireEvent.pointerEnter(getByRole('link'), { pointerType: 'mouse' });
      await settle();

      expect(consoleSpy).toHaveBeenCalledWith(
        '[ngpPreviewCardTrigger]: Preview card must be a TemplateRef or a ComponentType.',
      );
      expect(document.querySelector('[ngpPreviewCard]')).toBeNull();

      consoleSpy.mockRestore();
    });
  });

  describe('container', () => {
    @Directive({ selector: '[capturePreviewCardTriggerState]' })
    class CapturePreviewCardTriggerState {
      readonly state = injectPreviewCardTriggerState();
    }

    it('should attach the preview card to the element passed to setContainer', async () => {
      const host = document.createElement('div');
      host.id = 'preview-card-host';
      document.body.appendChild(host);

      const { fixture, getByRole } = await render(
        wrap(`
          <a
            href="https://angularprimitives.com"
            [ngpPreviewCardTrigger]="card"
            ngpPreviewCardTriggerShowDelay="0"
            ngpPreviewCardTriggerHideDelay="0"
            capturePreviewCardTriggerState
            >Angular Primitives</a
          >

          <ng-template #card>
            <div ngpPreviewCard>container-setter</div>
          </ng-template>
        `),
        {
          imports: [NgpPreviewCardTrigger, NgpPreviewCard, CapturePreviewCardTriggerState],
        },
      );

      const captured = fixture.debugElement
        .query(By.directive(CapturePreviewCardTriggerState))
        .injector.get(CapturePreviewCardTriggerState);

      captured.state().setContainer(host);

      fireEvent.pointerEnter(getByRole('link'), { pointerType: 'mouse' });

      await waitFor(() => {
        expect(host.querySelector('[ngpPreviewCard]')).toBeInTheDocument();
      });

      host.remove();
    });
  });

  describe('card pointer handling', () => {
    @Directive({ selector: '[capturePreviewCardTriggerState2]' })
    class CapturePreviewCardTriggerState2 {
      readonly state = injectPreviewCardTriggerState();
    }

    it('should ignore touch pointers entering and leaving the card', async () => {
      const { fixture, getByRole } = await render(
        wrap(`
          <a
            href="https://angularprimitives.com"
            [ngpPreviewCardTrigger]="card"
            ngpPreviewCardTriggerShowDelay="0"
            ngpPreviewCardTriggerHideDelay="0"
            capturePreviewCardTriggerState2
            >Angular Primitives</a
          >

          <ng-template #card>
            <div ngpPreviewCard>touch-on-card</div>
          </ng-template>
        `),
        {
          imports: [NgpPreviewCardTrigger, NgpPreviewCard, CapturePreviewCardTriggerState2],
        },
      );

      fireEvent.pointerEnter(getByRole('link'), { pointerType: 'mouse' });

      await waitFor(() => {
        expect(card('touch-on-card')).toBeInTheDocument();
      });

      const captured = fixture.debugElement
        .query(By.directive(CapturePreviewCardTriggerState2))
        .injector.get(CapturePreviewCardTriggerState2);
      const setPointerOverCard = vi.spyOn(captured.state(), 'setPointerOverCard');

      const cardElement = card('touch-on-card')!;
      fireEvent.pointerEnter(cardElement, { pointerType: 'touch' });
      fireEvent.pointerLeave(cardElement, { pointerType: 'touch' });

      expect(setPointerOverCard).not.toHaveBeenCalled();

      fireEvent.pointerEnter(cardElement, { pointerType: 'mouse' });

      expect(setPointerOverCard).toHaveBeenCalledWith(true);
    });
  });

  describe('imperative api and open change', () => {
    function triggerInstance(fixture: ComponentFixture<unknown>): NgpPreviewCardTrigger<unknown> {
      return fixture.debugElement
        .query(By.directive(NgpPreviewCardTrigger))
        .injector.get(NgpPreviewCardTrigger);
    }

    it('should open and close via show() and hide()', async () => {
      const { fixture } = await render(template('imperative'), {
        imports: [NgpPreviewCardTrigger, NgpPreviewCard],
      });

      triggerInstance(fixture).show();

      await waitFor(() => {
        expect(card('imperative')).toBeInTheDocument();
      });

      triggerInstance(fixture).hide();

      await waitFor(() => {
        expect(card('imperative')).toBeNull();
      });
    });

    it('should emit the open state as it changes', async () => {
      const openChange = vi.fn();

      const { getByRole } = await render(
        template('open-change', '(ngpPreviewCardTriggerOpenChange)="onOpenChange($event)"'),
        {
          imports: [NgpPreviewCardTrigger, NgpPreviewCard],
          componentProperties: { onOpenChange: openChange },
        },
      );

      const trigger = getByRole('link');
      fireEvent.pointerEnter(trigger, { pointerType: 'mouse' });

      await waitFor(() => {
        expect(card('open-change')).toBeInTheDocument();
      });

      expect(openChange).toHaveBeenCalledWith(true);

      fireEvent.pointerLeave(trigger, { pointerType: 'mouse' });

      await waitFor(() => {
        expect(openChange).toHaveBeenCalledWith(false);
      });
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
            href="https://angularprimitives.com"
            [ngpPreviewCardTrigger]="card"
            ngpPreviewCardTriggerShowDelay="0"
            ngpPreviewCardTriggerHideDelay="0"
            >Angular Primitives</a
          >

          <ng-template #card>
            <div ngpPreviewCard>
              <span>${label}</span>
              <a href="https://angularprimitives.com/primitives">Repositories</a>
            </div>
          </ng-template>
        `),
        { imports: [NgpPreviewCardTrigger, NgpPreviewCard] },
      );

      const trigger = view.getByRole('link', { name: 'Angular Primitives' });
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
