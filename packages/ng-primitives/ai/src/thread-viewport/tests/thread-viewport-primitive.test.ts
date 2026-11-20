import {
  Component,
  Directive,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import {
  NgpPromptComposer,
  NgpPromptComposerInput,
  NgpThread,
  NgpThreadMessage,
  NgpThreadViewport,
  ngpThreadViewport,
  provideThreadViewportState,
} from 'ng-primitives/ai';
import { describe, expect, it, vi } from 'vitest';

describe('NgpThreadViewport', () => {
  it('should receive one viewport mutation delivery for a single append', async () => {
    const NativeMutationObserver = globalThis.MutationObserver;
    const deliveries: MutationRecord[][] = [];
    let viewport: HTMLElement | undefined;

    class ObservedMutationObserver extends NativeMutationObserver {
      constructor(callback: MutationCallback) {
        super((records, observer) => {
          if (records.some(record => record.target === viewport)) {
            deliveries.push(records);
          }
          callback(records, observer);
        });
      }
    }

    vi.stubGlobal('MutationObserver', ObservedMutationObserver);

    try {
      await render(
        `<div ngpThread>
          <div ngpThreadViewport data-testid="viewport" style="height: 100px; overflow-y: auto;">
            <div style="height: 500px;">History</div>
          </div>
        </div>`,
        { imports: [NgpThread, NgpThreadViewport] },
      );

      viewport = screen.getByTestId('viewport');
      await waitFor(() => expect(viewport?.scrollTop).toBe(400));

      const message = document.createElement('div');
      message.style.height = '300px';
      viewport.appendChild(message);
      await waitFor(() => expect(deliveries.length).toBeGreaterThan(0));

      expect(deliveries).toHaveLength(1);
    } finally {
      vi.stubGlobal('MutationObserver', NativeMutationObserver);
    }
  });

  it('should keep delayed history at the start until the reader scrolls to the bottom', async () => {
    @Component({
      imports: [NgpThread, NgpThreadViewport],
      template: `
        <div ngpThread>
          <div
            #viewport="ngpThreadViewport"
            [ngpThreadViewportInitialScrollPosition]="'start'"
            ngpThreadViewport
            data-testid="viewport"
            style="height: 100px; overflow-y: auto;"
          >
            @for (message of messages(); track message) {
              <div style="height: 300px;">{{ message }}</div>
            }
          </div>
        </div>
      `,
    })
    class TestComponent {
      readonly messages = signal<number[]>([]);
      readonly viewport = viewChild.required<NgpThreadViewport>('viewport');
    }

    const { fixture } = await render(TestComponent);
    const viewport = screen.getByTestId('viewport');
    await new Promise(resolve => requestAnimationFrame(() => resolve(undefined)));

    fixture.componentInstance.messages.set([1, 2]);
    await fixture.whenStable();
    await new Promise(resolve => requestAnimationFrame(() => resolve(undefined)));

    expect(viewport.scrollHeight).toBe(600);
    expect(viewport.scrollTop).toBe(0);
    expect(fixture.componentInstance.viewport().isAtBottom()).toBe(false);

    viewport.scrollTop = 500;
    viewport.dispatchEvent(new Event('scroll'));
    await waitFor(() => expect(fixture.componentInstance.viewport().isAtBottom()).toBe(true));

    fixture.componentInstance.messages.set([1, 2, 3]);
    await fixture.whenStable();
    await waitFor(() => expect(viewport.scrollTop).toBe(800));
  });

  it('should expose the bound start state before render callbacks run', async () => {
    @Directive({ selector: '[captureInitialViewportState]' })
    class CaptureInitialViewportState implements OnInit {
      readonly viewport = inject(NgpThreadViewport);
      initialIsAtBottom: boolean | undefined;

      ngOnInit(): void {
        this.initialIsAtBottom = this.viewport.isAtBottom();
      }
    }

    @Component({
      imports: [NgpThread, NgpThreadViewport, CaptureInitialViewportState],
      template: `
        <div ngpThread>
          <div
            #viewport="ngpThreadViewport"
            [ngpThreadViewportInitialScrollPosition]="position()"
            [attr.data-initial-bottom]="viewport.isAtBottom()"
            ngpThreadViewport
            captureInitialViewportState
            data-testid="viewport"
            style="height: 100px; overflow-y: auto;"
          >
            <div style="height: 500px;">History</div>
          </div>
        </div>
      `,
    })
    class TestComponent {
      readonly position = signal<'start' | 'end'>('start');
      readonly initialState = viewChild.required(CaptureInitialViewportState);
    }

    const { fixture } = await render(TestComponent);

    expect(fixture.componentInstance.initialState().initialIsAtBottom).toBe(false);
    expect(screen.getByTestId('viewport').getAttribute('data-initial-bottom')).toBe('false');
  });

  describe('initial state', () => {
    @Directive({
      selector: '[initialStateProbe]',
      providers: [provideThreadViewportState()],
    })
    class InitialStateProbe {
      readonly position = signal<'start' | 'end'>('end');
      readonly state = ngpThreadViewport({ initialScrollPosition: this.position });
      readonly beforeBinding: boolean;
      readonly afterBinding: boolean;

      constructor() {
        this.beforeBinding = this.state.isAtBottom();
        this.position.set('start');
        this.afterBinding = this.state.isAtBottom();
      }
    }

    @Component({
      imports: [NgpThread, InitialStateProbe],
      template: `
        <div ngpThread>
          <div initialStateProbe data-testid="viewport" style="height: 100px; overflow-y: auto;">
            <div style="height: 500px;">History</div>
          </div>
        </div>
      `,
    })
    class TestComponent {
      readonly probe = viewChild.required(InitialStateProbe);
    }

    it('should track a start input after an early read before render callbacks', async () => {
      const { fixture } = await render(TestComponent);
      expect(fixture.componentInstance.probe().beforeBinding).toBe(true);
      expect(fixture.componentInstance.probe().afterBinding).toBe(false);
    });

    it('should expose start state and its binding on the server without scrolling', async () => {
      const scrollTo = vi.spyOn(HTMLElement.prototype, 'scrollTo');
      vi.stubGlobal('ngServerMode', true);
      vi.stubGlobal('MutationObserver', undefined);
      try {
        const { fixture } = await render(TestComponent, {
          providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
        });
        await fixture.whenStable();
        expect(fixture.componentInstance.probe().state.isAtBottom()).toBe(false);
        expect(screen.getByTestId('viewport').hasAttribute('data-at-bottom')).toBe(false);
        expect(scrollTo).not.toHaveBeenCalled();
      } finally {
        scrollTo.mockRestore();
        vi.unstubAllGlobals();
      }
    });

    it('should retain the default end state on the server without scrolling', async () => {
      const scrollTo = vi.spyOn(HTMLElement.prototype, 'scrollTo');
      vi.stubGlobal('ngServerMode', true);
      vi.stubGlobal('MutationObserver', undefined);
      try {
        await render(
          `<div ngpThread>
            <div ngpThreadViewport data-testid="viewport" style="height: 100px; overflow-y: auto;">
              <div style="height: 500px;">History</div>
            </div>
          </div>`,
          {
            imports: [NgpThread, NgpThreadViewport],
            providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
          },
        );
        expect(screen.getByTestId('viewport').hasAttribute('data-at-bottom')).toBe(true);
        expect(scrollTo).not.toHaveBeenCalled();
      } finally {
        scrollTo.mockRestore();
        vi.unstubAllGlobals();
      }
    });
  });

  describe('start following', () => {
    @Component({
      imports: [
        NgpThread,
        NgpThreadViewport,
        NgpThreadMessage,
        NgpPromptComposer,
        NgpPromptComposerInput,
      ],
      template: `
        <div ngpThread>
          <div
            #viewport="ngpThreadViewport"
            [ngpThreadViewportThreshold]="threshold()"
            [style.height.px]="viewportHeight()"
            ngpThreadViewport
            ngpThreadViewportInitialScrollPosition="start"
            data-testid="viewport"
            style="overflow-y: auto;"
          >
            @for (message of messages(); track message.id) {
              <div [style.height.px]="message.height" ngpThreadMessage>{{ message.content }}</div>
            }
          </div>
          <div ngpPromptComposer>
            <input ngpPromptComposerInput />
          </div>
        </div>
      `,
    })
    class StartThread {
      readonly threshold = signal(70);
      readonly viewportHeight = signal(100);
      readonly messages = signal<{ id: number; height: number; content: string }[]>([]);
      readonly viewport = viewChild.required<NgpThreadViewport>('viewport');
    }

    it('should not enable following from short history, threshold, resize or streaming measurements', async () => {
      const { fixture } = await render(StartThread);
      const { messages, threshold, viewportHeight } = fixture.componentInstance;
      const viewport = screen.getByTestId('viewport');
      const state = fixture.componentInstance.viewport();
      const scrollTo = vi.spyOn(viewport, 'scrollTo');

      messages.set([{ id: 1, height: 30, content: 'Short history' }]);
      await fixture.whenStable();
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(state.isAtBottom()).toBe(false);

      threshold.set(1000);
      await fixture.whenStable();
      expect(state.isAtBottom()).toBe(false);

      viewportHeight.set(200);
      await fixture.whenStable();
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(viewport.clientHeight).toBe(200);
      expect(state.isAtBottom()).toBe(false);

      messages.set([{ id: 1, height: 500, content: 'Now streaming much more content' }]);
      await fixture.whenStable();
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(viewport.scrollHeight).toBe(500);
      expect(state.isAtBottom()).toBe(false);

      messages.update(current => [...current, { id: 2, height: 300, content: 'Appended' }]);
      await fixture.whenStable();
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(viewport.scrollTop).toBe(0);
      expect(scrollTo).not.toHaveBeenCalled();
      expect(state.isAtBottom()).toBe(false);

      threshold.set(70);
      await fixture.whenStable();
      viewport.scrollTop = 600;
      viewport.dispatchEvent(new Event('scroll'));
      await waitFor(() => expect(state.isAtBottom()).toBe(true));

      messages.update(current => [...current, { id: 3, height: 300, content: 'Following' }]);
      await fixture.whenStable();
      await waitFor(() => expect(viewport.scrollTop).toBe(900));
      await new Promise(resolve => setTimeout(resolve, 50));

      viewport.scrollTop = 100;
      viewport.dispatchEvent(new Event('scroll'));
      await waitFor(() => expect(state.isAtBottom()).toBe(false));
      threshold.set(1000);
      await fixture.whenStable();
      await waitFor(() => expect(state.isAtBottom()).toBe(true));
      threshold.set(70);
      await fixture.whenStable();
      await waitFor(() => expect(state.isAtBottom()).toBe(false));

      messages.update(current => [...current, { id: 4, height: 300, content: 'Reading above' }]);
      await fixture.whenStable();
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(viewport.scrollTop).toBe(100);

      viewport.scrollTop = 1200;
      viewport.dispatchEvent(new Event('scroll'));
      messages.update(current => [...current, { id: 5, height: 300, content: 'Following again' }]);
      await fixture.whenStable();
      await waitFor(() => expect(viewport.scrollTop).toBe(1500));
    });

    it('should honor composer submission from start and then follow appended content', async () => {
      const { fixture } = await render(StartThread);
      fixture.componentInstance.messages.set([{ id: 1, height: 500, content: 'History' }]);
      await fixture.whenStable();
      await new Promise(resolve => setTimeout(resolve, 50));
      const viewport = screen.getByTestId('viewport');
      expect(viewport.scrollTop).toBe(0);

      await userEvent.type(screen.getByRole('textbox'), 'Hello');
      await userEvent.keyboard('{Enter}');
      await waitFor(() => expect(viewport.scrollTop).toBe(400));
      await waitFor(() => expect(fixture.componentInstance.viewport().isAtBottom()).toBe(true));

      fixture.componentInstance.messages.update(current => [
        ...current,
        { id: 2, height: 300, content: 'Reply' },
      ]);
      await fixture.whenStable();
      await waitFor(() => expect(viewport.scrollTop).toBe(700));
    });
  });

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

  describe('reused message elements', () => {
    async function renderViewport(anchoring = 'auto'): Promise<HTMLElement> {
      await render(
        `<div ngpThread>
          <div ngpThreadViewport data-testid="viewport" style="height: 100px; overflow-y: auto; overflow-anchor: ${anchoring};">
            <div style="height: 300px;">First</div>
            <div style="height: 300px;">Second</div>
            <div style="height: 300px;">Third</div>
          </div>
        </div>`,
        { imports: [NgpThread, NgpThreadViewport] },
      );
      const viewport = screen.getByTestId('viewport');
      await waitFor(() => expect(viewport.scrollTop).toBe(800));
      return viewport;
    }

    it('should follow the same element when appended in a later delivery', async () => {
      const viewport = await renderViewport();
      const message = document.createElement('div');
      message.style.height = '150px';
      viewport.appendChild(message);
      await waitFor(() => expect(viewport.scrollTop).toBe(950));

      message.remove();
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(viewport.scrollTop).toBe(800);

      const scrollTo = vi.spyOn(viewport, 'scrollTo');
      viewport.appendChild(message);
      await waitFor(() => expect(viewport.scrollTop).toBe(950));
      expect(scrollTo).toHaveBeenCalledOnce();
    });

    it.each(['auto', 'none'])(
      'should compensate a reused prepend once with native anchoring %s',
      async anchoring => {
        const viewport = await renderViewport(anchoring);
        viewport.scrollTop = 400;
        viewport.dispatchEvent(new Event('scroll'));
        await new Promise(resolve => setTimeout(resolve, 50));
        const existing = viewport.children[1];
        const relativeTop = () =>
          existing.getBoundingClientRect().top - viewport.getBoundingClientRect().top;

        const reused = document.createElement('div');
        reused.style.height = '150px';
        viewport.appendChild(reused);
        await new Promise(resolve => setTimeout(resolve, 50));
        reused.remove();
        await new Promise(resolve => setTimeout(resolve, 50));

        const beforeFirstPrepend = relativeTop();
        viewport.prepend(reused);
        await waitFor(() => expect(viewport.scrollTop).toBe(550));
        expect(relativeTop()).toBe(beforeFirstPrepend);

        reused.remove();
        await new Promise(resolve => setTimeout(resolve, 50));
        const beforeSecondPrepend = relativeTop();
        viewport.prepend(reused);
        await waitFor(() => expect(relativeTop()).toBe(beforeSecondPrepend));
      },
    );

    it('should handle moved, repeatedly added and detached elements in one delivery', async () => {
      const viewport = await renderViewport('none');
      viewport.scrollTop = 400;
      viewport.dispatchEvent(new Event('scroll'));
      await new Promise(resolve => setTimeout(resolve, 50));
      const existing = viewport.children[1];
      const relativeTop =
        existing.getBoundingClientRect().top - viewport.getBoundingClientRect().top;
      const moved = document.createElement('div');
      moved.style.height = '150px';
      viewport.appendChild(moved);
      moved.remove();
      viewport.prepend(moved);
      const detached = document.createElement('div');
      detached.style.height = '200px';
      viewport.appendChild(detached);
      detached.remove();

      await waitFor(() => expect(viewport.scrollTop).toBe(550));
      expect(existing.getBoundingClientRect().top - viewport.getBoundingClientRect().top).toBe(
        relativeTop,
      );
      expect(viewport.scrollHeight).toBe(1050);
    });
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
