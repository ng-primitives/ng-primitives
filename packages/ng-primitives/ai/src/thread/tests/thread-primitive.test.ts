import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { render, screen, waitFor } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import {
  NgpPromptComposer,
  NgpPromptComposerInput,
  NgpThread,
  NgpThreadViewport,
} from 'ng-primitives/ai';
import { describe, expect, it } from 'vitest';

describe('NgpThread', () => {
  it('should route the prompt to the registered composer input', async () => {
    await render(
      `<div ngpThread #thread="ngpThread">
        <div ngpPromptComposer>
          <input ngpPromptComposerInput />
        </div>
        <button (click)="thread.setPrompt('From the thread')">Set prompt</button>
      </div>`,
      {
        imports: [NgpThread, NgpPromptComposer, NgpPromptComposerInput],
      },
    );

    const input = screen.getByRole('textbox');

    await userEvent.click(screen.getByRole('button', { name: 'Set prompt' }));

    await waitFor(() => expect(input).toHaveValue('From the thread'));
    expect(input).toHaveFocus();
  });

  it('should scroll the registered viewport to the bottom', async () => {
    await render(
      `<div ngpThread #thread="ngpThread">
        <div ngpThreadViewport data-testid="viewport" style="height: 100px; overflow-y: auto;">
          <div style="height: 500px;">Tall content</div>
        </div>
        <button (click)="thread.scrollToBottom('instant')">Scroll</button>
      </div>`,
      {
        imports: [NgpThread, NgpThreadViewport],
      },
    );

    const viewport = screen.getByTestId('viewport');
    expect(viewport.scrollTop).toBe(0);

    await userEvent.click(screen.getByRole('button', { name: 'Scroll' }));

    await waitFor(() => expect(viewport.scrollTop).toBeGreaterThan(0));
  });

  it('should do nothing when no viewport or prompt input is registered', async () => {
    const { fixture } = await render(`<div ngpThread></div>`, {
      imports: [NgpThread],
    });

    const thread = fixture.debugElement.query(By.directive(NgpThread)).injector.get(NgpThread);

    expect(() => thread.scrollToBottom('instant')).not.toThrow();
    expect(() => thread.setPrompt('Hello world')).not.toThrow();
  });

  it('should deregister the viewport when it is destroyed', async () => {
    @Component({
      imports: [NgpThread, NgpThreadViewport],
      template: `
        <div ngpThread>
          @if (showViewport) {
            <div ngpThreadViewport data-testid="viewport" style="height: 100px; overflow-y: auto;">
              <div style="height: 500px;">Tall content</div>
            </div>
          }
        </div>
      `,
    })
    class TestComponent {
      showViewport = true;
    }

    const { fixture } = await render(TestComponent);

    const thread = fixture.debugElement.query(By.directive(NgpThread)).injector.get(NgpThread);

    fixture.componentInstance.showViewport = false;
    fixture.detectChanges();

    expect(screen.queryByTestId('viewport')).not.toBeInTheDocument();
    expect(() => thread.scrollToBottom('instant')).not.toThrow();
  });
});
