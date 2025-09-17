import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { NgpPromptComposerInput } from '../prompt-composer-input/prompt-composer-input';
import { NgpPromptComposerSubmit } from '../prompt-composer-submit/prompt-composer-submit';
import { NgpPromptComposer } from './prompt-composer';

describe('NgpPromptComposer', () => {
  it('should set data attributes based on state', async () => {
    // Mock SpeechRecognition for dictation support
    (globalThis as any).SpeechRecognition = jest.fn();

    const { fixture } = await render(
      `<div ngpPromptComposer data-testid="composer" #composer="ngpPromptComposer">
        <input ngpPromptComposerInput />
      </div>`,
      {
        imports: [NgpPromptComposer, NgpPromptComposerInput],
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
      `<div ngpPromptComposer data-testid="composer" (ngpPromptComposerSubmit)="onSubmit($event)" #composer="ngpPromptComposer">
        <input ngpPromptComposerInput />
        <button ngpPromptComposerSubmit>Submit</button>
      </div>`,
      {
        imports: [NgpPromptComposer, NgpPromptComposerInput, NgpPromptComposerSubmit],
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
      `<div ngpPromptComposer data-testid="composer" (ngpPromptComposerSubmit)="onSubmit($event)" #composer="ngpPromptComposer">
        <input ngpPromptComposerInput />
        <button ngpPromptComposerSubmit>Submit</button>
      </div>`,
      {
        imports: [NgpPromptComposer, NgpPromptComposerInput, NgpPromptComposerSubmit],
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
      `<div ngpPromptComposer data-testid="composer" (ngpPromptComposerSubmit)="onSubmit($event)" #composer="ngpPromptComposer">
        <input ngpPromptComposerInput />
        <button ngpPromptComposerSubmit>Submit</button>
      </div>`,
      {
        imports: [NgpPromptComposer, NgpPromptComposerInput, NgpPromptComposerSubmit],
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
      `<div ngpPromptComposer data-testid="composer" #composer="ngpPromptComposer">
        <span data-testid="dictation-status">Dictating: {{ composer.isDictating() ? 'Yes' : 'No' }}</span>
      </div>`,
      {
        imports: [NgpPromptComposer],
      },
    );

    expect(screen.getByTestId('dictation-status')).toHaveTextContent('Dictating: No');

    // Get the directive instance directly from the fixture
    const directiveInstance = fixture.debugElement.children[0].injector.get(NgpPromptComposer);
    directiveInstance.isDictating.set(true);
    fixture.detectChanges();

    expect(screen.getByTestId('dictation-status')).toHaveTextContent('Dictating: Yes');
  });

  it('should support dictation detection', async () => {
    // Test without SpeechRecognition
    await render(
      `<div ngpPromptComposer data-testid="composer" #composer="ngpPromptComposer">
        <span data-testid="dictation-support">Dictation Supported: {{ composer.dictationSupported ? 'Yes' : 'No' }}</span>
      </div>`,
      {
        imports: [NgpPromptComposer],
      },
    );

    expect(screen.getByTestId('dictation-support')).toHaveTextContent('Dictation Supported: No');
  });

  it('should manage prompt state correctly', async () => {
    const { fixture } = await render(
      `<div ngpPromptComposer data-testid="composer" #composer="ngpPromptComposer">
        <input ngpPromptComposerInput />
        <span data-testid="current-prompt">Current prompt: "{{ composer.prompt() }}"</span>
        <span data-testid="has-prompt">Has prompt: {{ composer.hasPrompt() ? 'Yes' : 'No' }}</span>
      </div>`,
      {
        imports: [NgpPromptComposer, NgpPromptComposerInput],
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
