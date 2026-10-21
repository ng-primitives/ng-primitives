import { Component } from '@angular/core';
import { fireEvent, render } from '@testing-library/angular';
import {
  NgpToggleGroup,
  NgpToggleGroupItem,
  provideToggleGroupConfig,
} from 'ng-primitives/toggle-group';
import { describe, expect, it, vi } from 'vitest';

/** A group whose selection behaviour comes from the config rather than inputs. */
@Component({
  selector: 'app-segmented',
  hostDirectives: [
    {
      directive: NgpToggleGroup,
      outputs: ['ngpToggleGroupValueChange:valueChange'],
    },
  ],
  providers: [provideToggleGroupConfig({ type: 'single', allowDeselection: false })],
  template: '<ng-content />',
})
class Segmented {}

describe('NgpToggleGroup config', () => {
  it('should keep exactly one item selected when configured as single without deselection', async () => {
    const onValueChange = vi.fn();
    const { getByTestId } = await render(
      `<app-segmented (valueChange)="onValueChange($event)">
        <button data-testid="a" ngpToggleGroupItem ngpToggleGroupItemValue="a">A</button>
        <button data-testid="b" ngpToggleGroupItem ngpToggleGroupItemValue="b">B</button>
      </app-segmented>`,
      { imports: [Segmented, NgpToggleGroupItem], componentProperties: { onValueChange } },
    );
    const a = getByTestId('a');
    const b = getByTestId('b');

    fireEvent.click(a);
    expect(a).toHaveAttribute('data-selected');
    expect(onValueChange).toHaveBeenLastCalledWith(['a']);

    fireEvent.click(a);
    expect(a).toHaveAttribute('data-selected');
    expect(onValueChange).toHaveBeenCalledTimes(1);

    fireEvent.click(b);
    expect(b).toHaveAttribute('data-selected');
    expect(a).not.toHaveAttribute('data-selected');
    expect(onValueChange).toHaveBeenLastCalledWith(['b']);
  });

  it('should not select an individually disabled item', async () => {
    const onValueChange = vi.fn();
    const { getByTestId } = await render(
      `<app-segmented (valueChange)="onValueChange($event)">
        <button data-testid="a" ngpToggleGroupItem ngpToggleGroupItemValue="a">A</button>
        <button data-testid="b" ngpToggleGroupItem ngpToggleGroupItemValue="b" ngpToggleGroupItemDisabled>B</button>
      </app-segmented>`,
      { imports: [Segmented, NgpToggleGroupItem], componentProperties: { onValueChange } },
    );
    const b = getByTestId('b');

    fireEvent.click(b);

    expect(b).toHaveAttribute('data-disabled');
    expect(b).not.toHaveAttribute('data-selected');
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
