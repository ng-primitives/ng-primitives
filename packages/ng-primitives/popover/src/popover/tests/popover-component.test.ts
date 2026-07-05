import { Component, Directive, input } from '@angular/core';
import { fireEvent, render, waitFor } from '@testing-library/angular';
import {
  injectPopoverContext,
  injectPopoverTriggerState,
  NgpPopover,
  NgpPopoverTrigger,
} from 'ng-primitives/popover';
import { afterEach, describe, expect, it } from 'vitest';

/**
 * Inline fixture mirroring
 * apps/components/src/app/pages/reusable-components/popover.
 *
 * The `app-popover` component composes NgpPopover as a host directive and renders
 * a string passed through the popover context. The `appPopoverTrigger` directive
 * composes NgpPopoverTrigger and points it at the Popover component.
 */
@Component({
  selector: 'app-popover',
  hostDirectives: [NgpPopover],
  template: `
    {{ content() }}
  `,
})
class Popover {
  readonly content = injectPopoverContext();
}

@Directive({
  selector: '[appPopoverTrigger]',
  hostDirectives: [
    {
      directive: NgpPopoverTrigger,
      inputs: [
        'ngpPopoverTriggerDisabled:appPopoverTriggerDisabled',
        'ngpPopoverTriggerPlacement:appPopoverTriggerPlacement',
        'ngpPopoverTriggerContext:appPopoverTrigger',
      ],
    },
  ],
})
class PopoverTrigger {
  private readonly popoverTrigger = injectPopoverTriggerState();

  readonly content = input.required<string>({ alias: 'appPopoverTrigger' });

  constructor() {
    this.popoverTrigger().popover.set(Popover);
  }
}

describe('Popover (reusable component) — standalone', () => {
  afterEach(() => {
    // Overlay content attaches to the document body, not the fixture.
    document.querySelectorAll('app-popover').forEach(el => el.remove());
  });

  it('renders the trigger closed with aria-expanded="false"', async () => {
    const { getByRole } = await render(
      `<button appPopoverTrigger="Popover content">Popover</button>`,
      { imports: [PopoverTrigger] },
    );
    const trigger = getByRole('button');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(document.querySelector('app-popover')).not.toBeInTheDocument();
  });

  it('opens the popover and renders the context content on click', async () => {
    const { getByRole } = await render(
      `<button appPopoverTrigger="Popover content">Popover</button>`,
      { imports: [PopoverTrigger] },
    );
    const trigger = getByRole('button');
    fireEvent.click(trigger);

    await waitFor(() => {
      const popover = document.querySelector('app-popover');
      expect(popover).toBeInTheDocument();
      expect(popover!.textContent).toContain('Popover content');
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });
  });

  it('exposes role="dialog" on the popover content', async () => {
    const { getByRole } = await render(
      `<button appPopoverTrigger="Popover content">Popover</button>`,
      { imports: [PopoverTrigger] },
    );
    fireEvent.click(getByRole('button'));

    await waitFor(() => {
      expect(document.querySelector('app-popover')).toHaveAttribute('role', 'dialog');
    });
  });

  it('toggles the popover closed when the trigger is clicked again', async () => {
    const { getByRole } = await render(
      `<button appPopoverTrigger="Popover content">Popover</button>`,
      { imports: [PopoverTrigger] },
    );
    const trigger = getByRole('button');

    fireEvent.click(trigger);
    await waitFor(() => {
      expect(document.querySelector('app-popover')).toBeInTheDocument();
    });

    fireEvent.click(trigger);
    await waitFor(() => {
      expect(document.querySelector('app-popover')).not.toBeInTheDocument();
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
  });

  it('closes on Escape', async () => {
    const { getByRole } = await render(
      `<button appPopoverTrigger="Popover content">Popover</button>`,
      { imports: [PopoverTrigger] },
    );
    fireEvent.click(getByRole('button'));
    await waitFor(() => {
      expect(document.querySelector('app-popover')).toBeInTheDocument();
    });

    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => {
      expect(document.querySelector('app-popover')).not.toBeInTheDocument();
    });
  });

  it('closes on outside click', async () => {
    const { getByRole } = await render(
      `<button appPopoverTrigger="Popover content">Popover</button>`,
      { imports: [PopoverTrigger] },
    );
    fireEvent.click(getByRole('button'));
    await waitFor(() => {
      expect(document.querySelector('app-popover')).toBeInTheDocument();
    });

    fireEvent.mouseUp(document.body);
    await waitFor(() => {
      expect(document.querySelector('app-popover')).not.toBeInTheDocument();
    });
  });

  it('returns focus to the trigger when closed via Escape', async () => {
    const { getByRole } = await render(
      `<button appPopoverTrigger="Popover content">Popover</button>`,
      { imports: [PopoverTrigger] },
    );
    const trigger = getByRole('button');
    trigger.focus();
    fireEvent.click(trigger);
    await waitFor(() => {
      expect(document.querySelector('app-popover')).toBeInTheDocument();
    });

    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => {
      expect(document.querySelector('app-popover')).not.toBeInTheDocument();
      expect(document.activeElement).toBe(trigger);
    });
  });

  it('does not open when the trigger is disabled', async () => {
    const { getByRole } = await render(
      `<button appPopoverTrigger="Popover content" [appPopoverTriggerDisabled]="true">Popover</button>`,
      { imports: [PopoverTrigger] },
    );
    const trigger = getByRole('button');
    fireEvent.click(trigger);

    await new Promise(resolve => setTimeout(resolve, 50));
    expect(document.querySelector('app-popover')).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
});
