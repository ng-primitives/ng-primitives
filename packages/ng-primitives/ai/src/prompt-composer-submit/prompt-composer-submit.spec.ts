import { fireEvent, render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { NgpPromptComposerDictation } from '../prompt-composer-dictation/prompt-composer-dictation';
import { MockSpeechRecognition } from '../prompt-composer-dictation/prompt-composer-dictation.spec';
import { NgpPromptComposerInput } from '../prompt-composer-input/prompt-composer-input';
import { NgpPromptComposer } from '../prompt-composer/prompt-composer';
import { NgpThread } from '../thread/thread';
import { NgpPromptComposerSubmit } from './prompt-composer-submit';

describe('NgpPromptComposerSubmit', () => {
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
          <button ngpPromptComposerSubmit>Submit</button>
        </div>
      </div>`,
      {
        imports: [NgpThread, NgpPromptComposer, NgpPromptComposerSubmit],
      },
    );

    const button = screen.getByRole('button', { name: 'Submit' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('type', 'button');
  });

  it('should be disabled when no prompt content', async () => {
    await render(
      `<div ngpThread>
        <div ngpPromptComposer>
          <input ngpPromptComposerInput />
          <button ngpPromptComposerSubmit>Submit</button>
        </div>
      </div>`,
      {
        imports: [NgpThread, NgpPromptComposer, NgpPromptComposerInput, NgpPromptComposerSubmit],
      },
    );

    const button = screen.getByRole('button', { name: 'Submit' });
    expect(button).toBeDisabled();
  });

  it('should be enabled when prompt has content', async () => {
    const { fixture } = await render(
      `<div ngpThread>
        <div ngpPromptComposer>
          <input ngpPromptComposerInput />
          <button ngpPromptComposerSubmit>Submit</button>
        </div>
      </div>`,
      {
        imports: [NgpThread, NgpPromptComposer, NgpPromptComposerInput, NgpPromptComposerSubmit],
      },
    );

    const input = screen.getByRole('textbox');
    const button = screen.getByRole('button', { name: 'Submit' });

    await userEvent.type(input, 'Hello world');
    fixture.detectChanges();

    expect(button).toBeEnabled();
  });

  it('should set data attributes correctly', async () => {
    (globalThis as any).SpeechRecognition = jest.fn();

    const { fixture } = await render(
      `<div ngpThread>
        <div ngpPromptComposer>
          <input ngpPromptComposerInput />
          <button ngpPromptComposerSubmit>Submit</button>
        </div>
      </div>`,
      {
        imports: [NgpThread, NgpPromptComposer, NgpPromptComposerInput, NgpPromptComposerSubmit],
      },
    );

    const button = screen.getByRole('button', { name: 'Submit' });

    // Initially no prompt
    expect(button).not.toHaveAttribute('data-prompt');
    expect(button).toHaveAttribute('data-dictation-supported');

    // Add content to trigger data-prompt
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'Hello');
    fixture.detectChanges();

    expect(button).toHaveAttribute('data-prompt');
  });

  it('should trigger submit on click', async () => {
    const submitSpy = jest.fn();

    await render(
      `<div ngpThread>
        <div ngpPromptComposer (ngpPromptComposerSubmit)="onSubmit($event)">
          <input ngpPromptComposerInput />
          <button ngpPromptComposerSubmit>Submit</button>
        </div>
      </div>`,
      {
        imports: [NgpThread, NgpPromptComposer, NgpPromptComposerInput, NgpPromptComposerSubmit],
        componentProperties: { onSubmit: submitSpy },
      },
    );

    const input = screen.getByRole('textbox');
    const button = screen.getByRole('button', { name: 'Submit' });

    await userEvent.type(input, 'Test message');
    await userEvent.click(button);

    expect(submitSpy).toHaveBeenCalledWith('Test message');
  });

  it('should not submit when disabled', async () => {
    const submitSpy = jest.fn();

    await render(
      `<div ngpThread>
        <div ngpPromptComposer (ngpPromptComposerSubmit)="onSubmit($event)">
          <input ngpPromptComposerInput />
          <button ngpPromptComposerSubmit>Submit</button>
        </div>
      </div>`,
      {
        imports: [NgpThread, NgpPromptComposer, NgpPromptComposerInput, NgpPromptComposerSubmit],
        componentProperties: { onSubmit: submitSpy },
      },
    );

    const button = screen.getByRole('button', { name: 'Submit' });

    // Button should be disabled with no content
    expect(button).toBeDisabled();
    await userEvent.click(button);

    expect(submitSpy).not.toHaveBeenCalled();
  });

  it('should respect disabled input', async () => {
    const { fixture } = await render(
      `<div ngpThread>
        <div ngpPromptComposer>
          <input ngpPromptComposerInput />
          <button ngpPromptComposerSubmit [disabled]="true">Submit</button>
        </div>
      </div>`,
      {
        imports: [NgpThread, NgpPromptComposer, NgpPromptComposerInput, NgpPromptComposerSubmit],
      },
    );

    const button = screen.getByRole('button', { name: 'Submit' });
    const input = screen.getByRole('textbox');

    // Even with content, button should remain disabled
    await userEvent.type(input, 'Hello world');
    fixture.detectChanges();

    expect(button).toBeDisabled();
  });

  it('should track dictating state', async () => {
    const { fixture } = await render(
      `<div ngpThread>
        <div ngpPromptComposer #composer="ngpPromptComposer">
          <input ngpPromptComposerInput />
          <button ngpPromptComposerSubmit data-testid="submit-button">Submit</button>
          <button ngpPromptComposerDictation data-testid="dictate-button">Dictate</button>
        </div>
      </div>`,
      {
        imports: [
          NgpThread,
          NgpPromptComposer,
          NgpPromptComposerInput,
          NgpPromptComposerSubmit,
          NgpPromptComposerDictation,
        ],
      },
    );

    const button = screen.getByTestId('submit-button');

    // Initially not dictating
    expect(button).not.toHaveAttribute('data-dictating');

    // Simulate dictation state change
    const dictateButton = screen.getByTestId('dictate-button');
    fireEvent.click(dictateButton);
    fixture.detectChanges();

    // Should now have data-dictating attribute
    expect(button).toHaveAttribute('data-dictating');

    // Turn off dictation
    fireEvent.click(dictateButton);
    fixture.detectChanges();

    // Should not have data-dictating attribute
    expect(button).not.toHaveAttribute('data-dictating');
  });

  it('should clear input after successful submit', async () => {
    await render(
      `<div ngpThread>
        <div ngpPromptComposer>
          <input ngpPromptComposerInput />
          <button ngpPromptComposerSubmit>Submit</button>
        </div>
      </div>`,
      {
        imports: [NgpThread, NgpPromptComposer, NgpPromptComposerInput, NgpPromptComposerSubmit],
      },
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;
    const button = screen.getByRole('button', { name: 'Submit' });

    await userEvent.type(input, 'Test message');
    expect(input.value).toBe('Test message');

    await userEvent.click(button);
    expect(input.value).toBe('');
  });
});
