import { Component, Directive } from '@angular/core';
import { By } from '@angular/platform-browser';
import { fireEvent, render, screen, waitFor } from '@testing-library/angular';
import {
  injectPopoverTriggerState,
  NgpPopover,
  NgpPopoverTrigger,
  ngpPopover,
  providePopoverConfig,
  providePopoverState,
} from 'ng-primitives/popover';
import { NgpTooltip, NgpTooltipTrigger } from 'ng-primitives/tooltip';
import { afterEach, describe, expect, it } from 'vitest';

@Directive({
  selector: '[testPopoverState]',
})
class PopoverStateProbe {
  readonly state = injectPopoverTriggerState();
}

function getPopoverState(fixture: { debugElement: import('@angular/core').DebugElement }) {
  return fixture.debugElement.query(By.directive(PopoverStateProbe)).injector.get(PopoverStateProbe)
    .state;
}

function getPopover(): HTMLElement | null {
  return document.querySelector('[role="dialog"]');
}

describe('NgpPopoverTrigger behaviours relied on by wrappers', () => {
  afterEach(() => {
    document.querySelectorAll('[role="dialog"], [role="tooltip"]').forEach(el => el.remove());
  });

  describe('scrollBehavior', () => {
    @Directive({
      selector: '[testClosingPopover]',
      hostDirectives: [
        {
          directive: NgpPopoverTrigger,
          inputs: [
            'ngpPopoverTrigger:testClosingPopover',
            'ngpPopoverTriggerScrollBehavior:testClosingPopoverScrollBehavior',
          ],
        },
      ],
      providers: [providePopoverConfig({ scrollBehavior: 'close' })],
    })
    class ClosingPopoverTrigger {}

    async function renderScrollable(scrollBehavior = '') {
      return render(
        `
          <div style="height: 100px; overflow: auto;" data-testid="scroller">
            <button [testClosingPopover]="content" ${scrollBehavior}>Open</button>
            <div style="height: 400px;"></div>
          </div>

          <ng-template #content>
            <div ngpPopover>Popover content</div>
          </ng-template>
        `,
        { imports: [ClosingPopoverTrigger, NgpPopover] },
      );
    }

    it('should close on ancestor scroll when the wrapper provides scrollBehavior close', async () => {
      const { getByRole, getByTestId } = await renderScrollable();

      fireEvent.click(getByRole('button'));
      await waitFor(() => expect(getPopover()).toBeInTheDocument());

      getByTestId('scroller').dispatchEvent(new Event('scroll'));

      await waitFor(() => expect(getPopover()).not.toBeInTheDocument());
    });

    it('should stay open on ancestor scroll when the input overrides the config with reposition', async () => {
      const { getByRole, getByTestId } = await renderScrollable(
        'testClosingPopoverScrollBehavior="reposition"',
      );

      fireEvent.click(getByRole('button'));
      await waitFor(() => expect(getPopover()).toBeInTheDocument());

      getByTestId('scroller').dispatchEvent(new Event('scroll'));

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(getPopover()).toBeInTheDocument();
    });
  });

  it('should stay open while a tooltip inside it opens', async () => {
    const { getByRole } = await render(
      `
        <button [ngpPopoverTrigger]="content">Open</button>

        <ng-template #content>
          <div ngpPopover>
            <button [ngpTooltipTrigger]="tooltip" ngpTooltipTriggerShowDelay="0">Inner</button>
          </div>
        </ng-template>

        <ng-template #tooltip>
          <div ngpTooltip>Tooltip content</div>
        </ng-template>
      `,
      { imports: [NgpPopoverTrigger, NgpPopover, NgpTooltipTrigger, NgpTooltip] },
    );

    fireEvent.click(getByRole('button', { name: 'Open' }));
    await waitFor(() => expect(getPopover()).toBeInTheDocument());

    fireEvent.mouseEnter(screen.getByRole('button', { name: 'Inner' }));
    await waitFor(() => expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument());

    await new Promise(resolve => setTimeout(resolve, 100));
    expect(getPopover()).toBeInTheDocument();
  });

  it('should leave focus on the trigger when the content uses ngpPopover() without a focus trap', async () => {
    @Component({
      selector: 'test-untrapped-popover',
      providers: [providePopoverState()],
      template: `
        <button>Inside</button>
      `,
    })
    class UntrappedPopover {
      constructor() {
        ngpPopover({});
      }
    }

    @Component({
      imports: [NgpPopoverTrigger, PopoverStateProbe],
      template: `
        <button [ngpPopoverTrigger]="popover" testPopoverState>Open</button>
      `,
    })
    class Host {
      readonly popover = UntrappedPopover;
    }

    const { getByRole } = await render(Host);
    const trigger = getByRole('button', { name: 'Open' });

    trigger.focus();
    fireEvent.click(trigger);

    await waitFor(() => expect(getPopover()).toBeInTheDocument());
    expect(getPopover()!.tagName.toLowerCase()).toBe('test-untrapped-popover');

    await new Promise(resolve => setTimeout(resolve, 100));
    expect(trigger).toHaveFocus();
  });

  it('should keep the popover open when show() is called during its exit animation', async () => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes test-popover-exit { from { opacity: 1; } to { opacity: 0; } }
      [ngpPopover][data-exit] { animation: test-popover-exit 300ms; }
    `;
    document.head.appendChild(style);

    try {
      const { fixture } = await render(
        `
          <button [ngpPopoverTrigger]="content" testPopoverState>Open</button>

          <ng-template #content>
            <div ngpPopover>Popover content</div>
          </ng-template>
        `,
        { imports: [NgpPopoverTrigger, NgpPopover, PopoverStateProbe] },
      );
      const state = getPopoverState(fixture);

      state().show();
      await waitFor(() => expect(getPopover()).toBeInTheDocument());

      state().hide();
      await waitFor(() => expect(getPopover()).toHaveAttribute('data-exit'));

      state().show();

      // Outlast the exit animation, which would have removed the popover had it run on.
      await new Promise(resolve => setTimeout(resolve, 600));
      expect(getPopover()).toBeInTheDocument();
      expect(getPopover()).not.toHaveAttribute('data-exit');
      expect(state().open()).toBe(true);
    } finally {
      style.remove();
    }
  });

  it('should expose the rendered popover elements through the overlay while open', async () => {
    const { fixture, getByRole } = await render(
      `
        <button [ngpPopoverTrigger]="content" testPopoverState>Open</button>

        <ng-template #content>
          <div ngpPopover>Popover content</div>
        </ng-template>
      `,
      { imports: [NgpPopoverTrigger, NgpPopover, PopoverStateProbe] },
    );
    const state = getPopoverState(fixture);

    fireEvent.click(getByRole('button'));
    await waitFor(() => expect(getPopover()).toBeInTheDocument());

    expect(state().overlay()!.getElements()).toEqual([getPopover()]);
  });

  it('should expose the transform origin as a CSS variable on the popover', async () => {
    const { getByRole } = await render(
      `
        <button [ngpPopoverTrigger]="content" ngpPopoverTriggerPlacement="top">Open</button>

        <ng-template #content>
          <div ngpPopover>Popover content</div>
        </ng-template>
      `,
      { imports: [NgpPopoverTrigger, NgpPopover] },
    );

    fireEvent.click(getByRole('button'));

    // A top-placed popover grows out of its bottom edge, towards the trigger.
    await waitFor(() =>
      expect(getPopover()!.style.getPropertyValue('--ngp-popover-transform-origin')).toContain(
        'bottom',
      ),
    );
  });
});
