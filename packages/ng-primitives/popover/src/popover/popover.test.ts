import { Component } from '@angular/core';
import { fireEvent, render, waitFor } from '@testing-library/angular';
import { NgpPopover, type NgpPopoverPlacement, NgpPopoverTrigger } from 'ng-primitives/popover';
import { afterEach, describe, expect, it } from 'vitest';

@Component({
  template: `
    <button [ngpPopoverTrigger]="content">Open Popover</button>

    <ng-template #content>
      <div ngpPopover>Popover content</div>
    </ng-template>
  `,
  imports: [NgpPopoverTrigger, NgpPopover],
})
class PopoverTestComponent {}

describe('NgpPopover', () => {
  afterEach(() => {
    // Overlay content is attached to the document body, not the fixture, so remove
    // any leftover popovers in case a test ends with one still open.
    document.querySelectorAll('[ngpPopover]').forEach(el => el.remove());
  });

  it('should expose role="dialog" on the popover element', async () => {
    const { getByRole } = await render(PopoverTestComponent);
    fireEvent.click(getByRole('button'));

    await waitFor(() => {
      expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
    });

    const popover = document.querySelector('[ngpPopover]') as HTMLElement;
    expect(popover.getAttribute('role')).toBe('dialog');
  });

  it('should link the trigger to the popover via aria-describedby and a matching id', async () => {
    const { getByRole } = await render(PopoverTestComponent);
    const trigger = getByRole('button');
    fireEvent.click(trigger);

    // The popover must have a real, generated id (not empty) and the trigger must
    // describe it for assistive technology. Both bindings settle after render.
    await waitFor(() => {
      const popover = document.querySelector('[ngpPopover]') as HTMLElement | null;
      const id = popover?.getAttribute('id');
      expect(id).toBeTruthy();
      expect(trigger.getAttribute('aria-describedby')).toBe(id);
    });
  });

  it('should reflect the resolved placement value on data-placement', async () => {
    const { getByRole } = await render(PopoverTestComponent);
    fireEvent.click(getByRole('button'));

    // data-placement should carry the actual placement (e.g. "bottom"), not an empty string.
    await waitFor(() => {
      const popover = document.querySelector('[ngpPopover]') as HTMLElement | null;
      expect(popover?.getAttribute('data-placement')).toBeTruthy();
    });
  });

  it('should keep positioning CSS variables reactive when the popover repositions', async () => {
    @Component({
      template: `
        <button
          [ngpPopoverTrigger]="content"
          [ngpPopoverTriggerPlacement]="placement"
          [ngpPopoverTriggerFlip]="false"
        >
          Open
        </button>

        <ng-template #content>
          <div ngpPopover>Popover content</div>
        </ng-template>
      `,
      imports: [NgpPopoverTrigger, NgpPopover],
    })
    class PlacementTestComponent {
      placement: NgpPopoverPlacement = 'bottom';
    }

    const { fixture, getByRole } = await render(PlacementTestComponent);
    fireEvent.click(getByRole('button'));

    // The size middleware sets --ngp-popover-available-height once the popover positions.
    let initialHeight = '';
    await waitFor(() => {
      const popover = document.querySelector('[ngpPopover]') as HTMLElement;
      initialHeight = popover.style.getPropertyValue('--ngp-popover-available-height');
      expect(initialHeight).not.toBe('');
    });

    // Changing the placement repositions the popover, which recomputes the available
    // space. A frozen (non-reactive) binding captures the value once and would keep the
    // original height here. With flip disabled, top vs bottom yields different space.
    fixture.componentInstance.placement = 'top';
    fixture.detectChanges();

    await waitFor(() => {
      const popover = document.querySelector('[ngpPopover]') as HTMLElement;
      expect(popover.style.getPropertyValue('--ngp-popover-available-height')).not.toBe(
        initialHeight,
      );
    });
  });
});
