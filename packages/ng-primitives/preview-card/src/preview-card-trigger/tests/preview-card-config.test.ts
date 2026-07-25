import { Component } from '@angular/core';
import { fireEvent, render, waitFor } from '@testing-library/angular';
import {
  NgpPreviewCard,
  NgpPreviewCardTrigger,
  providePreviewCardConfig,
} from 'ng-primitives/preview-card';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { injectPreviewCardConfig } from '../../config/preview-card-config';

@Component({ template: '' })
class PreviewCardConfigProbe {
  readonly config = injectPreviewCardConfig();
}

function card(label: string): HTMLElement | null {
  return (
    [...document.querySelectorAll<HTMLElement>('[ngpPreviewCard]')].find(el =>
      el.textContent?.includes(label),
    ) ?? null
  );
}

/** Fixture offset from the viewport origin, away from the headless cursor. */
function template(label: string, attrs = ''): string {
  return `
    <div style="padding: 200px">
      <a href="/ashley" [ngpPreviewCardTrigger]="card" ${attrs}>@ashley</a>

      <ng-template #card>
        <div ngpPreviewCard>${label}</div>
      </ng-template>
    </div>
  `;
}

describe('NgpPreviewCard configuration', () => {
  afterEach(() => {
    document.querySelectorAll('[ngpPreviewCard]').forEach(el => el.remove());
    vi.useRealTimers();
  });

  describe('defaults', () => {
    it('should merge provided values over the defaults', async () => {
      const { fixture } = await render(PreviewCardConfigProbe, {
        providers: [providePreviewCardConfig({ showDelay: 0 })],
      });

      expect(fixture.componentInstance.config.showDelay).toBe(0);
      // untouched keys still come from the defaults
      expect(fixture.componentInstance.config.hideDelay).toBe(300);
    });
  });

  describe('delay semantics', () => {
    it('should wait out the configured show delay before opening', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });

      const { getByRole } = await render(template('delay-show'), {
        imports: [NgpPreviewCardTrigger, NgpPreviewCard],
        providers: [providePreviewCardConfig({ showDelay: 600, hideDelay: 300 })],
      });

      fireEvent.pointerEnter(getByRole('link'), { pointerType: 'mouse' });

      vi.advanceTimersByTime(500);
      expect(card('delay-show')).toBeNull();

      vi.advanceTimersByTime(200);

      await waitFor(() => {
        expect(card('delay-show')).toBeInTheDocument();
      });
    });

    it('should apply the configured delays from the global config', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });

      const { getByRole } = await render(template('delay-config'), {
        imports: [NgpPreviewCardTrigger, NgpPreviewCard],
        providers: [providePreviewCardConfig({ showDelay: 50, hideDelay: 0 })],
      });

      fireEvent.pointerEnter(getByRole('link'), { pointerType: 'mouse' });

      vi.advanceTimersByTime(100);

      await waitFor(() => {
        expect(card('delay-config')).toBeInTheDocument();
      });
    });

    it('should let an input override the global config', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });

      const { getByRole } = await render(
        template('delay-override', 'ngpPreviewCardTriggerShowDelay="0"'),
        {
          imports: [NgpPreviewCardTrigger, NgpPreviewCard],
          providers: [providePreviewCardConfig({ showDelay: 5000 })],
        },
      );

      fireEvent.pointerEnter(getByRole('link'), { pointerType: 'mouse' });
      vi.advanceTimersByTime(20);

      await waitFor(() => {
        expect(card('delay-override')).toBeInTheDocument();
      });
    });
  });

  describe('cooldown', () => {
    it('should skip the show delay when moving straight to another card', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });

      const { getByTestId } = await render(
        `
          <div style="padding: 200px">
            <a href="/a" data-testid="first" [ngpPreviewCardTrigger]="first">@first</a>
            <a href="/b" data-testid="second" [ngpPreviewCardTrigger]="second">@second</a>

            <ng-template #first>
              <div ngpPreviewCard>cooldown-first</div>
            </ng-template>
            <ng-template #second>
              <div ngpPreviewCard>cooldown-second</div>
            </ng-template>
          </div>
        `,
        {
          imports: [NgpPreviewCardTrigger, NgpPreviewCard],
          providers: [providePreviewCardConfig({ showDelay: 600, hideDelay: 0, cooldown: 300 })],
        },
      );

      const first = getByTestId('first');
      fireEvent.pointerEnter(first, { pointerType: 'mouse' });
      vi.advanceTimersByTime(700);

      await waitFor(() => {
        expect(card('cooldown-first')).toBeInTheDocument();
      });

      fireEvent.pointerLeave(first, { pointerType: 'mouse' });
      fireEvent.pointerEnter(getByTestId('second'), { pointerType: 'mouse' });

      // Well under the 600ms show delay: within the cooldown the second card
      // should appear immediately rather than waiting again.
      vi.advanceTimersByTime(50);

      await waitFor(() => {
        expect(card('cooldown-second')).toBeInTheDocument();
      });
    });
  });
});
