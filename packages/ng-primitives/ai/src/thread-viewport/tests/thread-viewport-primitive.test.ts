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
});
