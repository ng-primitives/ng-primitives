import { render } from '@testing-library/angular';
import { NgpPagination } from './pagination';

describe('NgpPagination', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpPagination></div>`, {
      imports: [NgpPagination],
    });
  });
});
