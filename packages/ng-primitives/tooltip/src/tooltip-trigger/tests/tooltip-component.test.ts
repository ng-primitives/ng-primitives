import { Component, Directive, input } from '@angular/core';
import { fireEvent, render, waitFor } from '@testing-library/angular';
import {
  injectTooltipContext,
  injectTooltipTriggerState,
  NgpTooltip,
  NgpTooltipTrigger,
} from 'ng-primitives/tooltip';
import { afterEach, describe, expect, it } from 'vitest';

/**
 * Inline fixture mirroring the reusable tooltip component in
 * `apps/components/src/app/pages/reusable-components/tooltip`. The tooltip
 * content is rendered by a component that pulls its text from the tooltip
 * context, and the trigger directive wires the content into the underlying
 * `NgpTooltipTrigger`.
 */
@Component({
  selector: 'app-tooltip',
  hostDirectives: [NgpTooltip],
  template: `
    {{ content() }}
  `,
})
class TooltipContent {
  /** Access the tooltip context where the content is stored. */
  protected readonly content = injectTooltipContext<string>();
}

@Directive({
  selector: '[appTooltipTrigger]',
  hostDirectives: [
    {
      directive: NgpTooltipTrigger,
      inputs: [
        'ngpTooltipTriggerDisabled:appTooltipTriggerDisabled',
        'ngpTooltipTriggerShowDelay:appTooltipTriggerShowDelay',
        'ngpTooltipTriggerHideDelay:appTooltipTriggerHideDelay',
        'ngpTooltipTriggerContext:appTooltipTrigger',
      ],
    },
  ],
})
class TooltipTrigger {
  /** Access the tooltip trigger state. */
  private readonly tooltipTrigger = injectTooltipTriggerState();

  /** Define the content of the tooltip. */
  readonly content = input.required<string>({ alias: 'appTooltipTrigger' });

  constructor() {
    this.tooltipTrigger().setTooltip(TooltipContent);
  }
}

describe('Tooltip (reusable component) - standalone', () => {
  afterEach(() => {
    // NgpTooltip is applied as a host directive on <app-tooltip>, so the tooltip
    // renders as an <app-tooltip role="tooltip"> element rather than an
    // [ngpTooltip] element. Clean those up between tests.
    document.querySelectorAll('app-tooltip, [role="tooltip"]').forEach(el => el.remove());
  });

  it('shows the tooltip content on hover', async () => {
    const { getByRole } = await render(
      `<button appTooltipTrigger="Tooltip content here" appTooltipTriggerShowDelay="0">Show tooltip</button>`,
      { imports: [TooltipTrigger] },
    );

    fireEvent.mouseEnter(getByRole('button'));

    await waitFor(() => {
      // the tooltip renders into a portal on document.body, outside the container
      const tooltip = document.querySelector('[role="tooltip"]') as HTMLElement;
      expect(tooltip).toBeInTheDocument();
      expect(tooltip.textContent?.trim()).toBe('Tooltip content here');
    });
  });

  it('shows the tooltip content on focus', async () => {
    const { getByRole } = await render(
      `<button appTooltipTrigger="Focus content" appTooltipTriggerShowDelay="0">Show tooltip</button>`,
      { imports: [TooltipTrigger] },
    );

    fireEvent.focus(getByRole('button'));

    await waitFor(() => {
      const tooltip = document.querySelector('[role="tooltip"]') as HTMLElement;
      expect(tooltip?.textContent?.trim()).toBe('Focus content');
    });
  });

  it('links the trigger to the tooltip via aria-describedby while open', async () => {
    const { getByRole } = await render(
      `<button appTooltipTrigger="Described content" appTooltipTriggerShowDelay="0">Show tooltip</button>`,
      { imports: [TooltipTrigger] },
    );

    const trigger = getByRole('button');
    fireEvent.mouseEnter(trigger);

    await waitFor(() => {
      const tooltip = document.querySelector('[role="tooltip"]') as HTMLElement;
      const id = tooltip?.getAttribute('id');
      expect(id).toBeTruthy();
      expect(trigger.getAttribute('aria-describedby')).toBe(id);
    });
  });

  it('hides the tooltip on mouseleave', async () => {
    const { getByRole } = await render(
      `<button appTooltipTrigger="Hover content" appTooltipTriggerShowDelay="0" appTooltipTriggerHideDelay="0">Show tooltip</button>`,
      { imports: [TooltipTrigger] },
    );

    const trigger = getByRole('button');
    fireEvent.mouseEnter(trigger);

    await waitFor(() => {
      expect(document.querySelector('[role="tooltip"]')).toBeInTheDocument();
    });

    fireEvent.mouseLeave(trigger);

    await waitFor(() => {
      expect(document.querySelector('[role="tooltip"]')).not.toBeInTheDocument();
    });
  });

  it('closes the tooltip when Escape is pressed', async () => {
    const { getByRole } = await render(
      `<button appTooltipTrigger="Escape content" appTooltipTriggerShowDelay="0">Show tooltip</button>`,
      { imports: [TooltipTrigger] },
    );

    fireEvent.mouseEnter(getByRole('button'));

    await waitFor(() => {
      expect(document.querySelector('[role="tooltip"]')).toBeInTheDocument();
    });

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => {
      expect(document.querySelector('[role="tooltip"]')).not.toBeInTheDocument();
    });
  });

  it('does not show the tooltip on hover when disabled', async () => {
    const { getByRole } = await render(
      `<button appTooltipTrigger="Disabled content" appTooltipTriggerDisabled="true" appTooltipTriggerShowDelay="0">Show tooltip</button>`,
      { imports: [TooltipTrigger] },
    );

    fireEvent.mouseEnter(getByRole('button'));

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(document.querySelector('[role="tooltip"]')).not.toBeInTheDocument();
  });
});
