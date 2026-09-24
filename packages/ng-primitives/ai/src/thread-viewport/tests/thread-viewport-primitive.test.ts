import { Component, viewChild } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import {
  NgpPromptComposer,
  NgpPromptComposerInput,
  NgpThread,
  NgpThreadMessage,
  NgpThreadViewport,
} from 'ng-primitives/ai';
import { describe, expect, it, vi } from 'vitest';

describe('NgpThreadViewport', () => {
  it('should initially scroll populated content to the bottom by default', async () => {
    await render(
      `<div ngpThread>
        <div ngpThreadViewport data-testid="viewport" style="height: 100px; overflow-y: auto;">
          <div style="height: 500px;">Tall content</div>
        </div>
      </div>`,
      { imports: [NgpThread, NgpThreadViewport] },
    );

    const viewport = screen.getByTestId('viewport');

    await waitFor(() =>
      expect(viewport.scrollTop).toBe(viewport.scrollHeight - viewport.clientHeight),
    );
  });

  it('should initially leave populated content at the start when configured', async () => {
    await render(
      `<div ngpThread>
        <div
          ngpThreadViewport
          ngpThreadViewportInitialScrollPosition="start"
          data-testid="viewport"
          style="height: 100px; overflow-y: auto;"
        >
          <div style="height: 500px;">Tall content</div>
        </div>
      </div>`,
      { imports: [NgpThread, NgpThreadViewport] },
    );

    const viewport = screen.getByTestId('viewport');

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(viewport.scrollTop).toBe(0);
  });

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

    await waitFor(() =>
      expect(viewport.scrollTop).toBe(viewport.scrollHeight - viewport.clientHeight),
    );

    const scrollTo = vi.spyOn(viewport, 'scrollTo');

    await userEvent.type(screen.getByRole('textbox'), 'Hello world');
    await userEvent.keyboard('{Enter}');

    await waitFor(() =>
      expect(viewport.scrollTop).toBe(viewport.scrollHeight - viewport.clientHeight),
    );

    expect(scrollTo).toHaveBeenLastCalledWith({
      top: viewport.scrollHeight,
      behavior: 'smooth',
    });
  });

  it('should not scroll when auto scroll is disabled', async () => {
    await render(
      `<div ngpThread>
        <div
          ngpThreadViewport
          ngpThreadViewportInitialScrollPosition="start"
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

  it('should coalesce streamed content into one immediate scroll per animation frame', async () => {
    @Component({
      imports: [NgpThread, NgpThreadViewport, NgpThreadMessage],
      template: `
        <div ngpThread>
          <div ngpThreadViewport data-testid="viewport" style="height: 100px; overflow-y: auto;">
            <div ngpThreadMessage style="height: 300px;">First message</div>
            <div [style.height.px]="height" ngpThreadMessage>{{ content }}</div>
          </div>
        </div>
      `,
    })
    class TestComponent {
      height = 300;
      content = 'Second';
    }

    const { fixture } = await render(TestComponent);

    const viewport = screen.getByTestId('viewport');

    await waitFor(() =>
      expect(viewport.scrollTop).toBe(viewport.scrollHeight - viewport.clientHeight),
    );

    await new Promise(resolve => setTimeout(resolve, 100));

    const scrollTo = vi.spyOn(viewport, 'scrollTo');
    const frameCallbacks: FrameRequestCallback[] = [];
    const requestAnimationFrame = vi
      .spyOn(globalThis, 'requestAnimationFrame')
      .mockImplementation(callback => {
        frameCallbacks.push(callback);
        return frameCallbacks.length;
      });

    try {
      const messages = fixture.nativeElement.querySelectorAll<HTMLElement>('[ngpThreadMessage]');
      const lastMessage = messages[messages.length - 1];

      lastMessage.append(' now streaming more content');
      await Promise.resolve();

      lastMessage.append(' still streaming more content');
      await Promise.resolve();

      expect(requestAnimationFrame).toHaveBeenCalledOnce();

      for (const frameCallback of frameCallbacks) {
        frameCallback(0);
      }

      expect(scrollTo).toHaveBeenCalledOnce();
      expect(scrollTo).toHaveBeenCalledWith({
        top: viewport.scrollHeight,
        behavior: 'instant',
      });
    } finally {
      requestAnimationFrame.mockRestore();
    }
  });

  it('should not follow streamed content after initially opening at the start', async () => {
    @Component({
      imports: [NgpThread, NgpThreadViewport, NgpThreadMessage],
      template: `
        <div ngpThread>
          <div
            ngpThreadViewport
            ngpThreadViewportInitialScrollPosition="start"
            data-testid="viewport"
            style="height: 100px; overflow-y: auto;"
          >
            <div ngpThreadMessage style="height: 300px;">First message</div>
            <div [style.height.px]="height" ngpThreadMessage>{{ content }}</div>
          </div>
        </div>
      `,
    })
    class TestComponent {
      height = 300;
      content = 'Second';
    }

    const { fixture } = await render(TestComponent);
    const viewport = screen.getByTestId('viewport');

    await new Promise(resolve => setTimeout(resolve, 100));

    fixture.componentInstance.height = 400;
    fixture.componentInstance.content = 'Second message, now streaming more content';
    fixture.detectChanges();

    await new Promise(resolve => setTimeout(resolve, 150));

    expect(viewport.scrollTop).toBe(0);
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

  describe('complete messages', () => {
    @Component({
      imports: [NgpThread, NgpThreadViewport, NgpThreadMessage],
      template: `
        <div ngpThread>
          <div ngpThreadViewport data-testid="viewport" style="height: 100px; overflow-y: auto;">
            @for (message of messages; track message.id) {
              <div [style.height.px]="message.height" ngpThreadMessage>Message</div>
            }
          </div>
        </div>
      `,
    })
    class CompleteMessagesThread {
      messages = [
        { id: 1, height: 300 },
        { id: 2, height: 300 },
      ];
    }

    it('should scroll when a complete message is appended at the bottom', async () => {
      const { fixture } = await render(CompleteMessagesThread);
      const viewport = screen.getByTestId('viewport');

      await waitFor(() => expect(viewport.scrollTop).toBe(500));

      fixture.componentInstance.messages = [
        ...fixture.componentInstance.messages,
        { id: 3, height: 300 },
      ];
      fixture.detectChanges();

      await waitFor(() => expect(viewport.scrollTop).toBe(800));
    });

    it('should not scroll when a complete message is appended after the user scrolls beyond the threshold', async () => {
      const { fixture } = await render(CompleteMessagesThread);
      const viewport = screen.getByTestId('viewport');

      await waitFor(() => expect(viewport.scrollTop).toBe(500));

      viewport.scrollTop = 400;
      await new Promise(resolve => setTimeout(resolve, 50));

      fixture.componentInstance.messages = [
        ...fixture.componentInstance.messages,
        { id: 3, height: 300 },
      ];
      fixture.detectChanges();

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(viewport.scrollTop).toBe(400);
    });

    it('should preserve the visible message position when a complete message is prepended', async () => {
      const { fixture } = await render(CompleteMessagesThread);
      const viewport = screen.getByTestId('viewport');

      await waitFor(() => expect(viewport.scrollTop).toBe(500));

      viewport.scrollTop = 300;
      await new Promise(resolve => setTimeout(resolve, 50));

      const message = viewport.children[1] as HTMLElement;
      const relativeTop =
        message.getBoundingClientRect().top - viewport.getBoundingClientRect().top;
      const scrollTo = vi.spyOn(viewport, 'scrollTo');

      fixture.componentInstance.messages = [
        { id: 0, height: 300 },
        ...fixture.componentInstance.messages,
      ];
      fixture.detectChanges();

      await waitFor(() =>
        expect(message.getBoundingClientRect().top - viewport.getBoundingClientRect().top).toBe(
          relativeTop,
        ),
      );

      expect(scrollTo).not.toHaveBeenCalledWith({
        top: viewport.scrollHeight,
        behavior: 'instant',
      });
    });

    it('should scroll when complete messages are prepended and appended at the bottom', async () => {
      const { fixture } = await render(CompleteMessagesThread);
      const viewport = screen.getByTestId('viewport');

      await waitFor(() => expect(viewport.scrollTop).toBe(500));

      fixture.componentInstance.messages = [
        { id: 0, height: 300 },
        ...fixture.componentInstance.messages,
        { id: 3, height: 300 },
      ];
      fixture.detectChanges();

      await waitFor(() => expect(viewport.scrollTop).toBe(1100));
    });

    it('should preserve visible reading position when messages are prepended and appended while scrolled up', async () => {
      const { fixture } = await render(CompleteMessagesThread);
      const viewport = screen.getByTestId('viewport');

      await waitFor(() => expect(viewport.scrollTop).toBe(500));

      viewport.scrollTop = 300;
      viewport.dispatchEvent(new Event('scroll'));
      await new Promise(resolve => setTimeout(resolve, 50));

      const message = viewport.children[1] as HTMLElement;
      const relativeTop =
        message.getBoundingClientRect().top - viewport.getBoundingClientRect().top;

      fixture.componentInstance.messages = [
        { id: 0, height: 300 },
        ...fixture.componentInstance.messages,
        { id: 3, height: 300 },
      ];
      fixture.detectChanges();

      await waitFor(() =>
        expect(message.getBoundingClientRect().top - viewport.getBoundingClientRect().top).toBe(
          relativeTop,
        ),
      );

      expect(viewport.scrollTop).toBe(600);
    });
  });

  describe('isAtBottom', () => {
    it('should reflect isAtBottom signal and data-at-bottom attribute when at the bottom and when scrolled up', async () => {
      @Component({
        imports: [NgpThread, NgpThreadViewport],
        template: `
          <div ngpThread>
            <div
              #viewport="ngpThreadViewport"
              ngpThreadViewport
              data-testid="viewport"
              style="height: 100px; overflow-y: auto;"
            >
              <div style="height: 500px;">Tall content</div>
            </div>
          </div>
        `,
      })
      class TestComponent {
        readonly viewport = viewChild.required<NgpThreadViewport>('viewport');
      }

      const { fixture } = await render(TestComponent);
      const viewportElement = screen.getByTestId('viewport');
      const viewportDirective = fixture.componentInstance.viewport();

      await waitFor(() => expect(viewportElement.scrollTop).toBe(400));
      expect(viewportDirective.isAtBottom()).toBe(true);
      expect(viewportElement.hasAttribute('data-at-bottom')).toBe(true);

      viewportElement.scrollTop = 100;
      viewportElement.dispatchEvent(new Event('scroll'));
      await waitFor(() => expect(viewportDirective.isAtBottom()).toBe(false));
      expect(viewportElement.hasAttribute('data-at-bottom')).toBe(false);

      viewportElement.scrollTop = 400;
      viewportElement.dispatchEvent(new Event('scroll'));
      await waitFor(() => expect(viewportDirective.isAtBottom()).toBe(true));
      expect(viewportElement.hasAttribute('data-at-bottom')).toBe(true);
    });

    it('should initially be false and omit data-at-bottom when initialScrollPosition is start', async () => {
      @Component({
        imports: [NgpThread, NgpThreadViewport],
        template: `
          <div ngpThread>
            <div
              #viewport="ngpThreadViewport"
              ngpThreadViewport
              ngpThreadViewportInitialScrollPosition="start"
              data-testid="viewport"
              style="height: 100px; overflow-y: auto;"
            >
              <div style="height: 500px;">Tall content</div>
            </div>
          </div>
        `,
      })
      class TestComponent {
        readonly viewport = viewChild.required<NgpThreadViewport>('viewport');
      }

      const { fixture } = await render(TestComponent);
      const viewportElement = screen.getByTestId('viewport');
      const viewportDirective = fixture.componentInstance.viewport();

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(viewportElement.scrollTop).toBe(0);
      expect(viewportDirective.isAtBottom()).toBe(false);
      expect(viewportElement.hasAttribute('data-at-bottom')).toBe(false);
    });
  });
});
