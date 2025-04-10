import { render } from '@testing-library/angular';
import { NgpTextarea } from './textarea';

describe('NgpTextarea', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpTextarea></div>`, {
      imports: [NgpTextarea],
    });
  });
});
