import { render, waitFor } from '@testing-library/angular';
import { NgpVisuallyHidden } from './visually-hidden';

describe('NgpVisuallyHidden', () => {
  it('should apply the styles to hide the element', async () => {
    const container = await render(`<div ngpVisuallyHidden>Hidden</div>`, {
      imports: [NgpVisuallyHidden],
    });

    const element = container.getByText('Hidden') as HTMLElement;

    await waitFor(() => {
      expect(element.style.position).toBe('absolute');
      expect(element.style.width).toBe('1px');
      expect(element.style.height).toBe('1px');
      expect(element.style.overflow).toBe('hidden');
      expect(element.style.whiteSpace).toBe('nowrap');
      expect(element.style.wordWrap).toBe('normal');
    });
  });

  it('should merge the styles with the host element', async () => {
    const container = await render(`<div ngpVisuallyHidden style="color: red;">Hidden</div>`, {
      imports: [NgpVisuallyHidden],
    });

    const element = container.getByText('Hidden') as HTMLElement;

    await waitFor(() => {
      expect(element.style.position).toBe('absolute');
      expect(element.style.width).toBe('1px');
      expect(element.style.height).toBe('1px');
      expect(element.style.overflow).toBe('hidden');
      expect(element.style.whiteSpace).toBe('nowrap');
      expect(element.style.color).toBe('red');
    });
  });
});
