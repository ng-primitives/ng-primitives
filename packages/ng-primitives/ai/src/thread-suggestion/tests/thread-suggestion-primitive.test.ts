import { render, screen, waitFor } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import {
  NgpPromptComposer,
  NgpPromptComposerInput,
  NgpThread,
  NgpThreadSuggestion,
} from 'ng-primitives/ai';
import { describe, expect, it } from 'vitest';

describe('NgpThreadSuggestion', () => {
  it('should populate the prompt when clicked', async () => {
    await render(
      `<div ngpThread>
        <button ngpThreadSuggestion="Explain Angular signals">Suggestion</button>
        <div ngpPromptComposer>
          <input ngpPromptComposerInput />
        </div>
      </div>`,
      {
        imports: [NgpThread, NgpThreadSuggestion, NgpPromptComposer, NgpPromptComposerInput],
      },
    );

    const input = screen.getByRole('textbox');

    await userEvent.click(screen.getByRole('button', { name: 'Suggestion' }));

    await waitFor(() => expect(input).toHaveValue('Explain Angular signals'));
    expect(input).toHaveFocus();
  });

  it('should not populate the prompt when setPromptOnClick is false', async () => {
    await render(
      `<div ngpThread>
        <button
          ngpThreadSuggestion="Explain Angular signals"
          ngpThreadSuggestionSetPromptOnClick="false"
        >
          Suggestion
        </button>
        <div ngpPromptComposer>
          <input ngpPromptComposerInput />
        </div>
      </div>`,
      {
        imports: [NgpThread, NgpThreadSuggestion, NgpPromptComposer, NgpPromptComposerInput],
      },
    );

    const input = screen.getByRole('textbox');

    await userEvent.click(screen.getByRole('button', { name: 'Suggestion' }));

    expect(input).toHaveValue('');
  });

  it('should do nothing when the suggestion is empty', async () => {
    await render(
      `<div ngpThread>
        <button ngpThreadSuggestion>Suggestion</button>
        <div ngpPromptComposer>
          <input ngpPromptComposerInput />
        </div>
      </div>`,
      {
        imports: [NgpThread, NgpThreadSuggestion, NgpPromptComposer, NgpPromptComposerInput],
      },
    );

    const input = screen.getByRole('textbox');

    await userEvent.click(screen.getByRole('button', { name: 'Suggestion' }));

    expect(input).toHaveValue('');
  });
});
