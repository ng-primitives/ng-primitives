import { render } from '@testing-library/angular';
import { NgpPromptComposer } from './prompt-composer';

describe('NgpPromptComposer', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpPromptComposer></div>`, {
      imports: [NgpPromptComposer],
    });
  });
});
