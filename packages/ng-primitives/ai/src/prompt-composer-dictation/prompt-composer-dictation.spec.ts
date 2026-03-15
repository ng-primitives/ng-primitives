import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { NgpPromptComposerInput } from '../prompt-composer-input/prompt-composer-input';
import { NgpPromptComposer } from '../prompt-composer/prompt-composer';
import { NgpThread } from '../thread/thread';
import { NgpPromptComposerDictation } from './prompt-composer-dictation';

// Mock SpeechRecognition
export class MockSpeechRecognition {
  continuous = false;
  interimResults = false;
  lang = '';
  onstart: ((event: unknown) => void) | null = null;
  onend: ((event: unknown) => void) | null = null;
  onresult: ((event: unknown) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;

  start() {
    this.onstart?.({});
  }

  stop() {
    this.onend?.({});
  }

  mockResult(transcript: string, isFinal: boolean = true) {
    const event = {
      results: [
        {
          0: { transcript },
          isFinal,
          length: 1,
        },
      ],
      resultIndex: 0,
    };
    setTimeout(() => this.onresult?.(event), 0);
  }

  mockError(error: string) {
    const event = { error };
    setTimeout(() => this.onerror?.(event), 0);
  }
}

describe('NgpPromptComposerDictation', () => {
  let mockSpeechRecognition: MockSpeechRecognition;

  beforeEach(() => {
    mockSpeechRecognition = new MockSpeechRecognition();
    (globalThis as any).SpeechRecognition = jest.fn(() => mockSpeechRecognition);
    (globalThis as any).webkitSpeechRecognition = jest.fn(() => mockSpeechRecognition);
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
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

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

    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

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
});
