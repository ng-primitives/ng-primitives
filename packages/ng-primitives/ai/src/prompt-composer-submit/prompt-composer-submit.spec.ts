import { render } from '@testing-library/angular';
import { NgpPromptComposerSubmit } from './prompt-composer-submit';

describe('NgpPromptComposerSubmit', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpPromptComposerSubmit></div>`, {
      imports: [NgpPromptComposerSubmit],
    });
  });
});
