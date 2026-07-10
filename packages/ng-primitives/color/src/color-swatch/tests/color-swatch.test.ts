import { render } from '@testing-library/angular';
import { Color, NgpColorPicker, NgpColorSwatch } from 'ng-primitives/color';
import { describe, expect, it } from 'vitest';

describe('NgpColorSwatch', () => {
  it('renders as an image with a hex label and exposes the color as a CSS var', async () => {
    const { getByTestId } = await render(
      `<div [ngpColorSwatch]="color" data-testid="swatch"></div>`,
      {
        imports: [NgpColorSwatch],
        componentProperties: { color: Color.parse('#00ff00') },
      },
    );
    const el = getByTestId('swatch');
    expect(el).toHaveAttribute('role', 'img');
    expect(el).toHaveAttribute('aria-label', '#00ff00');
    expect(el.style.getPropertyValue('--ngp-color-swatch-color')).toBe('rgba(0, 255, 0, 1)');
  });

  it('renders a translucent color', async () => {
    const { getByTestId } = await render(
      `<div [ngpColorSwatch]="color" data-testid="swatch"></div>`,
      {
        imports: [NgpColorSwatch],
        componentProperties: { color: Color.parse('rgba(255,0,0,0.5)') },
      },
    );
    expect(getByTestId('swatch').style.getPropertyValue('--ngp-color-swatch-color')).toBe(
      'rgba(255, 0, 0, 0.5)',
    );
  });

  it('uses a custom label when provided', async () => {
    const { getByTestId } = await render(
      `<div [ngpColorSwatch]="color" ngpColorSwatchLabel="Black" data-testid="swatch"></div>`,
      { imports: [NgpColorSwatch], componentProperties: { color: Color.parse('#000000') } },
    );
    expect(getByTestId('swatch')).toHaveAttribute('aria-label', 'Black');
  });

  it('falls back to the parent picker value', async () => {
    const { getByTestId } = await render(
      `<div ngpColorPicker [ngpColorPickerValue]="color">
         <div ngpColorSwatch data-testid="swatch"></div>
       </div>`,
      {
        imports: [NgpColorPicker, NgpColorSwatch],
        componentProperties: { color: Color.parse('#3366cc') },
      },
    );
    expect(getByTestId('swatch')).toHaveAttribute('aria-label', '#3366cc');
  });
});
