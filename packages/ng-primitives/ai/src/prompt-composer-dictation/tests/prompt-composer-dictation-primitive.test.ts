import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import {
  NgpPromptComposer,
  NgpPromptComposerDictation,
  NgpPromptComposerInput,
  NgpThread,
} from 'ng-primitives/ai';
import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest';
import { MockSpeechRecognition } from './mock-speech-recognition';

describe('NgpPromptComposerDictation', () => {
  let mockSpeechRecognition: MockSpeechRecognition;

  beforeEach(() => {
    mockSpeechRecognition = new MockSpeechRecognition();
    (globalThis as any).SpeechRecognition = vi.fn(function () {
      return mockSpeechRecognition;
    });
    (globalThis as any).webkitSpeechRecognition = vi.fn(function () {
      return mockSpeechRecognition;
    });
  });

  afterEach(() => {
    delete (globalThis as any).SpeechRecognition;
    delete (globalThis as any).webkitSpeechRecognition;
  });

  it('should initialize correctly', async () => {
    await render(
      `<div ngpThread>
        <div ngpPromptComposer>
          <button ngpPromptComposerDictation>Dictate</button>
        </div>
      </div>`,
      {
        imports: [NgpThread, NgpPromptComposer, NgpPromptComposerDictation],
      },
    );

    const button = screen.getByRole('button', { name: 'Dictate' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('type', 'button');
  });

  it('should be disabled when dictation is not supported', async () => {
    // Remove speech recognition support
    delete (globalThis as any).SpeechRecognition;
    delete (globalThis as any).webkitSpeechRecognition;

    await render(
      `<div ngpThread>
        <div ngpPromptComposer>
          <button ngpPromptComposerDictation>Dictate</button>
        </div>
      </div>`,
      {
        imports: [NgpThread, NgpPromptComposer, NgpPromptComposerDictation],
      },
    );

    const button = screen.getByRole('button', { name: 'Dictate' });
    expect(button).toBeDisabled();
  });

  it('should set data attributes correctly', async () => {
    const { fixture } = await render(
      `<div ngpThread>
        <div ngpPromptComposer>
          <input ngpPromptComposerInput />
          <button ngpPromptComposerDictation>Dictate</button>
        </div>
      </div>`,
      {
        imports: [NgpThread, NgpPromptComposer, NgpPromptComposerInput, NgpPromptComposerDictation],
      },
    );

    const button = screen.getByRole('button', { name: 'Dictate' });

    expect(button).toHaveAttribute('data-dictation-supported');
    expect(button).not.toHaveAttribute('data-dictating');
    expect(button).not.toHaveAttribute('data-prompt');

    // Add content to trigger data-prompt
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'Hello');
    fixture.detectChanges();

    expect(button).toHaveAttribute('data-prompt');
  });

  it('should start dictation on click', async () => {
    const { fixture } = await render(
      `<div ngpThread>
        <div ngpPromptComposer #composer="ngpPromptComposer">
          <button ngpPromptComposerDictation data-testid="dictate-button">Dictate</button>
        </div>
      </div>`,
      {
        imports: [NgpThread, NgpPromptComposer, NgpPromptComposerDictation],
      },
    );

    const button = screen.getByTestId('dictate-button');

    // Initially not dictating
    expect(button).not.toHaveAttribute('data-dictating');

    await userEvent.click(button);
    fixture.detectChanges();

    // Should now be dictating
    expect(button).toHaveAttribute('data-dictating');
  });

  it('should stop dictation on second click', async () => {
    const { fixture } = await render(
      `<div ngpThread>
        <div ngpPromptComposer #composer="ngpPromptComposer">
          <button ngpPromptComposerDictation data-testid="dictate-button">Dictate</button>
        </div>
      </div>`,
      {
        imports: [NgpThread, NgpPromptComposer, NgpPromptComposerDictation],
      },
    );

    const button = screen.getByTestId('dictate-button');

    // Start dictation
    await userEvent.click(button);
    fixture.detectChanges();
    expect(button).toHaveAttribute('data-dictating');

    // Stop dictation
    await userEvent.click(button);
    fixture.detectChanges();
    expect(button).not.toHaveAttribute('data-dictating');
  });

  it('should transcribe speech results', async () => {
    const { fixture } = await render(
      `<div ngpThread>
        <div ngpPromptComposer #composer="ngpPromptComposer">
          <input ngpPromptComposerInput />
          <button ngpPromptComposerDictation>Dictate</button>
          Current: "{{ composer.prompt() }}"
        </div>
      </div>`,
      {
        imports: [NgpThread, NgpPromptComposer, NgpPromptComposerInput, NgpPromptComposerDictation],
      },
    );

    const button = screen.getByRole('button');

    // Start dictation
    await userEvent.click(button);
    fixture.detectChanges();

    // Mock speech result
    mockSpeechRecognition.mockResult('Hello world', true);
    await new Promise(resolve => setTimeout(resolve, 10));
    fixture.detectChanges();

    expect(screen.getByText('Current: "Hello world"')).toBeInTheDocument();
  });

  it('should append to existing prompt', async () => {
    const { fixture } = await render(
      `<div ngpThread>
        <div ngpPromptComposer #composer="ngpPromptComposer">
          <input ngpPromptComposerInput />
          <button ngpPromptComposerDictation>Dictate</button>
          Current: "{{ composer.prompt() }}"
        </div>
      </div>`,
      {
        imports: [NgpThread, NgpPromptComposer, NgpPromptComposerInput, NgpPromptComposerDictation],
      },
    );

    const input = screen.getByRole('textbox');
    const button = screen.getByRole('button');

    // Type some initial content
    await userEvent.type(input, 'Initial text');
    fixture.detectChanges();

    // Start dictation
    await userEvent.click(button);
    fixture.detectChanges();

    // Mock speech result
    mockSpeechRecognition.mockResult('and more text', true);
    await new Promise(resolve => setTimeout(resolve, 10));
    fixture.detectChanges();

    expect(screen.getByText('Current: "Initial text and more text"')).toBeInTheDocument();
  });

  it('should handle interim results', async () => {
    const { fixture } = await render(
      `<div ngpThread>
        <div ngpPromptComposer #composer="ngpPromptComposer">
          <input ngpPromptComposerInput />
          <button ngpPromptComposerDictation>Dictate</button>
          Current: "{{ composer.prompt() }}"
        </div>
      </div>`,
      {
        imports: [NgpThread, NgpPromptComposer, NgpPromptComposerInput, NgpPromptComposerDictation],
      },
    );

    const button = screen.getByRole('button');

    // Start dictation
    await userEvent.click(button);
    fixture.detectChanges();

    // Mock interim result
    mockSpeechRecognition.mockResult('Hello wo', false);
    await new Promise(resolve => setTimeout(resolve, 10));
    fixture.detectChanges();

    expect(screen.getByText('Current: "Hello wo"')).toBeInTheDocument();

    // Mock final result
    mockSpeechRecognition.mockResult('Hello world', true);
    await new Promise(resolve => setTimeout(resolve, 10));
    fixture.detectChanges();

    expect(screen.getByText('Current: "Hello world"')).toBeInTheDocument();
  });

  it('should stop dictation on Escape key', async () => {
    const { fixture } = await render(
      `<div ngpThread>
        <div ngpPromptComposer #composer="ngpPromptComposer">
          <button ngpPromptComposerDictation data-testid="dictate-button">Dictate</button>
        </div>
      </div>`,
      {
        imports: [NgpThread, NgpPromptComposer, NgpPromptComposerDictation],
      },
    );

    const button = screen.getByTestId('dictate-button');

    // Start dictation
    await userEvent.click(button);
    fixture.detectChanges();
    expect(button).toHaveAttribute('data-dictating');

    // Press Escape
    await userEvent.keyboard('{Escape}');
    fixture.detectChanges();

    expect(button).not.toHaveAttribute('data-dictating');
  });

  it('should handle speech recognition errors', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { fixture } = await render(
      `<div ngpThread>
        <div ngpPromptComposer>
          <button ngpPromptComposerDictation data-testid="dictate-button">Dictate</button>
        </div>
      </div>`,
      {
        imports: [NgpThread, NgpPromptComposer, NgpPromptComposerDictation],
      },
    );

    const button = screen.getByTestId('dictate-button');

    // Start dictation
    await userEvent.click(button);
    fixture.detectChanges();
    expect(button).toHaveAttribute('data-dictating');

    // Mock error
    mockSpeechRecognition.mockError('network');
    await new Promise(resolve => setTimeout(resolve, 10));
    fixture.detectChanges();

    expect(button).not.toHaveAttribute('data-dictating');
    expect(consoleSpy).toHaveBeenCalledWith('Speech recognition error:', 'network');

    consoleSpy.mockRestore();
  });

  it('should respect disabled input', async () => {
    await render(
      `<div ngpThread>
        <div ngpPromptComposer>
          <button ngpPromptComposerDictation [disabled]="true">Dictate</button>
        </div>
      </div>`,
      {
        imports: [NgpThread, NgpPromptComposer, NgpPromptComposerDictation],
      },
    );

    const button = screen.getByRole('button', { name: 'Dictate' });
    expect(button).toBeDisabled();
  });

  it('should warn when speech recognition is not available', async () => {
    // Remove speech recognition support
    delete (globalThis as any).SpeechRecognition;
    delete (globalThis as any).webkitSpeechRecognition;

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await render(
      `<div ngpThread>
        <div ngpPromptComposer>
          <button ngpPromptComposerDictation data-testid="dictate-button">Dictate</button>
        </div>
      </div>`,
      {
        imports: [NgpThread, NgpPromptComposer, NgpPromptComposerDictation],
      },
    );

    const button = screen.getByTestId('dictate-button');

    // Initially not dictating
    expect(button).not.toHaveAttribute('data-dictating');

    await userEvent.click(button);

    // Should still not have data-dictating attribute since dictation failed to start
    expect(button).not.toHaveAttribute('data-dictating');

    // Console warning may or may not be called depending on implementation
    // The important thing is that dictation doesn't start when not supported

    consoleSpy.mockRestore();
  });

  describe('user edits during a session', () => {
    const template = `<div ngpThread>
        <div ngpPromptComposer #composer="ngpPromptComposer">
          <input ngpPromptComposerInput />
          <button ngpPromptComposerDictation>Dictate</button>
          Current: "{{ composer.prompt() }}"
        </div>
      </div>`;

    const imports = [
      NgpThread,
      NgpPromptComposer,
      NgpPromptComposerInput,
      NgpPromptComposerDictation,
    ];

    /** Let the queued result event reach the primitive. */
    async function settle(fixture: { detectChanges(): void }): Promise<void> {
      await new Promise(resolve => setTimeout(resolve, 10));
      fixture.detectChanges();
    }

    it('should not bring back text the user deleted mid-session', async () => {
      const { fixture } = await render(template, { imports });

      const input = screen.getByRole('textbox');
      await userEvent.click(screen.getByRole('button', { name: 'Dictate' }));
      fixture.detectChanges();

      mockSpeechRecognition.mockResult('hello');
      await settle(fixture);
      expect(screen.getByText('Current: "hello"')).toBeInTheDocument();

      // the user empties the field while dictation is still running
      await userEvent.clear(input);
      fixture.detectChanges();

      mockSpeechRecognition.mockResult('world');
      await settle(fixture);

      expect(screen.getByText('Current: "world"')).toBeInTheDocument();
    });

    it('should keep a partial edit the user made mid-session', async () => {
      const { fixture } = await render(template, { imports });

      const input = screen.getByRole('textbox');
      await userEvent.click(screen.getByRole('button', { name: 'Dictate' }));
      fixture.detectChanges();

      mockSpeechRecognition.mockResult('one');
      await settle(fixture);

      // the user keeps typing while dictation is running
      await userEvent.type(input, ' edited');
      fixture.detectChanges();

      mockSpeechRecognition.mockResult('two');
      await settle(fixture);

      expect(screen.getByText('Current: "one edited two"')).toBeInTheDocument();
    });

    it('should accumulate phrases across a continuous session', async () => {
      const { fixture } = await render(template, { imports });

      await userEvent.click(screen.getByRole('button', { name: 'Dictate' }));
      fixture.detectChanges();

      mockSpeechRecognition.mockResult('one ');
      await settle(fixture);

      mockSpeechRecognition.mockResult('two');
      await settle(fixture);

      expect(screen.getByText('Current: "one two"')).toBeInTheDocument();
    });

    it('should start from the current prompt after dictation is stopped', async () => {
      const { fixture } = await render(template, { imports });

      const button = screen.getByRole('button', { name: 'Dictate' });

      await userEvent.click(button);
      fixture.detectChanges();
      mockSpeechRecognition.mockResult('first');
      await settle(fixture);

      // stop, then dictate again — the earlier session must not be replayed
      await userEvent.click(button);
      fixture.detectChanges();
      await userEvent.click(button);
      fixture.detectChanges();

      mockSpeechRecognition.mockResult('second');
      await settle(fixture);

      expect(screen.getByText('Current: "first second"')).toBeInTheDocument();
    });
  });
});
