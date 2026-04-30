import { fireEvent, render, waitFor } from '@testing-library/angular';
import { NgpTooltip, NgpTooltipTrigger, provideTooltipConfig } from 'ng-primitives/tooltip';
import { describe, expect, it, vi, afterEach } from 'vitest';

describe('NgpTooltipTrigger interactive hover behavior', () => {
  afterEach(() => {
    document.querySelectorAll('[ngpTooltip]').forEach(el => el.remove());
    vi.useRealTimers();
  });

  it('should keep tooltip open when moving from trigger to content when hoverableContent=true', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    const { getByRole } = await render(
      `
        <button
          [ngpTooltipTrigger]="content"
          ngpTooltipTriggerHideDelay="80"
          ngpTooltipTriggerHoverableContent="true"
        >
          Trigger
        </button>

        <ng-template #content>
          <div ngpTooltip>Tooltip content</div>
        </ng-template>
      `,
      { imports: [NgpTooltipTrigger, NgpTooltip] },
    );

    const trigger = getByRole('button');
    fireEvent.mouseEnter(trigger);

    await waitFor(() => {
      expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
    });

    fireEvent.mouseLeave(trigger);
    const tooltip = document.querySelector('[ngpTooltip]') as HTMLElement;
    fireEvent.mouseEnter(tooltip);
    vi.advanceTimersByTime(100);

    expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();

    fireEvent.mouseLeave(tooltip);
    vi.advanceTimersByTime(100);

    await waitFor(() => {
      expect(document.querySelector('[ngpTooltip]')).not.toBeInTheDocument();
    });
  });

  it('should close when hoverableContent=false even if pointer enters tooltip content', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    const { getByRole } = await render(
      `
        <button
          [ngpTooltipTrigger]="content"
          ngpTooltipTriggerHideDelay="0"
          ngpTooltipTriggerHoverableContent="false"
        >
          Trigger
        </button>

        <ng-template #content>
          <div ngpTooltip>Tooltip content</div>
        </ng-template>
      `,
      { imports: [NgpTooltipTrigger, NgpTooltip] },
    );

    const trigger = getByRole('button');
    fireEvent.mouseEnter(trigger);

    await waitFor(() => {
      expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
    });

    fireEvent.mouseLeave(trigger);
    const tooltip = document.querySelector('[ngpTooltip]') as HTMLElement;
    fireEvent.mouseEnter(tooltip);
    vi.advanceTimersByTime(1);

    await waitFor(() => {
      expect(document.querySelector('[ngpTooltip]')).not.toBeInTheDocument();
    });
  });

  it('should keep open while pointer stays in polygon bridge and close when leaving it', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    const { getByRole } = await render(
      `
        <button
          [ngpTooltipTrigger]="content"
          ngpTooltipTriggerHideDelay="0"
          ngpTooltipTriggerHoverableContent="true"
        >
          Trigger
        </button>

        <ng-template #content>
          <div ngpTooltip>Tooltip content</div>
        </ng-template>
      `,
      { imports: [NgpTooltipTrigger, NgpTooltip] },
    );

    const trigger = getByRole('button') as HTMLButtonElement;
    fireEvent.mouseEnter(trigger);

    await waitFor(() => {
      expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
    });

    const tooltip = document.querySelector('[ngpTooltip]') as HTMLElement;
    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 40, 20));
    vi.spyOn(tooltip, 'getBoundingClientRect').mockReturnValue(new DOMRect(120, 0, 80, 40));

    fireEvent.mouseLeave(trigger, { clientX: 40, clientY: 10 });
    fireEvent.pointerMove(document, { clientX: 80, clientY: 10 });
    vi.advanceTimersByTime(1);
    expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();

    fireEvent.pointerMove(document, { clientX: 80, clientY: 90 });
    vi.advanceTimersByTime(1);

    await waitFor(() => {
      expect(document.querySelector('[ngpTooltip]')).not.toBeInTheDocument();
    });
  });

  it('should close if pointer leaves trigger and does not move', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    const { getByRole } = await render(
      `
        <button
          [ngpTooltipTrigger]="content"
          ngpTooltipTriggerHideDelay="0"
          ngpTooltipTriggerHoverableContent="true"
        >
          Trigger
        </button>

        <ng-template #content>
          <div ngpTooltip>Tooltip content</div>
        </ng-template>
      `,
      { imports: [NgpTooltipTrigger, NgpTooltip] },
    );

    const trigger = getByRole('button') as HTMLButtonElement;
    fireEvent.mouseEnter(trigger);

    await waitFor(() => {
      expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
    });

    const tooltip = document.querySelector('[ngpTooltip]') as HTMLElement;
    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 40, 20));
    vi.spyOn(tooltip, 'getBoundingClientRect').mockReturnValue(new DOMRect(120, 0, 80, 40));

    fireEvent.mouseLeave(trigger, { clientX: 40, clientY: 10 });
    vi.advanceTimersByTime(200);

    await waitFor(() => {
      expect(document.querySelector('[ngpTooltip]')).not.toBeInTheDocument();
    });
  });

  it('should close on blur even while hovering tooltip content', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    const { getByRole } = await render(
      `
        <button
          [ngpTooltipTrigger]="content"
          ngpTooltipTriggerHideDelay="0"
          ngpTooltipTriggerHoverableContent="true"
        >
          Trigger
        </button>

        <ng-template #content>
          <div ngpTooltip>Tooltip content</div>
        </ng-template>
      `,
      { imports: [NgpTooltipTrigger, NgpTooltip] },
    );

    const trigger = getByRole('button');
    fireEvent.focus(trigger);

    await waitFor(() => {
      expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
    });

    const tooltip = document.querySelector('[ngpTooltip]') as HTMLElement;
    fireEvent.mouseEnter(tooltip);
    fireEvent.blur(trigger);
    vi.advanceTimersByTime(1);

    await waitFor(() => {
      expect(document.querySelector('[ngpTooltip]')).not.toBeInTheDocument();
    });
  });

  it('should use provider defaults and allow input override for hoverableContent', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    const { getByRole } = await render(
      `
        <button
          [ngpTooltipTrigger]="content"
          ngpTooltipTriggerHideDelay="0"
          ngpTooltipTriggerHoverableContent="true"
        >
          Trigger
        </button>

        <ng-template #content>
          <div ngpTooltip>Tooltip content</div>
        </ng-template>
      `,
      {
        imports: [NgpTooltipTrigger, NgpTooltip],
        providers: [provideTooltipConfig({ hoverableContent: false })],
      },
    );

    const trigger = getByRole('button');
    fireEvent.mouseEnter(trigger);

    await waitFor(() => {
      expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
    });

    fireEvent.mouseLeave(trigger);
    const tooltip = document.querySelector('[ngpTooltip]') as HTMLElement;
    fireEvent.mouseEnter(tooltip);
    vi.advanceTimersByTime(1);

    expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
  });
});
