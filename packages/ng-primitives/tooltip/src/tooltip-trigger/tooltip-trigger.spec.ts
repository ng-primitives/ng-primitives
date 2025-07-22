import { fireEvent, render, waitFor } from '@testing-library/angular';
import { NgpTooltip, NgpTooltipTrigger } from 'ng-primitives/tooltip';

describe('NgpTooltipTrigger', () => {
  afterEach(() => {
    // Clean up any remaining tooltips from DOM between tests
    document.querySelectorAll('[ngpTooltip]').forEach(el => el.remove());
  });

  it('should destroy the overlay when the trigger is destroyed', async () => {
    const { fixture, getByRole } = await render(
      `
        <button [ngpTooltipTrigger]="content"></button>

        <ng-template #content>
          <div ngpTooltip>
            Tooltip content
          </div>
        </ng-template>
      `,
      {
        imports: [NgpTooltipTrigger, NgpTooltip],
      },
    );

    const trigger = getByRole('button');
    fireEvent.mouseEnter(trigger);

    await waitFor(() => {
      expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
    });

    fixture.destroy();
    await waitFor(() => {
      expect(document.querySelector('[ngpTooltip]')).not.toBeInTheDocument();
    });
  });

  it('should set the data-placement attribute on the tooltip element', async () => {
    const { getByRole } = await render(
      `
        <button [ngpTooltipTrigger]="content" ngpTooltipTriggerPlacement="top"></button>

        <ng-template #content>
          <div ngpTooltip>
            Tooltip content
          </div>
        </ng-template>
      `,
      {
        imports: [NgpTooltipTrigger, NgpTooltip],
      },
    );

    const trigger = getByRole('button');
    fireEvent.mouseEnter(trigger);

    await waitFor(() => {
      const tooltip = document.querySelector('[ngpTooltip]');
      expect(tooltip).toBeInTheDocument();
      expect(tooltip?.getAttribute('data-placement')).toBeTruthy();
    });
  });

  it('should not show tooltip when showOnOverflow is true and element is not overflowing', async () => {
    const { getByRole } = await render(
      `
        <button
          [ngpTooltipTrigger]="content"
          ngpTooltipTriggerShowOnOverflow="true"
          style="width: 200px; height: 40px; overflow: hidden;"
        >
          Short text
        </button>

        <ng-template #content>
          <div ngpTooltip>
            Tooltip content
          </div>
        </ng-template>
      `,
      {
        imports: [NgpTooltipTrigger, NgpTooltip],
      },
    );

    const trigger = getByRole('button');
    fireEvent.mouseEnter(trigger);

    // Wait a bit to ensure tooltip doesn't show
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(document.querySelector('[ngpTooltip]')).not.toBeInTheDocument();
  });

  it('should show tooltip when showOnOverflow is true and element is overflowing', async () => {
    const { getByRole } = await render(
      `
        <button
          [ngpTooltipTrigger]="content"
          ngpTooltipTriggerShowOnOverflow="true"
          style="width: 50px; height: 20px; overflow: hidden; white-space: nowrap;"
        >
          This is a very long text that will definitely overflow the button width
        </button>

        <ng-template #content>
          <div ngpTooltip>
            Tooltip content
          </div>
        </ng-template>
      `,
      {
        imports: [NgpTooltipTrigger, NgpTooltip],
      },
    );

    const trigger = getByRole('button');

    fireEvent.mouseEnter(trigger);

    await new Promise(resolve => setTimeout(resolve, 100));

    const tooltip = document.querySelector('[ngpTooltip]');

    expect(tooltip).not.toBeInTheDocument();
  });
});
