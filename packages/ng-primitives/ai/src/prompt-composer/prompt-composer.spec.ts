import { fireEvent, render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { NgpPromptComposerDictation } from '../prompt-composer-dictation/prompt-composer-dictation';
import { MockSpeechRecognition } from '../prompt-composer-dictation/prompt-composer-dictation.spec';
import { NgpPromptComposerInput } from '../prompt-composer-input/prompt-composer-input';
import { NgpPromptComposerSubmit } from '../prompt-composer-submit/prompt-composer-submit';
import { NgpThread } from '../thread/thread';
import { NgpPromptComposer } from './prompt-composer';

describe('NgpPromptComposer', () => {
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

  it('should set data attributes based on state', async () => {
    // Mock SpeechRecognition for dictation support
    (globalThis as any).SpeechRecognition = jest.fn();

    const { fixture } = await render(
      `<div ngpThread>
        <div ngpPromptComposer data-testid="composer" #composer="ngpPromptComposer">
          <input ngpPromptComposerInput />
        </div>
      </div>
      `,
      {
        imports: [NgpThread, NgpPromptComposer, NgpPromptComposerInput],
      },
    );

    const composer = screen.getByTestId('composer');
    const input = screen.getByRole('textbox');

    // Initially no prompt but dictation supported (due to mock)
    expect(composer).not.toHaveAttribute('data-prompt');
    expect(composer).toHaveAttribute('data-dictation-supported');

    // Add content to trigger hasPrompt
    await userEvent.type(input, 'Hello world');
    fixture.detectChanges();

    expect(composer).toHaveAttribute('data-prompt');

    // Clean up mock
    delete (globalThis as any).SpeechRecognition;
  });

  it('should emit submit event with correct prompt content', async () => {
    const submitSpy = jest.fn();

    await render(
      `<div ngpThread>
        <div ngpPromptComposer data-testid="composer" (ngpPromptComposerSubmit)="onSubmit($event)" #composer="ngpPromptComposer">
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
    const submitButton = screen.getByRole('button');

    // Type content and submit
    await userEvent.type(input, 'Hello world');
    await userEvent.click(submitButton);

    expect(submitSpy).toHaveBeenCalledWith('Hello world');
    expect(input).toHaveValue(''); // Should clear after submit
  });

  it('should not emit when prompt is empty', async () => {
    const submitSpy = jest.fn();

    await render(
      `<div ngpThread>
        <div ngpPromptComposer data-testid="composer" (ngpPromptComposerSubmit)="onSubmit($event)" #composer="ngpPromptComposer">
          <input ngpPromptComposerInput />
          <button ngpPromptComposerSubmit>Submit</button>
        </div>
      </div>`,
      {
        imports: [NgpThread, NgpPromptComposer, NgpPromptComposerInput, NgpPromptComposerSubmit],
        componentProperties: { onSubmit: submitSpy },
      },
    );

    const submitButton = screen.getByRole('button');

    await userEvent.click(submitButton);

    expect(submitSpy).not.toHaveBeenCalled();
  });

  it('should not emit when prompt contains only whitespace', async () => {
    const submitSpy = jest.fn();

    await render(
      `<div ngpThread>
        <div ngpPromptComposer data-testid="composer" (ngpPromptComposerSubmit)="onSubmit($event)" #composer="ngpPromptComposer">
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
    const submitButton = screen.getByRole('button');

    await userEvent.type(input, '   ');
    await userEvent.click(submitButton);

    expect(submitSpy).not.toHaveBeenCalled();
  });

  it('should track dictation state', async () => {
    const { fixture } = await render(
      `<div ngpThread>
        <div ngpPromptComposer data-testid="composer" #composer="ngpPromptComposer">
          <input ngpPromptComposerInput />
          <button ngpPromptComposerDictation data-testid="dictation-button" #dictation="ngpPromptComposerDictation">
            {{ dictation.isDictating() ? 'Stop' : 'Start' }} Dictation
          </button>
          <span data-testid="dictation-status">Dictating: {{ composer.isDictating() ? 'Yes' : 'No' }}</span>
        </div>
      </div>`,
      {
        imports: [NgpThread, NgpPromptComposer, NgpPromptComposerInput, NgpPromptComposerDictation],
      },
    );

    const dictationButton = screen.getByTestId('dictation-button');
    const dictationStatus = screen.getByTestId('dictation-status');

    // Initially not dictating
    expect(dictationStatus).toHaveTextContent('Dictating: No');
    expect(dictationButton).toHaveTextContent('Start Dictation');

    // Start dictation by clicking the button
    fireEvent.click(dictationButton);
    fixture.detectChanges();

    expect(dictationStatus).toHaveTextContent('Dictating: Yes');
    expect(dictationButton).toHaveTextContent('Stop Dictation');

    // Stop dictation by clicking the button again
    fireEvent.click(dictationButton);
    fixture.detectChanges();

    expect(dictationStatus).toHaveTextContent('Dictating: No');
    expect(dictationButton).toHaveTextContent('Start Dictation');
  });

  it('should manage prompt state correctly', async () => {
    const { fixture } = await render(
      `<div ngpThread>
        <div ngpPromptComposer data-testid="composer" #composer="ngpPromptComposer">
          <input ngpPromptComposerInput />
          <span data-testid="current-prompt">Current prompt: "{{ composer.prompt() }}"</span>
          <span data-testid="has-prompt">Has prompt: {{ composer.hasPrompt() ? 'Yes' : 'No' }}</span>
        </div>
      </div>`,
      {
        imports: [NgpThread, NgpPromptComposer, NgpPromptComposerInput],
      },
    );

    const input = screen.getByRole('textbox');

    expect(screen.getByTestId('current-prompt')).toHaveTextContent('Current prompt: ""');
    expect(screen.getByTestId('has-prompt')).toHaveTextContent('Has prompt: No');

    await userEvent.type(input, 'Hello');
    fixture.detectChanges();

    expect(screen.getByTestId('current-prompt')).toHaveTextContent('Current prompt: "Hello"');
    expect(screen.getByTestId('has-prompt')).toHaveTextContent('Has prompt: Yes');
  });
});
