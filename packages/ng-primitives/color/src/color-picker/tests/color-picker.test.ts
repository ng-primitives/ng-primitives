import { fireEvent, render } from '@testing-library/angular';
import {
  Color,
  NgpColorField,
  NgpColorPicker,
  NgpColorSlider,
  NgpColorSliderThumb,
  NgpColorSliderTrack,
} from 'ng-primitives/color';
import { describe, expect, it, vi } from 'vitest';

const imports = [
  NgpColorPicker,
  NgpColorSlider,
  NgpColorSliderTrack,
  NgpColorSliderThumb,
  NgpColorField,
];

async function setup(value: Color = Color.parse('#ff0000')) {
  const onChange = vi.fn<(c: Color) => void>();
  const view = await render(
    `<div ngpColorPicker [ngpColorPickerValue]="value" (ngpColorPickerValueChange)="onChange($event)">
       <div ngpColorSlider ngpColorSliderChannel="hue">
         <div ngpColorSliderTrack></div>
         <div ngpColorSliderThumb data-testid="thumb"></div>
       </div>
       <input ngpColorField data-testid="field" />
     </div>`,
    { imports, componentProperties: { value, onChange } },
  );
  return {
    ...view,
    onChange,
    thumb: view.getByTestId('thumb'),
    field: view.getByTestId('field') as HTMLInputElement,
    last: () => onChange.mock.lastCall?.[0] as Color,
  };
}

describe('NgpColorPicker coordination', () => {
  it('shares the picker value with all children', async () => {
    const { thumb, field } = await setup(Color.parse('#ff0000'));
    // hue slider: red -> hue 0
    expect(thumb).toHaveAttribute('aria-valuenow', '0');
    // hex field mirrors the same color
    expect(field.value).toBe('#ff0000');
  });

  it('propagates a child slider change to the picker and siblings', async () => {
    const { thumb, field, onChange, last } = await setup(Color.parse('#ff0000'));
    fireEvent.keyDown(thumb, { key: 'ArrowUp' });

    // picker emitted the new color
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(last().getChannelValue('hue')).toBe(1);
    // the sibling field re-rendered from the shared value
    expect(field.value).not.toBe('#ff0000');
  });

  it('propagates a child field change to the picker and siblings', async () => {
    const { thumb, field, onChange } = await setup(Color.parse('#ff0000'));
    fireEvent.focus(field);
    fireEvent.input(field, { target: { value: '#00ff00' } });
    fireEvent.blur(field);

    expect(onChange).toHaveBeenCalledTimes(1);
    // green -> hue 120, so the sibling slider thumb moved
    expect(thumb).toHaveAttribute('aria-valuenow', '120');
  });
});
