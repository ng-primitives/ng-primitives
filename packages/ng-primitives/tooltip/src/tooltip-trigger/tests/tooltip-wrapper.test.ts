import { Component, Directive, effect, input } from '@angular/core';
import { By } from '@angular/platform-browser';
import { fireEvent, render, waitFor } from '@testing-library/angular';
import {
  injectTooltipContext,
  injectTooltipTriggerState,
  NgpTooltip,
  NgpTooltipTrigger,
  provideTooltipConfig,
} from 'ng-primitives/tooltip';
import { afterEach, describe, expect, it } from 'vitest';

@Component({
  selector: 'test-tooltip-surface',
  hostDirectives: [NgpTooltip],
  // Floating UI writes `top`/`left`, which a statically positioned element ignores.
  host: { style: 'position: fixed; width: 120px; height: 40px;' },
  template: `
    {{ context() }}
  `,
})
class TooltipSurface {
  protected readonly context = injectTooltipContext<string>();
}

@Directive({
  selector: '[testTooltip]',
  hostDirectives: [
    {
      directive: NgpTooltipTrigger,
      inputs: ['ngpTooltipTriggerPlacement:testTooltipPlacement'],
    },
  ],
  providers: [provideTooltipConfig({ scrollBehavior: 'close' })],
})
class TooltipWrapper {
  readonly state = injectTooltipTriggerState();

  readonly label = input.required<string>({ alias: 'testTooltip' });

  constructor() {
    this.state().setTooltip(TooltipSurface);
    this.state().setOffset(30);
    this.state().setFlip(false);
    this.state().setShift(false);

    effect(() => this.state().setContext(this.label()));
  }
}

@Component({
  imports: [TooltipWrapper],
  template: `
    <div style="height: 100px; overflow: auto;" data-testid="scroller">
      <button [testTooltip]="label" testTooltipPlacement="bottom">Trigger</button>
      <div style="height: 400px;"></div>
    </div>
  `,
})
class TooltipWrapperHost {
  label = 'First';
}

async function renderWrapper() {
  const result = await render(TooltipWrapperHost);
  const state = result.fixture.debugElement
    .query(By.directive(TooltipWrapper))
    .injector.get(TooltipWrapper).state;

  return { ...result, state, trigger: result.getByRole('button') };
}

function getTooltip(): HTMLElement | null {
  return document.querySelector('test-tooltip-surface');
}

describe('NgpTooltipTrigger composed by a wrapper directive', () => {
  afterEach(() => {
    document.querySelectorAll('test-tooltip-surface, [role="tooltip"]').forEach(el => el.remove());
  });

  it('should keep positioning set through the state in the wrapper constructor', async () => {
    const { trigger } = await renderWrapper();

    fireEvent.mouseEnter(trigger);

    await waitFor(() => {
      const tooltip = getTooltip()!;
      expect(tooltip).toHaveAttribute('data-placement', 'bottom');
      expect(
        tooltip.getBoundingClientRect().top - trigger.getBoundingClientRect().bottom,
      ).toBeCloseTo(30, 0);
    });
  });

  it('should render and update the context set through the state while open', async () => {
    const { fixture, trigger } = await renderWrapper();

    fireEvent.mouseEnter(trigger);
    await waitFor(() => expect(getTooltip()).toHaveTextContent('First'));

    fixture.componentInstance.label = 'Second';
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    await waitFor(() => expect(getTooltip()).toHaveTextContent('Second'));
  });

  it('should honour a tooltip config provided by the wrapper directive', async () => {
    const { state, getByTestId } = await renderWrapper();

    state().show();
    await waitFor(() => expect(getTooltip()).toBeInTheDocument());

    getByTestId('scroller').dispatchEvent(new Event('scroll'));

    await waitFor(() => expect(getTooltip()).not.toBeInTheDocument());
  });

  it('should expose the transform origin as a CSS variable on the tooltip', async () => {
    const { trigger } = await renderWrapper();

    fireEvent.mouseEnter(trigger);

    // A bottom-placed tooltip grows out of its top edge, towards the trigger.
    await waitFor(() =>
      expect(getTooltip()!.style.getPropertyValue('--ngp-tooltip-transform-origin')).toContain(
        'top',
      ),
    );
  });

  it('should remove the tooltip without its exit animation when the overlay is hidden immediately', async () => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes test-tooltip-exit { from { opacity: 1; } to { opacity: 0; } }
      test-tooltip-surface[data-exit] { animation: test-tooltip-exit 10s; }
    `;
    document.head.appendChild(style);

    try {
      const { state, trigger } = await renderWrapper();

      fireEvent.mouseEnter(trigger);
      await waitFor(() => expect(getTooltip()).toBeInTheDocument());

      state().overlay()!.hideImmediate();

      await waitFor(() => expect(getTooltip()).not.toBeInTheDocument());
      expect(state().open()).toBe(false);
    } finally {
      style.remove();
    }
  });
});
