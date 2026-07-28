import { Component } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import {
  NgpPromptComposer,
  NgpPromptComposerInput,
  NgpThread,
  NgpThreadMessage,
  NgpThreadViewport,
} from 'ng-primitives/ai';
import { describe, expect, it } from 'vitest';

describe('NgpThreadViewport', () => {
  it('should scroll to the bottom when a prompt is submitted', async () => {
    await render(
      `<div ngpThread>
        <div ngpThreadViewport data-testid="viewport" style="height: 100px; overflow-y: auto;">
          <div style="height: 500px;">Tall content</div>
        </div>
        <div ngpPromptComposer>
          <input ngpPromptComposerInput />
        </div>
      </div>`,
      {
        imports: [NgpThread, NgpThreadViewport, NgpPromptComposer, NgpPromptComposerInput],
      },
    );

    const viewport = screen.getByTestId('viewport');
    expect(viewport.scrollTop).toBe(0);

    await userEvent.type(screen.getByRole('textbox'), 'Hello world');
    await userEvent.keyboard('{Enter}');

    await waitFor(() => expect(viewport.scrollTop).toBeGreaterThan(0));
  });

  it('should not scroll when auto scroll is disabled', async () => {
    await render(
      `<div ngpThread>
        <div
          ngpThreadViewport
          ngpThreadViewportAutoScroll="false"
          data-testid="viewport"
          style="height: 100px; overflow-y: auto;"
        >
          <div style="height: 500px;">Tall content</div>
        </div>
        <div ngpPromptComposer>
          <input ngpPromptComposerInput />
        </div>
      </div>`,
      {
        imports: [NgpThread, NgpThreadViewport, NgpPromptComposer, NgpPromptComposerInput],
      },
    );

    const viewport = screen.getByTestId('viewport');

    await userEvent.type(screen.getByRole('textbox'), 'Hello world');
    await userEvent.keyboard('{Enter}');

    // give the scroll a chance to happen before asserting that it did not
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(viewport.scrollTop).toBe(0);
  });

  it('should scroll when the last message streams new content', async () => {
    @Component({
      imports: [NgpThread, NgpThreadViewport, NgpThreadMessage],
      template: `
        <div ngpThread>
          <div ngpThreadViewport data-testid="viewport" style="height: 100px; overflow-y: auto;">
            <div ngpThreadMessage style="height: 300px;">First message</div>
            <div ngpThreadMessage style="height: 300px;">{{ content }}</div>
          </div>
        </div>
      `,
    })
    class TestComponent {
      content = 'Second';
    }

    const { fixture } = await render(TestComponent);

    const viewport = screen.getByTestId('viewport');
    expect(viewport.scrollTop).toBe(0);

    fixture.componentInstance.content = 'Second message, now streaming more content';
    fixture.detectChanges();

    await waitFor(() => expect(viewport.scrollTop).toBeGreaterThan(0));
  });

  describe('threshold', () => {
    /**
     * A viewport 100px tall holding two 300px messages, so the scrollable distance is 500px.
     * Streaming grows the last message to 400px, taking the scrollable distance to 600px.
     */
    @Component({
      imports: [NgpThread, NgpThreadViewport, NgpThreadMessage],
      template: `
        <div ngpThread>
          <div
            [ngpThreadViewportThreshold]="threshold"
            ngpThreadViewport
            data-testid="viewport"
            style="height: 100px; overflow-y: auto;"
          >
            <div ngpThreadMessage style="height: 300px;">First message</div>
            <div [style.height.px]="height" ngpThreadMessage>{{ content }}</div>
          </div>
        </div>
      `,
    })
    class StreamingThread {
      threshold = 70;
      height = 300;
      content = 'Second';
    }

    /** Scroll the viewport and give the scroll listener a chance to run. */
    async function scrollTo(viewport: HTMLElement, top: number): Promise<void> {
      viewport.scrollTop = top;
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    /** Grow the last message, which streams new content into it. */
    function stream(fixture: { componentInstance: StreamingThread; detectChanges(): void }): void {
      fixture.componentInstance.height = 400;
      fixture.componentInstance.content = 'Second message, now streaming more content';
      fixture.detectChanges();
    }

    it('should not scroll when the last message streams and the user has scrolled up', async () => {
      const { fixture } = await render(StreamingThread);
      const viewport = screen.getByTestId('viewport');

      // go to the bottom, then scroll back up to read an earlier message
      await scrollTo(viewport, 500);
      await scrollTo(viewport, 0);

      stream(fixture);

      // give the scroll a chance to happen before asserting that it did not
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(viewport.scrollTop).toBe(0);
    });

    it('should scroll when the last message streams and the user is at the bottom', async () => {
      const { fixture } = await render(StreamingThread);
      const viewport = screen.getByTestId('viewport');

      await scrollTo(viewport, 500);

      stream(fixture);

      await waitFor(() => expect(viewport.scrollTop).toBe(600));
    });

    it('should treat a position within the threshold as being at the bottom', async () => {
      const { fixture } = await render(StreamingThread);
      const viewport = screen.getByTestId('viewport');

      // scroll up off the bottom, but only by 50px — inside the default 70px threshold
      await scrollTo(viewport, 500);
      await scrollTo(viewport, 450);

      stream(fixture);

      await waitFor(() => expect(viewport.scrollTop).toBe(600));
    });

    it('should recompute the at-bottom state when the threshold changes', async () => {
      const { fixture } = await render(StreamingThread);
      const viewport = screen.getByTestId('viewport');

      // 50px off the bottom, inside the initial 70px threshold
      await scrollTo(viewport, 500);
      await scrollTo(viewport, 450);

      // narrow the threshold without scrolling again — the same position is now outside it
      fixture.componentInstance.threshold = 0;
      fixture.detectChanges();
      await new Promise(resolve => setTimeout(resolve, 50));

      stream(fixture);

      // give the scroll a chance to happen before asserting that it did not
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(viewport.scrollTop).toBe(450);
    });

    it('should honour a custom threshold', async () => {
      const { fixture } = await render(StreamingThread, {
        componentProperties: { threshold: 0 },
      });
      const viewport = screen.getByTestId('viewport');

      // the same 50px off the bottom, now outside the configured 0px threshold
      await scrollTo(viewport, 500);
      await scrollTo(viewport, 450);

      stream(fixture);

      // give the scroll a chance to happen before asserting that it did not
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(viewport.scrollTop).toBe(450);
    });
  });
});
