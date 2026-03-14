import { render, waitFor } from '@testing-library/angular';
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

    await waitFor(() => {
      expect(textarea.hasAttribute('disabled')).toBe(true);
      expect(textarea.getAttribute('data-disabled')).toBe('');
    });
  });

  it('should set data-hover on mouseenter and remove on mouseleave', async () => {
    const { container, fixture } = await render(`<textarea ngpTextarea></textarea>`, {
      imports: [NgpTextarea],
    });

    const textarea = container.querySelector('textarea')!;

    expect(textarea.getAttribute('data-hover')).toBeNull();

    textarea.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    fixture.detectChanges();
    expect(textarea).toHaveAttribute('data-hover', '');

    textarea.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    fixture.detectChanges();
    expect(textarea.getAttribute('data-hover')).toBeNull();
  });

  it('should set data-focus on focus and remove on blur', async () => {
    const { container, fixture } = await render(`<textarea ngpTextarea></textarea>`, {
      imports: [NgpTextarea],
    });

    const textarea = container.querySelector('textarea')!;

    expect(textarea.getAttribute('data-focus')).toBeNull();

    // CDK FocusMonitor requires spoofing activeElement for jsdom
    Object.defineProperty(document, 'activeElement', { value: textarea, writable: true });
    textarea.dispatchEvent(new FocusEvent('focus', { bubbles: false }));
    fixture.detectChanges();
    expect(textarea).toHaveAttribute('data-focus', '');

    Object.defineProperty(document, 'activeElement', { value: document.body, writable: true });
    textarea.dispatchEvent(new FocusEvent('blur', { bubbles: false }));
    fixture.detectChanges();
    expect(textarea.getAttribute('data-focus')).toBeNull();
  });

  it('should not set data-hover when disabled', async () => {
    const { container, fixture } = await render(
      `<textarea ngpTextarea [disabled]="true"></textarea>`,
      {
        imports: [NgpTextarea],
      },
    );

    const textarea = container.querySelector('textarea')!;

    textarea.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    fixture.detectChanges();
    expect(textarea.getAttribute('data-hover')).toBeNull();
  });
});
