import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { NgpPromptComposer } from '../prompt-composer/prompt-composer';
import { NgpThread } from '../thread/thread';
import { NgpPromptComposerInput } from './prompt-composer-input';

describe('NgpPromptComposerInput', () => {
  it('should initialize correctly with input element', async () => {
    await render(
      `<div ngpThread>
        <div ngpPromptComposer>
          <input ngpPromptComposerInput placeholder="Enter message" />
        </div>
      </div>`,
      {
        imports: [NgpThread, NgpPromptComposer, NgpPromptComposerInput],
      },
    );

    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'Enter message');
  });

  it('should initialize correctly with textarea element', async () => {
    await render(
      `<div ngpThread>
        <div ngpPromptComposer>
          <textarea ngpPromptComposerInput placeholder="Enter message"></textarea>
        </div>
      </div>`,
      {
        imports: [NgpThread, NgpPromptComposer, NgpPromptComposerInput],
      },
    );

    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
    expect(textarea.tagName).toBe('TEXTAREA');
  });

  it('should sync input value with composer prompt state', async () => {
    const { fixture } = await render(
      `<div ngpThread>
        <div ngpPromptComposer #composer="ngpPromptComposer">
          <input ngpPromptComposerInput />
          Current prompt: "{{ composer.prompt() }}"
        </div>
      </div>`,
      {
        imports: [NgpThread, NgpPromptComposer, NgpPromptComposerInput],
      },
    );

    const input = screen.getByRole('textbox');

    expect(screen.getByText('Current prompt: ""')).toBeInTheDocument();

    await userEvent.type(input, 'Hello world');
    fixture.detectChanges();

    expect(screen.getByText('Current prompt: "Hello world"')).toBeInTheDocument();
  });

  it('should set initial value from input element', async () => {
    const { fixture } = await render(
      `<div ngpThread>
        <div ngpPromptComposer #composer="ngpPromptComposer">
          <input ngpPromptComposerInput value="Initial value" />
          Current prompt: "{{ composer.prompt() }}"
        </div>
      </div>`,
      {
        imports: [NgpThread, NgpPromptComposer, NgpPromptComposerInput],
      },
    );

    // Allow time for initialization
    fixture.detectChanges();

    expect(screen.getByText('Current prompt: "Initial value"')).toBeInTheDocument();
  });

  it('should submit on Enter key without Shift', async () => {
    const submitSpy = jest.fn();

    await render(
      `<div ngpThread>
        <div ngpPromptComposer (ngpPromptComposerSubmit)="onSubmit($event)">
          <input ngpPromptComposerInput />
        </div>
      </div>`,
      {
        imports: [NgpThread, NgpPromptComposer, NgpPromptComposerInput],
        componentProperties: { onSubmit: submitSpy },
      },
    );

    const input = screen.getByRole('textbox');

    await userEvent.type(input, 'Test message');
    await userEvent.keyboard('{Enter}');

    expect(submitSpy).toHaveBeenCalledWith('Test message');
  });

  it('should not submit on Enter key with Shift (multiline)', async () => {
    const submitSpy = jest.fn();

    await render(
      `<div ngpThread>
        <div ngpPromptComposer (ngpPromptComposerSubmit)="onSubmit($event)">
          <textarea ngpPromptComposerInput></textarea>
        </div>
      </div>`,
      {
        imports: [NgpThread, NgpPromptComposer, NgpPromptComposerInput],
        componentProperties: { onSubmit: submitSpy },
      },
    );

    const textarea = screen.getByRole('textbox');

    await userEvent.type(textarea, 'First line');
    await userEvent.keyboard('{Shift>}{Enter}{/Shift}');
    await userEvent.type(textarea, 'Second line');

    expect(submitSpy).not.toHaveBeenCalled();
    expect(textarea).toHaveValue('First line\nSecond line');
  });

  it('should not submit when input is empty', async () => {
    const submitSpy = jest.fn();

    await render(
      `<div ngpThread>
        <div ngpPromptComposer (ngpPromptComposerSubmit)="onSubmit($event)">
          <input ngpPromptComposerInput />
        </div>
      </div>`,
      {
        imports: [NgpThread, NgpPromptComposer, NgpPromptComposerInput],
        componentProperties: { onSubmit: submitSpy },
      },
    );

    await userEvent.keyboard('{Enter}');

    expect(submitSpy).not.toHaveBeenCalled();
  });

  it('should not submit when input contains only whitespace', async () => {
    const submitSpy = jest.fn();

    await render(
      `<div ngpThread>
        <div ngpPromptComposer (ngpPromptComposerSubmit)="onSubmit($event)">
          <input ngpPromptComposerInput />
        </div>
      </div>`,
      {
        imports: [NgpThread, NgpPromptComposer, NgpPromptComposerInput],
        componentProperties: { onSubmit: submitSpy },
      },
    );

    const input = screen.getByRole('textbox');

    await userEvent.type(input, '   ');
    await userEvent.keyboard('{Enter}');

    expect(submitSpy).not.toHaveBeenCalled();
  });

  it('should handle rapid typing correctly', async () => {
    const { fixture } = await render(
      `<div ngpThread>
        <div ngpPromptComposer #composer="ngpPromptComposer">
          <input ngpPromptComposerInput />
          Current prompt: "{{ composer.prompt() }}"
        </div>
      </div>`,
      {
        imports: [NgpThread, NgpPromptComposer, NgpPromptComposerInput],
      },
    );

    const input = screen.getByRole('textbox');

    // Simulate rapid typing
    await userEvent.type(input, 'Quick typing test', { delay: 10 });
    fixture.detectChanges();

    expect(screen.getByText('Current prompt: "Quick typing test"')).toBeInTheDocument();
  });

  it('should clear input after submit', async () => {
    await render(
      `<div ngpThread>
        <div ngpPromptComposer>
          <input ngpPromptComposerInput />
        </div>
      </div>`,
      {
        imports: [NgpThread, NgpPromptComposer, NgpPromptComposerInput],
      },
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;

    await userEvent.type(input, 'Test message');
    expect(input.value).toBe('Test message');

    await userEvent.keyboard('{Enter}');
    expect(input.value).toBe('');
  });
});
