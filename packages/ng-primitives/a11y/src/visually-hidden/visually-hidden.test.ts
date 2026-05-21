import { render } from '@testing-library/angular';
import { NgpVisuallyHidden } from './visually-hidden';

describe('NgpVisuallyHidden', () => {
  it('should apply the styles to hide the element', async () => {
    const container = await render(`<div ngpVisuallyHidden>Hidden</div>`, {
      imports: [NgpVisuallyHidden],
    });

    const element = container.getByText('Hidden');
    expect(getComputedStyle(element).position).toBe('absolute');
    expect(getComputedStyle(element).width).toBe('1px');
    expect(getComputedStyle(element).height).toBe('1px');
    expect(getComputedStyle(element).margin).toBe('-1px');
    expect(getComputedStyle(element).padding).toBe('0px');
    expect(getComputedStyle(element).overflow).toBe('hidden');
    expect(getComputedStyle(element).clip).toBe('rect(0px, 0px, 0px, 0px)');
    expect(getComputedStyle(element).borderTopWidth).toBe('0px');
    expect(getComputedStyle(element).borderTopStyle).toBe('none');
    expect(getComputedStyle(element).whiteSpace).toBe('nowrap');
    expect(getComputedStyle(element).wordWrap).toBe('normal');
    expect(getComputedStyle(element).outlineWidth).toBe('0px');
    expect(getComputedStyle(element).outlineStyle).toBe('none');
    expect(getComputedStyle(element).insetInlineStart).toBe('0px');
  });

  it('should merge the styles with the host element', async () => {
    const container = await render(`<div ngpVisuallyHidden style="color: red;">Hidden</div>`, {
      imports: [NgpVisuallyHidden],
    });

    const element = container.getByText('Hidden');
    expect(getComputedStyle(element).position).toBe('absolute');
    expect(getComputedStyle(element).width).toBe('1px');
    expect(getComputedStyle(element).height).toBe('1px');
    expect(getComputedStyle(element).margin).toBe('-1px');
    expect(getComputedStyle(element).padding).toBe('0px');
    expect(getComputedStyle(element).overflow).toBe('hidden');
    expect(getComputedStyle(element).clip).toBe('rect(0px, 0px, 0px, 0px)');
    expect(getComputedStyle(element).borderTopWidth).toBe('0px');
    expect(getComputedStyle(element).borderTopStyle).toBe('none');
    expect(getComputedStyle(element).whiteSpace).toBe('nowrap');
    expect(getComputedStyle(element).wordWrap).toBe('normal');
    expect(getComputedStyle(element).outlineWidth).toBe('0px');
    expect(getComputedStyle(element).outlineStyle).toBe('none');
    expect(getComputedStyle(element).insetInlineStart).toBe('0px');
    expect(getComputedStyle(element).color).toBe('rgb(255, 0, 0)');
  });
});
