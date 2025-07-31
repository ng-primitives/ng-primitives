import { render } from '@testing-library/angular';
import { NgpTextarea } from './textarea';

describe('NgpTextarea', () => {
  it('should initialise correctly', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const container = await render(`<div ngpTextarea></div>`, {
      imports: [NgpTextarea],
    });
  });
});
