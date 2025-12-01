import { render } from '@testing-library/angular';
import { NgpTextarea } from './textarea';

describe('NgpTextarea', () => {
  it('should set a generated id when none is provided', async () => {
    const { container } = await render(`<textarea ngpTextarea></textarea>`, {
      imports: [NgpTextarea],
    });

    const textarea = container.querySelector('textarea')!;
    expect(textarea.id).toMatch(/^ngp-textarea/);
  });

  it('should apply the provided id', async () => {
    const { container } = await render(`<textarea ngpTextarea [id]="id"></textarea>`, {
      imports: [NgpTextarea],
      componentProperties: { id: 'custom-id' },
    });

    const textarea = container.querySelector('textarea')!;
    expect(textarea.id).toBe('custom-id');
  });

  it('should reflect disabled state', async () => {
    const { container, rerender } = await render(
      `<textarea ngpTextarea [disabled]="disabled"></textarea>`,
      {
        imports: [NgpTextarea],
        componentProperties: { disabled: false },
      },
    );

    const textarea = container.querySelector('textarea')!;

    expect(textarea.hasAttribute('disabled')).toBe(false);
    expect(textarea.getAttribute('data-disabled')).toBeNull();

    await rerender({ componentProperties: { disabled: true } });

    expect(textarea.hasAttribute('disabled')).toBe(true);
    expect(textarea.getAttribute('data-disabled')).toBe('');
  });
});
