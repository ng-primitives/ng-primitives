import { fireEvent, render } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { RadioGroup, RadioItemFixture } from './radio-forms.fixture';

describe('RadioGroup (reusable component) — standalone', () => {
  it('renders with initial unselected state', async () => {
    const { getByRole } = await render(
      `
      <app-radio-group>
        <app-radio-item value="1">One</app-radio-item>
        <app-radio-item value="2">Two</app-radio-item>
      </app-radio-group>
      `,
      { imports: [RadioGroup, RadioItemFixture] },
    );

    expect(getByRole('radio', { name: 'One' })).not.toHaveAttribute('data-checked');
    expect(getByRole('radio', { name: 'Two' })).not.toHaveAttribute('data-checked');
  });

  it('selects an item on click', async () => {
    const { getByRole } = await render(
      `
      <app-radio-group>
        <app-radio-item value="1">One</app-radio-item>
        <app-radio-item value="2">Two</app-radio-item>
      </app-radio-group>
      `,
      { imports: [RadioGroup, RadioItemFixture] },
    );

    const one = getByRole('radio', { name: 'One' });
    fireEvent.click(one);

    expect(one).toHaveAttribute('data-checked', '');
    expect(one).toHaveAttribute('aria-checked', 'true');
    expect(getByRole('radio', { name: 'Two' })).not.toHaveAttribute('data-checked');
  });

  it('moves selection when a different item is clicked', async () => {
    const { getByRole } = await render(
      `
      <app-radio-group>
        <app-radio-item value="1">One</app-radio-item>
        <app-radio-item value="2">Two</app-radio-item>
      </app-radio-group>
      `,
      { imports: [RadioGroup, RadioItemFixture] },
    );

    const one = getByRole('radio', { name: 'One' });
    const two = getByRole('radio', { name: 'Two' });

    fireEvent.click(one);
    expect(one).toHaveAttribute('data-checked', '');

    fireEvent.click(two);
    expect(two).toHaveAttribute('data-checked', '');
    expect(one).not.toHaveAttribute('data-checked');
  });

  it('does not select a disabled item on click', async () => {
    const { getByRole } = await render(
      `
      <app-radio-group>
        <app-radio-item value="1">One</app-radio-item>
        <app-radio-item value="2" disabled="true">Two</app-radio-item>
      </app-radio-group>
      `,
      { imports: [RadioGroup, RadioItemFixture] },
    );

    const two = getByRole('radio', { name: 'Two' });
    expect(two).toHaveAttribute('data-disabled', '');

    fireEvent.click(two);
    expect(two).not.toHaveAttribute('data-checked');
  });
});
