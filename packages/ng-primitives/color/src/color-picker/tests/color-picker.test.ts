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
    `<div ngpColorPicker [ngpColorPickerDefaultValue]="value" (ngpColorPickerValueChange)="onChange($event)">
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

  it('round-trips a two-way binding across children', async () => {
    const { getByTestId, fixture } = await render(
      `<div ngpColorPicker [(ngpColorPickerValue)]="value">
         <div ngpColorSlider ngpColorSliderChannel="hue">
           <div ngpColorSliderTrack></div>
           <div ngpColorSliderThumb data-testid="thumb"></div>
         </div>
         <input ngpColorField data-testid="field" />
       </div>`,
      { imports, componentProperties: { value: Color.parse('#ff0000') } },
    );
    const thumb = getByTestId('thumb');
    const field = getByTestId('field') as HTMLInputElement;
    expect(thumb).toHaveAttribute('aria-valuenow', '0');

    fireEvent.keyDown(thumb, { key: 'ArrowUp' });

    // two-way binding writes the value back, so the shared value advances and the
    // sibling field re-renders from it.
    expect(thumb).toHaveAttribute('aria-valuenow', '1');
    expect(field.value).not.toBe('#ff0000');
    expect(fixture.componentInstance.value.getChannelValue('hue')).toBe(1);
  });

  it('stays put when controlled and the parent does not write the value back', async () => {
    const onChange = vi.fn<(c: Color) => void>();
    const view = await render(
      `<div ngpColorPicker [ngpColorPickerValue]="value" (ngpColorPickerValueChange)="onChange($event)">
         <div ngpColorSlider ngpColorSliderChannel="hue">
           <div ngpColorSliderTrack></div>
           <div ngpColorSliderThumb data-testid="thumb"></div>
         </div>
         <input ngpColorField data-testid="field" />
       </div>`,
      { imports, componentProperties: { value: Color.parse('#ff0000'), onChange } },
    );
    const thumb = view.getByTestId('thumb');
    const field = view.getByTestId('field') as HTMLInputElement;

    fireEvent.keyDown(thumb, { key: 'ArrowUp' });

    // the picker notifies via valueChange, but because it is controlled and the
    // parent never writes the new value back, the shared value must not drift.
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(thumb).toHaveAttribute('aria-valuenow', '0');
    expect(field.value).toBe('#ff0000');
  });
});
