import { Component, Directive, input } from '@angular/core';
import { fireEvent, render, waitFor } from '@testing-library/angular';
import {
  injectPreviewCardContext,
  injectPreviewCardTriggerState,
  NgpPreviewCard,
  NgpPreviewCardTrigger,
} from 'ng-primitives/preview-card';
import { afterEach, describe, expect, it } from 'vitest';

@Component({
  selector: 'app-preview-card',
  hostDirectives: [NgpPreviewCard],
  template: `
    {{ content() }}
  `,
})
class PreviewCard {
  readonly content = injectPreviewCardContext<string>();
}

/**
 * A reusable component wires its own card component into the trigger. It does so
 * through the state's dedicated setter rather than by mutating a signal the state
 * returned, so the state can keep the signal readonly.
 */
@Directive({
  selector: '[appPreviewCardTrigger]',
  hostDirectives: [
    {
      directive: NgpPreviewCardTrigger,
      inputs: [
        'ngpPreviewCardTriggerShowDelay:appPreviewCardTriggerShowDelay',
        'ngpPreviewCardTriggerContext:appPreviewCardTrigger',
      ],
    },
  ],
})
class PreviewCardTrigger {
  private readonly previewCardTrigger = injectPreviewCardTriggerState<string>();

  readonly content = input.required<string>({ alias: 'appPreviewCardTrigger' });

  constructor() {
    this.previewCardTrigger().setPreviewCard(PreviewCard);
  }
}

describe('NgpPreviewCard (reusable component)', () => {
  afterEach(() => {
    // Overlay content attaches to the document body, not the fixture.
    document.querySelectorAll('app-preview-card').forEach(el => el.remove());
  });

  it('should render a component set through setPreviewCard', async () => {
    const { getByRole } = await render(
      `<div style="padding: 200px">
        <a href="/x" appPreviewCardTrigger="Card content" appPreviewCardTriggerShowDelay="0">
          trigger
        </a>
      </div>`,
      { imports: [PreviewCardTrigger] },
    );

    expect(document.querySelector('app-preview-card')).not.toBeInTheDocument();

    fireEvent.pointerEnter(getByRole('link'), { pointerType: 'mouse' });

    await waitFor(() => {
      expect(document.querySelector('app-preview-card')).toBeInTheDocument();
    });

    expect(document.querySelector('app-preview-card')?.textContent).toContain('Card content');
  });

  it('should not expose the card content as a writable signal', async () => {
    let state: ReturnType<typeof injectPreviewCardTriggerState<string>> | undefined;

    @Directive({
      selector: '[appProbe]',
      hostDirectives: [NgpPreviewCardTrigger],
    })
    class Probe {
      constructor() {
        state = injectPreviewCardTriggerState<string>();
      }
    }

    await render(`<a href="/x" appProbe>trigger</a>`, { imports: [Probe] });

    const previewCard = state!().previewCard as unknown as Record<string, unknown>;

    expect(typeof state!().setPreviewCard).toBe('function');
    expect(previewCard['set']).toBeUndefined();
    expect(previewCard['update']).toBeUndefined();
  });
});
