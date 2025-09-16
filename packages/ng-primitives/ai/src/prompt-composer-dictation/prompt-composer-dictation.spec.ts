import { render } from '@testing-library/angular';
import { NgpPromptComposerDictation } from './prompt-composer-dictation';

describe('NgpPromptComposerDictation', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpPromptComposerDictation></div>`, {
      imports: [NgpPromptComposerDictation],
    });
  });
});
