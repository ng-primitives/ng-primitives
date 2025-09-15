import { render } from '@testing-library/angular';
import { NgpPromptComposerInput } from './prompt-composer-input';

describe('NgpPromptComposerInput', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpPromptComposerInput></div>`, {
      imports: [NgpPromptComposerInput],
    });
  });
});
