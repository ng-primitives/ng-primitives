import { Directive, effect, input, OnInit, TemplateRef } from '@angular/core';
import { By } from '@angular/platform-browser';
import { fireEvent, render, waitFor } from '@testing-library/angular';
import {
  injectTooltipTriggerState,
  NgpTooltip,
  NgpTooltipTrigger,
  NgpTooltipTriggerState,
  provideTooltipConfig,
} from 'ng-primitives/tooltip';
import { afterEach, describe, expect, it, vi } from 'vitest';

describe('NgpTooltipTrigger (primitive)', () => {
  afterEach(() => {
    // Overlay content is attached to the document body, not the fixture, so
    // remove any leftover tooltips between tests.
    document.querySelectorAll('[ngpTooltip]').forEach(el => el.remove());
    vi.useRealTimers();
  });

  describe('roles & attributes', () => {
    it('should expose role="tooltip" on the tooltip element', async () => {
      const { getByRole } = await render(
        `
          <button [ngpTooltipTrigger]="content"></button>

          <ng-template #content>
            <div ngpTooltip>Tooltip content</div>
          </ng-template>
        `,
        { imports: [NgpTooltipTrigger, NgpTooltip] },
      );

      fireEvent.mouseEnter(getByRole('button'));

      await waitFor(() => {
        expect(document.querySelector('[role="tooltip"]')).toBeInTheDocument();
      });
    });

    it('should set the data-placement attribute on the tooltip element', async () => {
      const { getByRole } = await render(
        `
          <button [ngpTooltipTrigger]="content" ngpTooltipTriggerPlacement="top"></button>

          <ng-template #content>
            <div ngpTooltip>Tooltip content</div>
          </ng-template>
        `,
        { imports: [NgpTooltipTrigger, NgpTooltip] },
      );

      fireEvent.mouseEnter(getByRole('button'));

      await waitFor(() => {
        const tooltip = document.querySelector('[ngpTooltip]');
        expect(tooltip).toBeInTheDocument();
        expect(tooltip?.getAttribute('data-placement')).toBeTruthy();
      });
    });

    it('should set data-open on the trigger while the tooltip is open', async () => {
      const { getByRole } = await render(
        `
          <button [ngpTooltipTrigger]="content" ngpTooltipTriggerShowDelay="0"></button>

          <ng-template #content>
            <div ngpTooltip>Tooltip content</div>
          </ng-template>
        `,
        { imports: [NgpTooltipTrigger, NgpTooltip] },
      );

      const trigger = getByRole('button');
      expect(trigger.getAttribute('data-open')).toBeNull();

      fireEvent.mouseEnter(trigger);

      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
        expect(trigger.getAttribute('data-open')).toBe('');
      });
    });

    it('should apply the ngpTooltip styling attribute to string-content tooltips', async () => {
      const { getByRole } = await render(`<button ngpTooltipTrigger>Button text</button>`, {
        imports: [NgpTooltipTrigger, NgpTooltip],
      });

      fireEvent.mouseEnter(getByRole('button'));

      // String content is wrapped in an internal component whose host carries the
      // ngpTooltip styling attribute (the consumer's copy-paste styling hook).
      await waitFor(() => {
        const tooltip = document.querySelector('[role="tooltip"]');
        expect(tooltip).toBeInTheDocument();
        expect(tooltip).toHaveAttribute('ngpTooltip');
      });
    });
  });

  describe('show / hide on hover & focus', () => {
    it('should show the tooltip on mouseenter', async () => {
      const { getByRole } = await render(
        `
          <button [ngpTooltipTrigger]="content" ngpTooltipTriggerShowDelay="0"></button>

          <ng-template #content>
            <div ngpTooltip>Tooltip content</div>
          </ng-template>
        `,
        { imports: [NgpTooltipTrigger, NgpTooltip] },
      );

      fireEvent.mouseEnter(getByRole('button'));

      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
      });
    });

    it('should show the tooltip on focus', async () => {
      const { getByRole } = await render(
        `
          <button [ngpTooltipTrigger]="content" ngpTooltipTriggerShowDelay="0"></button>

          <ng-template #content>
            <div ngpTooltip>Tooltip content</div>
          </ng-template>
        `,
        { imports: [NgpTooltipTrigger, NgpTooltip] },
      );

      fireEvent.focus(getByRole('button'));

      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
      });
    });

    it('should hide the tooltip on mouseleave', async () => {
      const { getByRole } = await render(
        `
          <button
            [ngpTooltipTrigger]="content"
            ngpTooltipTriggerShowDelay="0"
            ngpTooltipTriggerHideDelay="0"
          ></button>

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

      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')).not.toBeInTheDocument();
      });
    });

    it('should hide the tooltip on blur', async () => {
      const { getByRole } = await render(
        `
          <button
            [ngpTooltipTrigger]="content"
            ngpTooltipTriggerShowDelay="0"
            ngpTooltipTriggerHideDelay="0"
          ></button>

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

      fireEvent.blur(trigger);

      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')).not.toBeInTheDocument();
      });
    });

    it('should destroy the overlay when the trigger is destroyed', async () => {
      const { fixture, getByRole } = await render(
        `
          <button [ngpTooltipTrigger]="content"></button>

          <ng-template #content>
            <div ngpTooltip>Tooltip content</div>
          </ng-template>
        `,
        { imports: [NgpTooltipTrigger, NgpTooltip] },
      );

      fireEvent.mouseEnter(getByRole('button'));

      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
      });

      fixture.destroy();

      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')).not.toBeInTheDocument();
      });
    });
  });

  describe('showDelay / hideDelay', () => {
    it('should wait for showDelay before showing the tooltip', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });

      const { getByRole } = await render(
        `
          <button [ngpTooltipTrigger]="content" ngpTooltipTriggerShowDelay="200"></button>

          <ng-template #content>
            <div ngpTooltip>Tooltip content</div>
          </ng-template>
        `,
        { imports: [NgpTooltipTrigger, NgpTooltip] },
      );

      fireEvent.mouseEnter(getByRole('button'));

      // Before the delay elapses the tooltip must not be present.
      vi.advanceTimersByTime(150);
      expect(document.querySelector('[ngpTooltip]')).not.toBeInTheDocument();

      // Once the delay passes it appears.
      vi.advanceTimersByTime(100);
      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
      });
    });

    it('should wait for hideDelay before hiding the tooltip', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });

      const { getByRole } = await render(
        `
          <button
            [ngpTooltipTrigger]="content"
            ngpTooltipTriggerShowDelay="0"
            ngpTooltipTriggerHideDelay="200"
          ></button>

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

      // Before the hide delay elapses the tooltip is still present.
      vi.advanceTimersByTime(150);
      expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();

      // Once the delay passes it is removed.
      vi.advanceTimersByTime(100);
      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')).not.toBeInTheDocument();
      });
    });

    it('should skip the hideDelay when hide(true) is called', async () => {
      const { fixture } = await render(
        `
          <button
            [ngpTooltipTrigger]="content"
            ngpTooltipTriggerShowDelay="0"
            ngpTooltipTriggerHideDelay="5000"
          ></button>

          <ng-template #content>
            <div ngpTooltip>Tooltip content</div>
          </ng-template>
        `,
        { imports: [NgpTooltipTrigger, NgpTooltip] },
      );

      const triggerDirective = fixture.debugElement.children[0].injector.get(NgpTooltipTrigger);
      triggerDirective.show();

      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
      });

      triggerDirective.hide(true);

      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')).not.toBeInTheDocument();
      });
    });
  });

  describe('escape to close', () => {
    it('should close the tooltip when Escape is pressed', async () => {
      const { getByRole } = await render(
        `
          <button [ngpTooltipTrigger]="content" ngpTooltipTriggerShowDelay="0"></button>

          <ng-template #content>
            <div ngpTooltip>Tooltip content</div>
          </ng-template>
        `,
        { imports: [NgpTooltipTrigger, NgpTooltip] },
      );

      fireEvent.mouseEnter(getByRole('button'));

      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
      });

      // Per the ARIA tooltip pattern, pressing Escape dismisses the tooltip.
      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')).not.toBeInTheDocument();
      });
    });
  });

  describe('aria-describedby wiring', () => {
    it('should give the tooltip a generated id and link the trigger via aria-describedby', async () => {
      const { getByRole } = await render(
        `
          <button [ngpTooltipTrigger]="content" ngpTooltipTriggerShowDelay="0"></button>

          <ng-template #content>
            <div ngpTooltip>Tooltip content</div>
          </ng-template>
        `,
        { imports: [NgpTooltipTrigger, NgpTooltip] },
      );

      const trigger = getByRole('button');
      fireEvent.mouseEnter(trigger);

      // The tooltip must have a real, generated id (not empty) and the trigger
      // must describe it for assistive technology.
      await waitFor(() => {
        const tooltip = document.querySelector('[ngpTooltip]') as HTMLElement | null;
        const id = tooltip?.getAttribute('id');
        expect(id).toBeTruthy();
        expect(trigger.getAttribute('aria-describedby')).toBe(id);
      });
    });

    it('should use a consumer-provided id over the generated one', async () => {
      const { getByRole } = await render(
        `
          <button [ngpTooltipTrigger]="content" ngpTooltipTriggerShowDelay="0"></button>

          <ng-template #content>
            <div ngpTooltip id="custom-tooltip-id">Tooltip content</div>
          </ng-template>
        `,
        { imports: [NgpTooltipTrigger, NgpTooltip] },
      );

      const trigger = getByRole('button');
      fireEvent.mouseEnter(trigger);

      // A bound id must win over the seeded generated id, and aria-describedby
      // must follow it.
      await waitFor(() => {
        const tooltip = document.querySelector('[ngpTooltip]') as HTMLElement | null;
        expect(tooltip?.getAttribute('id')).toBe('custom-tooltip-id');
        expect(trigger.getAttribute('aria-describedby')).toBe('custom-tooltip-id');
      });
    });

    it('should remove aria-describedby from the trigger once the tooltip closes', async () => {
      const { getByRole } = await render(
        `
          <button
            [ngpTooltipTrigger]="content"
            ngpTooltipTriggerShowDelay="0"
            ngpTooltipTriggerHideDelay="0"
          ></button>

          <ng-template #content>
            <div ngpTooltip>Tooltip content</div>
          </ng-template>
        `,
        { imports: [NgpTooltipTrigger, NgpTooltip] },
      );

      const trigger = getByRole('button');
      fireEvent.mouseEnter(trigger);

      await waitFor(() => {
        expect(trigger.getAttribute('aria-describedby')).toBeTruthy();
      });

      fireEvent.mouseLeave(trigger);

      // Once the tooltip is gone the trigger must no longer describe a
      // non-existent element.
      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')).not.toBeInTheDocument();
        expect(trigger.getAttribute('aria-describedby')).toBeNull();
      });
    });
  });

  describe('disabled', () => {
    it('should not show tooltip on mouseenter when disabled', async () => {
      const { getByRole } = await render(
        `
          <button [ngpTooltipTrigger]="content" ngpTooltipTriggerDisabled="true"></button>

          <ng-template #content>
            <div ngpTooltip>Tooltip content</div>
          </ng-template>
        `,
        { imports: [NgpTooltipTrigger, NgpTooltip] },
      );

      fireEvent.mouseEnter(getByRole('button'));

      // Wait a bit to ensure tooltip doesn't show
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(document.querySelector('[ngpTooltip]')).not.toBeInTheDocument();
    });

    it('should not show tooltip on focus when disabled', async () => {
      const { getByRole } = await render(
        `
          <button [ngpTooltipTrigger]="content" ngpTooltipTriggerDisabled="true"></button>

          <ng-template #content>
            <div ngpTooltip>Tooltip content</div>
          </ng-template>
        `,
        { imports: [NgpTooltipTrigger, NgpTooltip] },
      );

      fireEvent.focus(getByRole('button'));

      // Wait a bit to ensure tooltip doesn't show
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(document.querySelector('[ngpTooltip]')).not.toBeInTheDocument();
    });

    it('should allow programmatic show() when disabled', async () => {
      const { fixture } = await render(
        `
          <button [ngpTooltipTrigger]="content" ngpTooltipTriggerDisabled="true"></button>

          <ng-template #content>
            <div ngpTooltip>Tooltip content</div>
          </ng-template>
        `,
        { imports: [NgpTooltipTrigger, NgpTooltip] },
      );

      const triggerDirective = fixture.debugElement.children[0].injector.get(NgpTooltipTrigger);
      triggerDirective.show();

      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
      });
    });

    it('should allow programmatic hide() when disabled', async () => {
      const { fixture } = await render(
        `
          <button
            [ngpTooltipTrigger]="content"
            ngpTooltipTriggerDisabled="true"
            ngpTooltipTriggerHideDelay="0"
          ></button>

          <ng-template #content>
            <div ngpTooltip>Tooltip content</div>
          </ng-template>
        `,
        { imports: [NgpTooltipTrigger, NgpTooltip] },
      );

      const triggerDirective = fixture.debugElement.children[0].injector.get(NgpTooltipTrigger);
      triggerDirective.show();

      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
      });

      triggerDirective.hide();

      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')).not.toBeInTheDocument();
      });
    });

    it('should not hide tooltip on mouseleave when disabled (if shown programmatically)', async () => {
      const { fixture, getByRole } = await render(
        `
          <button [ngpTooltipTrigger]="content" ngpTooltipTriggerDisabled="true"></button>

          <ng-template #content>
            <div ngpTooltip>Tooltip content</div>
          </ng-template>
        `,
        { imports: [NgpTooltipTrigger, NgpTooltip] },
      );

      const trigger = getByRole('button');
      const triggerDirective = fixture.debugElement.children[0].injector.get(NgpTooltipTrigger);
      triggerDirective.show();

      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
      });

      // Fire mouseleave event - tooltip should NOT hide because disabled
      fireEvent.mouseLeave(trigger);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
    });

    it('should not hide tooltip on blur when disabled (if shown programmatically)', async () => {
      const { fixture, getByRole } = await render(
        `
          <button [ngpTooltipTrigger]="content" ngpTooltipTriggerDisabled="true"></button>

          <ng-template #content>
            <div ngpTooltip>Tooltip content</div>
          </ng-template>
        `,
        { imports: [NgpTooltipTrigger, NgpTooltip] },
      );

      const trigger = getByRole('button');
      const triggerDirective = fixture.debugElement.children[0].injector.get(NgpTooltipTrigger);
      triggerDirective.show();

      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
      });

      // Fire blur event - tooltip should NOT hide because disabled
      fireEvent.blur(trigger);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
    });
  });

  describe('interactive hover behavior', () => {
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

  describe('useTextContent', () => {
    it('should show tooltip with trigger element text content when useTextContent is enabled', async () => {
      const { getByRole } = await render(`<button ngpTooltipTrigger>Button text</button>`, {
        imports: [NgpTooltipTrigger, NgpTooltip],
      });

      fireEvent.mouseEnter(getByRole('button'));

      await waitFor(() => {
        const tooltip = document.querySelector('[role="tooltip"]');
        expect(tooltip).toBeInTheDocument();
        expect(tooltip?.textContent?.trim()).toBe('Button text');
      });
    });

    it('should not show tooltip when useTextContent is enabled but trigger has no text content', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const { getByRole } = await render(
        `<button ngpTooltipTrigger ngpTooltipTriggerUseTextContent="true"></button>`,
        { imports: [NgpTooltipTrigger, NgpTooltip] },
      );

      fireEvent.mouseEnter(getByRole('button'));

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(document.querySelector('[role="tooltip"]')).not.toBeInTheDocument();
      expect(consoleSpy).toHaveBeenCalledWith(
        '[ngpTooltipTrigger]: useTextContent is enabled but trigger element has no text content',
      );

      consoleSpy.mockRestore();
    });

    it('should prioritize tooltip template over useTextContent when both are provided', async () => {
      const { getByRole } = await render(
        `
          <button [ngpTooltipTrigger]="content" [ngpTooltipTriggerUseTextContent]="true">
            Button text
          </button>

          <ng-template #content>
            <div ngpTooltip>Template content</div>
          </ng-template>
        `,
        { imports: [NgpTooltipTrigger, NgpTooltip] },
      );

      fireEvent.mouseEnter(getByRole('button'));

      await waitFor(() => {
        const tooltip = document.querySelector('[role="tooltip"]');
        expect(tooltip).toBeInTheDocument();
        expect(tooltip?.textContent?.trim()).toBe('Template content');
      });
    });

    it('should use global config for useTextContent when not specified on element', async () => {
      const { getByRole } = await render(`<button ngpTooltipTrigger>Button text</button>`, {
        imports: [NgpTooltipTrigger, NgpTooltip],
        providers: [provideTooltipConfig({ useTextContent: true })],
      });

      fireEvent.mouseEnter(getByRole('button'));

      await waitFor(() => {
        const tooltip = document.querySelector('[role="tooltip"]');
        expect(tooltip).toBeInTheDocument();
        expect(tooltip?.textContent?.trim()).toBe('Button text');
      });
    });

    it('should override global config when useTextContent is explicitly set to false', async () => {
      const { getByRole } = await render(
        `
          <button [ngpTooltipTrigger]="content">
            Button text
          </button>

          <ng-template #content>
            <div ngpTooltip>Template content</div>
          </ng-template>
        `,
        {
          imports: [NgpTooltipTrigger, NgpTooltip],
          providers: [provideTooltipConfig({ useTextContent: true })],
        },
      );

      fireEvent.mouseEnter(getByRole('button'));

      await waitFor(() => {
        const tooltip = document.querySelector('[role="tooltip"]');
        expect(tooltip).toBeInTheDocument();
        expect(tooltip?.textContent?.trim()).toBe('Template content');
      });
    });

    it('should trim whitespace from text content', async () => {
      const { getByRole } = await render(
        `<button ngpTooltipTrigger ngpTooltipTriggerUseTextContent="true">   Button text with whitespace   </button>`,
        { imports: [NgpTooltipTrigger, NgpTooltip] },
      );

      fireEvent.mouseEnter(getByRole('button'));

      await waitFor(() => {
        const tooltip = document.querySelector('[role="tooltip"]');
        expect(tooltip).toBeInTheDocument();
        expect(tooltip?.textContent?.trim()).toBe('Button text with whitespace');
      });
    });

    it('should log error when no tooltip content provided and useTextContent is false', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { getByRole } = await render(
        `<button ngpTooltipTrigger ngpTooltipTriggerUseTextContent="false">Button text</button>`,
        { imports: [NgpTooltipTrigger, NgpTooltip] },
      );

      fireEvent.mouseEnter(getByRole('button'));

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(consoleSpy).toHaveBeenCalledWith(
        '[ngpTooltipTrigger]: Tooltip must be a string, TemplateRef, or ComponentType. Alternatively, set useTextContent to true if none is provided.',
      );

      consoleSpy.mockRestore();
    });
  });

  describe('showOnOverflow', () => {
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
            <div ngpTooltip>Tooltip content</div>
          </ng-template>
        `,
        { imports: [NgpTooltipTrigger, NgpTooltip] },
      );

      fireEvent.mouseEnter(getByRole('button'));

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
            <div ngpTooltip>Tooltip content</div>
          </ng-template>
        `,
        { imports: [NgpTooltipTrigger, NgpTooltip] },
      );

      fireEvent.mouseEnter(getByRole('button'));

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
    });
  });

  describe('cooldown', () => {
    it('should show a second tooltip instantly (data-instant) while another tooltip is active', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });

      const { getByTestId } = await render(
        `
          <button data-testid="trigger-a" [ngpTooltipTrigger]="contentA" ngpTooltipTriggerShowDelay="300"></button>
          <button data-testid="trigger-b" [ngpTooltipTrigger]="contentB" ngpTooltipTriggerShowDelay="300"></button>

          <ng-template #contentA>
            <div ngpTooltip data-testid="tooltip-a">Tooltip A</div>
          </ng-template>
          <ng-template #contentB>
            <div ngpTooltip data-testid="tooltip-b">Tooltip B</div>
          </ng-template>
        `,
        { imports: [NgpTooltipTrigger, NgpTooltip] },
      );

      // Show the first tooltip, which respects its own 300ms show delay.
      fireEvent.mouseEnter(getByTestId('trigger-a'));
      vi.advanceTimersByTime(300);
      await waitFor(() => {
        expect(document.querySelector('[data-testid="tooltip-a"]')).toBeInTheDocument();
      });

      // With a tooltip already active, hovering the second trigger shows it
      // instantly - the 300ms delay is skipped and data-instant is applied.
      fireEvent.mouseEnter(getByTestId('trigger-b'));
      vi.advanceTimersByTime(1);
      await waitFor(() => {
        const tooltipB = document.querySelector('[data-testid="tooltip-b"]');
        expect(tooltipB).toBeInTheDocument();
        expect(tooltipB).toHaveAttribute('data-instant');
      });
    });
  });

  describe('container', () => {
    it('should attach the tooltip to a custom container when provided', async () => {
      const { getByRole } = await render(
        `
          <div id="tooltip-host"></div>

          <button
            [ngpTooltipTrigger]="content"
            ngpTooltipTriggerShowDelay="0"
            ngpTooltipTriggerContainer="#tooltip-host"
          ></button>

          <ng-template #content>
            <div ngpTooltip>Tooltip content</div>
          </ng-template>
        `,
        { imports: [NgpTooltipTrigger, NgpTooltip] },
      );

      fireEvent.mouseEnter(getByRole('button'));

      await waitFor(() => {
        const container = document.querySelector('#tooltip-host');
        expect(container?.querySelector('[ngpTooltip]')).toBeInTheDocument();
      });
    });

    it('should expose container on the injected state so it can be set programmatically', async () => {
      @Directive({
        selector: '[setTooltipContainer]',
      })
      class SetTooltipContainerDirective implements OnInit {
        private readonly trigger = injectTooltipTriggerState();

        ngOnInit(): void {
          const host = document.querySelector('#tooltip-host') as HTMLElement;
          this.trigger().setContainer(host);
        }
      }

      const { getByRole } = await render(
        `
          <div id="tooltip-host"></div>

          <button
            [ngpTooltipTrigger]="content"
            ngpTooltipTriggerShowDelay="0"
            setTooltipContainer
          ></button>

          <ng-template #content>
            <div ngpTooltip>Tooltip content</div>
          </ng-template>
        `,
        { imports: [NgpTooltipTrigger, NgpTooltip, SetTooltipContainerDirective] },
      );

      fireEvent.mouseEnter(getByRole('button'));

      await waitFor(() => {
        const container = document.querySelector('#tooltip-host');
        expect(container?.querySelector('[ngpTooltip]')).toBeInTheDocument();
      });
    });
  });

  describe('offset / flip / shift config', () => {
    it('should accept the offset input', async () => {
      const { getByRole } = await render(
        `
          <button
            [ngpTooltipTrigger]="content"
            ngpTooltipTriggerShowDelay="0"
            ngpTooltipTriggerOffset="8"
          ></button>

          <ng-template #content>
            <div ngpTooltip>Tooltip content</div>
          </ng-template>
        `,
        { imports: [NgpTooltipTrigger, NgpTooltip] },
      );

      fireEvent.mouseEnter(getByRole('button'));

      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
      });
    });

    it('should accept the flip input', async () => {
      const { getByRole } = await render(
        `
          <button
            [ngpTooltipTrigger]="content"
            ngpTooltipTriggerShowDelay="0"
            ngpTooltipTriggerFlip="false"
          ></button>

          <ng-template #content>
            <div ngpTooltip>Tooltip content</div>
          </ng-template>
        `,
        { imports: [NgpTooltipTrigger, NgpTooltip] },
      );

      fireEvent.mouseEnter(getByRole('button'));

      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
      });
    });

    it('should accept the shift input', async () => {
      const { getByRole } = await render(
        `
          <button
            [ngpTooltipTrigger]="content"
            ngpTooltipTriggerShowDelay="0"
            ngpTooltipTriggerShift="true"
          ></button>

          <ng-template #content>
            <div ngpTooltip>Tooltip content</div>
          </ng-template>
        `,
        { imports: [NgpTooltipTrigger, NgpTooltip] },
      );

      fireEvent.mouseEnter(getByRole('button'));

      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
      });
    });
  });

  describe('nested tooltips', () => {
    it('should not error when tooltip triggers are nested', async () => {
      const { fixture } = await render(
        `
          <div [ngpTooltipTrigger]="outerContent" ngpTooltipTriggerDisabled="true">
            <button [ngpTooltipTrigger]="innerContent" ngpTooltipTriggerDisabled="true">Inner button</button>
          </div>

          <ng-template #outerContent>
            <div ngpTooltip>Outer tooltip</div>
          </ng-template>

          <ng-template #innerContent>
            <div ngpTooltip>Inner tooltip</div>
          </ng-template>
        `,
        { imports: [NgpTooltipTrigger, NgpTooltip] },
      );

      // Show the inner tooltip - this should not throw
      const innerTrigger =
        fixture.debugElement.children[0].children[0].injector.get(NgpTooltipTrigger);
      innerTrigger.show();

      await waitFor(() => {
        const tooltips = document.querySelectorAll('[ngpTooltip]');
        expect(tooltips).toHaveLength(1);
        expect(tooltips[0].textContent?.trim()).toBe('Inner tooltip');
      });
    });

    it('should allow both nested tooltips to show independently', async () => {
      const { fixture } = await render(
        `
          <div [ngpTooltipTrigger]="outerContent" ngpTooltipTriggerDisabled="true">
            <button [ngpTooltipTrigger]="innerContent" ngpTooltipTriggerDisabled="true">Inner button</button>
          </div>

          <ng-template #outerContent>
            <div ngpTooltip>Outer tooltip</div>
          </ng-template>

          <ng-template #innerContent>
            <div ngpTooltip>Inner tooltip</div>
          </ng-template>
        `,
        { imports: [NgpTooltipTrigger, NgpTooltip] },
      );

      // Show the outer tooltip
      const outerTrigger = fixture.debugElement.children[0].injector.get(NgpTooltipTrigger);
      outerTrigger.show();

      await waitFor(() => {
        const tooltips = document.querySelectorAll('[ngpTooltip]');
        expect(tooltips).toHaveLength(1);
        expect(tooltips[0].textContent?.trim()).toBe('Outer tooltip');
      });

      // Now also show the inner tooltip
      const innerTrigger =
        fixture.debugElement.children[0].children[0].injector.get(NgpTooltipTrigger);
      innerTrigger.show();

      await waitFor(() => {
        const tooltips = document.querySelectorAll('[ngpTooltip]');
        expect(tooltips).toHaveLength(2);
      });
    });
  });

  describe('placements', () => {
    const placements = [
      'top',
      'top-start',
      'top-end',
      'bottom',
      'bottom-start',
      'bottom-end',
      'left',
      'left-start',
      'left-end',
      'right',
      'right-start',
      'right-end',
    ];

    it('should support all 12 placements open simultaneously', async () => {
      const template = placements
        .map(
          p =>
            `<button ngpTooltipTrigger ngpTooltipTriggerPlacement="${p}" ngpTooltipTriggerDisabled="true">${p}</button>`,
        )
        .join('\n');

      const { fixture } = await render(template, {
        imports: [NgpTooltipTrigger, NgpTooltip],
      });

      // Programmatically show all tooltips
      const triggers = fixture.debugElement.children
        .filter(child => child.injector.get(NgpTooltipTrigger, null))
        .map(child => child.injector.get(NgpTooltipTrigger));

      expect(triggers).toHaveLength(12);

      for (const trigger of triggers) {
        trigger.show();
      }

      await waitFor(() => {
        const tooltips = document.querySelectorAll('[role="tooltip"]');
        expect(tooltips).toHaveLength(12);
      });
    });
  });

  describe('exit animation re-entry (issue #681)', () => {
    it('should cancel exit animation and reuse tooltip when hovering back during exit', async () => {
      // Override getAnimations to simulate a long-running exit animation.
      // Returns a fake Animation object with a pending `finished` promise
      // and a `cancel()` method, simulating an in-progress CSS exit animation.
      let resolveAnimation: (() => void) | null = null;
      let simulateExitAnimation = false;

      const originalGetAnimations = Element.prototype.getAnimations;
      Element.prototype.getAnimations = function () {
        if (simulateExitAnimation && this.hasAttribute('data-exit')) {
          const animPromise = new Promise<void>(resolve => {
            resolveAnimation = resolve;
          });
          return [
            {
              finished: animPromise,
              cancel: () => {
                // In real browsers, cancelling an animation rejects its finished promise
                // with an AbortError. Our mock doesn't need to do this since the
                // cancel() in exit-animation.ts resolves the exit promise separately.
              },
            },
          ] as unknown as Animation[];
        }
        return [];
      };

      try {
        const { getByRole } = await render(
          `
            <button
              [ngpTooltipTrigger]="content"
              ngpTooltipTriggerHideDelay="0"
              ngpTooltipTriggerHoverableContent="false"
            ></button>
            <ng-template #content>
              <div ngpTooltip>Tooltip content</div>
            </ng-template>
          `,
          { imports: [NgpTooltipTrigger, NgpTooltip] },
        );

        const trigger = getByRole('button');

        // Step 1: Show the tooltip
        fireEvent.mouseEnter(trigger);
        await waitFor(() => {
          expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
        });

        // Capture the original tooltip element
        const originalTooltip = document.querySelector('[ngpTooltip]');

        // Step 2: Enable exit animation simulation, then trigger hide
        simulateExitAnimation = true;
        fireEvent.mouseLeave(trigger);

        // Wait for hide to initiate (hideDelay is 0, so dispose runs on next tick)
        await new Promise(resolve => setTimeout(resolve, 50));

        // The exit animation should now be in progress
        expect(resolveAnimation).not.toBeNull();

        // Step 3: Re-enter while exit animation is still playing.
        // This should cancel the exit animation and reuse the same overlay.
        simulateExitAnimation = false;
        fireEvent.mouseEnter(trigger);

        // Give Angular time to process the cancellation
        await new Promise(resolve => setTimeout(resolve, 100));

        // Step 4: The tooltip should still be visible (same element, not recreated)
        await waitFor(
          () => {
            const tooltip = document.querySelector('[ngpTooltip]');
            expect(tooltip).toBeInTheDocument();
            // Verify it's the same DOM element (reused, not recreated)
            expect(tooltip).toBe(originalTooltip);
          },
          { timeout: 2000 },
        );
      } finally {
        Element.prototype.getAnimations = originalGetAnimations;
      }
    });

    it('should still hide normally after a cancelled exit animation', async () => {
      let resolveAnimation: (() => void) | null = null;
      let simulateExitAnimation = false;

      const originalGetAnimations = Element.prototype.getAnimations;
      Element.prototype.getAnimations = function () {
        if (simulateExitAnimation && this.hasAttribute('data-exit')) {
          const animPromise = new Promise<void>(resolve => {
            resolveAnimation = resolve;
          });
          return [{ finished: animPromise, cancel: () => {} }] as unknown as Animation[];
        }
        return [];
      };

      try {
        const { getByRole } = await render(
          `
            <button
              [ngpTooltipTrigger]="content"
              ngpTooltipTriggerHideDelay="0"
              ngpTooltipTriggerHoverableContent="false"
            ></button>
            <ng-template #content>
              <div ngpTooltip>Tooltip content</div>
            </ng-template>
          `,
          { imports: [NgpTooltipTrigger, NgpTooltip] },
        );

        const trigger = getByRole('button');

        // Show tooltip
        fireEvent.mouseEnter(trigger);
        await waitFor(() => {
          expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
        });

        // Start exit animation, then cancel by re-entering
        simulateExitAnimation = true;
        fireEvent.mouseLeave(trigger);
        await new Promise(resolve => setTimeout(resolve, 50));
        expect(resolveAnimation).not.toBeNull();

        simulateExitAnimation = false;
        fireEvent.mouseEnter(trigger);
        await new Promise(resolve => setTimeout(resolve, 100));

        // Tooltip should be visible after cancel
        expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();

        // Now hide normally (no exit animation)
        fireEvent.mouseLeave(trigger);
        await waitFor(
          () => {
            expect(document.querySelector('[ngpTooltip]')).not.toBeInTheDocument();
          },
          { timeout: 2000 },
        );
      } finally {
        Element.prototype.getAnimations = originalGetAnimations;
      }
    });

    it('should preserve data-open on trigger during exit animation', async () => {
      let resolveAnimation: (() => void) | null = null;
      let simulateExitAnimation = false;

      const originalGetAnimations = Element.prototype.getAnimations;
      Element.prototype.getAnimations = function () {
        if (simulateExitAnimation && this.hasAttribute('data-exit')) {
          const animPromise = new Promise<void>(resolve => {
            resolveAnimation = resolve;
          });
          return [{ finished: animPromise, cancel: () => {} }] as unknown as Animation[];
        }
        return [];
      };

      try {
        const { getByRole } = await render(
          `
            <button
              [ngpTooltipTrigger]="content"
              ngpTooltipTriggerHideDelay="0"
              ngpTooltipTriggerHoverableContent="false"
            ></button>
            <ng-template #content>
              <div ngpTooltip>Tooltip content</div>
            </ng-template>
          `,
          { imports: [NgpTooltipTrigger, NgpTooltip] },
        );

        const trigger = getByRole('button');

        // Show tooltip
        fireEvent.mouseEnter(trigger);
        await waitFor(() => {
          expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
          expect(trigger.getAttribute('data-open')).toBe('');
        });

        // Start exit animation
        simulateExitAnimation = true;
        fireEvent.mouseLeave(trigger);
        await new Promise(resolve => setTimeout(resolve, 50));
        expect(resolveAnimation).not.toBeNull();

        // data-open should remain on trigger during exit animation
        // (the tooltip is still visible, just animating out)
        expect(trigger.getAttribute('data-open')).toBe('');

        // Complete the exit animation
        simulateExitAnimation = false;
        resolveAnimation!();

        // Now data-open should be removed after exit animation completes
        await waitFor(
          () => {
            expect(trigger.getAttribute('data-open')).toBeNull();
          },
          { timeout: 2000 },
        );
      } finally {
        Element.prototype.getAnimations = originalGetAnimations;
      }
    });

    it('should show tooltip again after normal hide completes', async () => {
      let resolveAnimation: (() => void) | null = null;
      let simulateExitAnimation = false;

      const originalGetAnimations = Element.prototype.getAnimations;
      Element.prototype.getAnimations = function () {
        if (simulateExitAnimation && this.hasAttribute('data-exit')) {
          const animPromise = new Promise<void>(resolve => {
            resolveAnimation = resolve;
          });
          return [{ finished: animPromise, cancel: () => {} }] as unknown as Animation[];
        }
        return [];
      };

      try {
        const { getByRole } = await render(
          `
            <button
              [ngpTooltipTrigger]="content"
              ngpTooltipTriggerHideDelay="0"
              ngpTooltipTriggerHoverableContent="false"
            ></button>
            <ng-template #content>
              <div ngpTooltip>Tooltip content</div>
            </ng-template>
          `,
          { imports: [NgpTooltipTrigger, NgpTooltip] },
        );

        const trigger = getByRole('button');

        // Show tooltip
        fireEvent.mouseEnter(trigger);
        await waitFor(() => {
          expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
        });

        // Hide with exit animation (let it complete)
        simulateExitAnimation = true;
        fireEvent.mouseLeave(trigger);
        await new Promise(resolve => setTimeout(resolve, 50));
        expect(resolveAnimation).not.toBeNull();

        simulateExitAnimation = false;
        resolveAnimation!();
        await waitFor(
          () => {
            expect(document.querySelector('[ngpTooltip]')).not.toBeInTheDocument();
          },
          { timeout: 2000 },
        );

        // Show again — should work normally
        fireEvent.mouseEnter(trigger);
        await waitFor(() => {
          expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
        });
      } finally {
        Element.prototype.getAnimations = originalGetAnimations;
      }
    });
  });

  describe('anchor', () => {
    it('should position tooltip relative to anchor element when provided', async () => {
      const { getByRole } = await render(
        `
          <div
            #anchor
            style="position: absolute; top: 100px; left: 200px; width: 50px; height: 30px;"
          >
            Anchor Element
          </div>
          <button
            [ngpTooltipTrigger]="content"
            [ngpTooltipTriggerAnchor]="anchor"
            style="position: absolute; top: 300px; left: 400px;"
          >
            Trigger
          </button>

          <ng-template #content>
            <div ngpTooltip>Tooltip content</div>
          </ng-template>
        `,
        { imports: [NgpTooltipTrigger, NgpTooltip] },
      );

      fireEvent.mouseEnter(getByRole('button'));

      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
      });

      // The tooltip should be positioned relative to the anchor element (top: 100px, left: 200px)
      // rather than the trigger element (top: 300px, left: 400px)
      const tooltip = document.querySelector('[ngpTooltip]') as HTMLElement;
      const tooltipRect = tooltip.getBoundingClientRect();

      // The tooltip should be positioned close to the anchor's position (200px left)
      // rather than near the trigger's position (400px left)
      expect(tooltipRect.left).toBeLessThan(300);
    });

    it('should fall back to trigger element when anchor is null', async () => {
      const { getByRole } = await render(
        `
          <button
            [ngpTooltipTrigger]="content"
            [ngpTooltipTriggerAnchor]="null"
            style="position: absolute; top: 100px; left: 200px;"
          >
            Trigger
          </button>

          <ng-template #content>
            <div ngpTooltip>Tooltip content</div>
          </ng-template>
        `,
        { imports: [NgpTooltipTrigger, NgpTooltip] },
      );

      fireEvent.mouseEnter(getByRole('button'));

      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
      });

      // Should position relative to trigger when anchor is null
      const tooltip = document.querySelector('[ngpTooltip]') as HTMLElement;
      expect(tooltip).toBeInTheDocument();
    });

    it('should accept anchor element input', async () => {
      const { getByRole } = await render(
        `
          <div #anchor>Anchor Element</div>
          <button [ngpTooltipTrigger]="content" [ngpTooltipTriggerAnchor]="anchor">Trigger</button>

          <ng-template #content>
            <div ngpTooltip>Tooltip content</div>
          </ng-template>
        `,
        { imports: [NgpTooltipTrigger, NgpTooltip] },
      );

      fireEvent.mouseEnter(getByRole('button'));

      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
      });
    });
  });

  describe('position', () => {
    it('should accept position input for programmatic positioning', async () => {
      const { fixture } = await render(
        `
          <button
            [ngpTooltipTrigger]="content"
            [ngpTooltipTriggerPosition]="position"
            ngpTooltipTriggerDisabled="true"
          ></button>

          <ng-template #content>
            <div ngpTooltip>Tooltip content</div>
          </ng-template>
        `,
        {
          imports: [NgpTooltipTrigger, NgpTooltip],
          componentProperties: {
            position: { x: 100, y: 200 },
          },
        },
      );

      const triggerDirective = fixture.debugElement.children[0].injector.get(NgpTooltipTrigger);
      triggerDirective.show();

      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
      });
    });

    it('should allow null position to use trigger element positioning', async () => {
      const { fixture } = await render(
        `
          <button
            [ngpTooltipTrigger]="content"
            [ngpTooltipTriggerPosition]="position"
            ngpTooltipTriggerDisabled="true"
          ></button>

          <ng-template #content>
            <div ngpTooltip>Tooltip content</div>
          </ng-template>
        `,
        {
          imports: [NgpTooltipTrigger, NgpTooltip],
          componentProperties: {
            position: null,
          },
        },
      );

      const triggerDirective = fixture.debugElement.children[0].injector.get(NgpTooltipTrigger);
      triggerDirective.show();

      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
      });
    });

    it('should work with trackPosition for smooth updates', async () => {
      const { fixture } = await render(
        `
          <button
            [ngpTooltipTrigger]="content"
            [ngpTooltipTriggerPosition]="{ x: 100, y: 200 }"
            ngpTooltipTriggerTrackPosition="true"
            ngpTooltipTriggerDisabled="true"
          ></button>

          <ng-template #content>
            <div ngpTooltip>Tooltip content</div>
          </ng-template>
        `,
        { imports: [NgpTooltipTrigger, NgpTooltip] },
      );

      const triggerDirective = fixture.debugElement.children[0].injector.get(NgpTooltipTrigger);
      triggerDirective.show();

      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
      });
    });

    it('should position tooltip at specified coordinates', async () => {
      const { fixture } = await render(
        `
          <button
            [ngpTooltipTrigger]="content"
            [ngpTooltipTriggerPosition]="{ x: 150, y: 250 }"
            ngpTooltipTriggerPlacement="top"
            ngpTooltipTriggerDisabled="true"
          ></button>

          <ng-template #content>
            <div ngpTooltip>Tooltip content</div>
          </ng-template>
        `,
        { imports: [NgpTooltipTrigger, NgpTooltip] },
      );

      const triggerDirective = fixture.debugElement.children[0].injector.get(NgpTooltipTrigger);
      triggerDirective.show();

      await waitFor(() => {
        const tooltip = document.querySelector('[ngpTooltip]') as HTMLElement | null;
        expect(tooltip).toBeInTheDocument();
        // Tooltip should have left and top position styles applied
        expect(tooltip?.style.left).toBeTruthy();
        expect(tooltip?.style.top).toBeTruthy();
      });
    });
  });

  describe('trackPosition', () => {
    it('should accept trackPosition attribute', async () => {
      const { getByRole } = await render(
        `
          <button [ngpTooltipTrigger]="content" ngpTooltipTriggerTrackPosition></button>

          <ng-template #content>
            <div ngpTooltip>Tooltip content</div>
          </ng-template>
        `,
        { imports: [NgpTooltipTrigger, NgpTooltip] },
      );

      fireEvent.mouseEnter(getByRole('button'));

      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
      });
    });

    it('should use global config for trackPosition when not specified on element', async () => {
      const { getByRole } = await render(
        `
          <button [ngpTooltipTrigger]="content"></button>

          <ng-template #content>
            <div ngpTooltip>Tooltip content</div>
          </ng-template>
        `,
        {
          imports: [NgpTooltipTrigger, NgpTooltip],
          providers: [provideTooltipConfig({ trackPosition: true })],
        },
      );

      fireEvent.mouseEnter(getByRole('button'));

      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
      });
    });
  });

  describe('scrollBehavior', () => {
    it('should not close tooltip on scroll when scrollBehavior is reposition', async () => {
      const { fixture } = await render(
        `
          <div style="overflow: auto; height: 100px;" #scrollContainer>
            <button [ngpTooltipTrigger]="content" ngpTooltipTriggerScrollBehavior="reposition" ngpTooltipTriggerDisabled="true"></button>
          </div>

          <ng-template #content>
            <div ngpTooltip>Tooltip content</div>
          </ng-template>
        `,
        { imports: [NgpTooltipTrigger, NgpTooltip] },
      );

      const triggerDirective =
        fixture.debugElement.children[0].children[0].injector.get(NgpTooltipTrigger);
      triggerDirective.show();

      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
      });

      // Scroll the container
      fixture.debugElement.children[0].nativeElement.dispatchEvent(new Event('scroll'));

      // Tooltip should remain open
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
    });

    it('should close tooltip on scroll when scrollBehavior is close', async () => {
      const { fixture } = await render(
        `
          <div style="overflow: auto; height: 100px;">
            <button [ngpTooltipTrigger]="content" ngpTooltipTriggerScrollBehavior="close" ngpTooltipTriggerDisabled="true"></button>
          </div>

          <ng-template #content>
            <div ngpTooltip>Tooltip content</div>
          </ng-template>
        `,
        { imports: [NgpTooltipTrigger, NgpTooltip] },
      );

      const triggerDirective =
        fixture.debugElement.children[0].children[0].injector.get(NgpTooltipTrigger);
      triggerDirective.show();

      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
      });

      // Scroll the container - should close the tooltip
      fixture.debugElement.children[0].nativeElement.dispatchEvent(new Event('scroll'));

      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')).not.toBeInTheDocument();
      });
    });

    it('should use global config for scrollBehavior', async () => {
      const { fixture } = await render(
        `
          <div style="overflow: auto; height: 100px;">
            <button [ngpTooltipTrigger]="content" ngpTooltipTriggerDisabled="true"></button>
          </div>

          <ng-template #content>
            <div ngpTooltip>Tooltip content</div>
          </ng-template>
        `,
        {
          imports: [NgpTooltipTrigger, NgpTooltip],
          providers: [provideTooltipConfig({ scrollBehavior: 'close' })],
        },
      );

      const triggerDirective =
        fixture.debugElement.children[0].children[0].injector.get(NgpTooltipTrigger);
      triggerDirective.show();

      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
      });

      // Scroll the container - should close via global config
      fixture.debugElement.children[0].nativeElement.dispatchEvent(new Event('scroll'));

      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')).not.toBeInTheDocument();
      });
    });
  });

  describe('dynamic content (issue #711)', () => {
    const dynamicTemplate = `
      <button
        [ngpTooltipTrigger]="showTooltip ? (useFirst ? first : second) : null"
        ngpTooltipTriggerShowDelay="0"
        ngpTooltipTriggerHideDelay="0"
        [ngpTooltipTriggerUseTextContent]="false"
      ></button>

      <ng-template #first>
        <div ngpTooltip>First tooltip</div>
      </ng-template>
      <ng-template #second>
        <div ngpTooltip>Second tooltip</div>
      </ng-template>
    `;

    function renderDynamic(
      componentProperties: { useFirst?: boolean; showTooltip?: boolean } = {},
    ) {
      return render(dynamicTemplate, {
        imports: [NgpTooltipTrigger, NgpTooltip],
        componentProperties: { useFirst: true, showTooltip: true, ...componentProperties },
      });
    }

    it('should show the new template when the reference changes while the tooltip is closed', async () => {
      const { fixture, getByRole } = await renderDynamic();

      const trigger = getByRole('button');
      fireEvent.mouseEnter(trigger);

      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')?.textContent?.trim()).toBe('First tooltip');
      });

      fireEvent.mouseLeave(trigger);
      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')).not.toBeInTheDocument();
      });

      fixture.componentInstance.useFirst = false;
      fixture.detectChanges();

      fireEvent.mouseEnter(trigger);

      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')?.textContent?.trim()).toBe('Second tooltip');
      });
    });

    it('should swap the visible tooltip when the reference changes while it is open', async () => {
      const { fixture, getByRole } = await renderDynamic();

      fireEvent.mouseEnter(getByRole('button'));

      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')?.textContent?.trim()).toBe('First tooltip');
      });

      fixture.componentInstance.useFirst = false;
      fixture.detectChanges();

      await waitFor(() => {
        const tooltips = document.querySelectorAll('[ngpTooltip]');
        expect(tooltips).toHaveLength(1);
        expect(tooltips[0].textContent?.trim()).toBe('Second tooltip');
      });
    });

    it('should keep aria-describedby pointing at the swapped tooltip', async () => {
      const { fixture, getByRole } = await renderDynamic();

      const trigger = getByRole('button');
      fireEvent.mouseEnter(trigger);

      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')?.textContent?.trim()).toBe('First tooltip');
      });

      fixture.componentInstance.useFirst = false;
      fixture.detectChanges();

      await waitFor(() => {
        const tooltip = document.querySelector('[ngpTooltip]') as HTMLElement | null;
        expect(tooltip?.textContent?.trim()).toBe('Second tooltip');
        expect(trigger.getAttribute('aria-describedby')).toBe(tooltip?.getAttribute('id'));
      });
    });

    it('should hide the visible tooltip when the reference is cleared', async () => {
      const { fixture, getByRole } = await renderDynamic();

      fireEvent.mouseEnter(getByRole('button'));

      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
      });

      fixture.componentInstance.showTooltip = false;
      fixture.detectChanges();

      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')).not.toBeInTheDocument();
      });
    });

    it('should not bring the tooltip back when the reference changes during a pending hide', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });

      const { fixture, getByRole } = await render(
        `
          <button
            [ngpTooltipTrigger]="useFirst ? first : second"
            ngpTooltipTriggerShowDelay="0"
            ngpTooltipTriggerHideDelay="200"
          ></button>

          <ng-template #first>
            <div ngpTooltip>First tooltip</div>
          </ng-template>
          <ng-template #second>
            <div ngpTooltip>Second tooltip</div>
          </ng-template>
        `,
        {
          imports: [NgpTooltipTrigger, NgpTooltip],
          componentProperties: { useFirst: true },
        },
      );

      const trigger = getByRole('button');
      fireEvent.mouseEnter(trigger);

      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
      });

      // Swap the content while the tooltip is on its way out - the pointer has left,
      // so the replacement must not put a tooltip back on screen.
      fireEvent.mouseLeave(trigger);
      fixture.componentInstance.useFirst = false;
      fixture.detectChanges();

      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')).not.toBeInTheDocument();
      });
    });

    it('should not rebuild the tooltip when the content has not changed', async () => {
      const { fixture, getByRole } = await renderDynamic();

      fireEvent.mouseEnter(getByRole('button'));

      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
      });

      const tooltip = document.querySelector('[ngpTooltip]');

      // Let change detection run a few times - watching the content must not cost the
      // tooltip its DOM (which would restart animations and drop focus in richer
      // overlays).
      fixture.detectChanges();
      await new Promise(resolve => setTimeout(resolve, 50));
      fixture.detectChanges();

      expect(document.querySelector('[ngpTooltip]')).toBe(tooltip);
    });

    it('should not throw when the reference is cleared during the show delay', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });

      const { fixture, getByRole } = await render(
        `
          <button
            [ngpTooltipTrigger]="showTooltip ? first : null"
            ngpTooltipTriggerShowDelay="300"
            [ngpTooltipTriggerUseTextContent]="false"
          ></button>

          <ng-template #first>
            <div ngpTooltip>First tooltip</div>
          </ng-template>
        `,
        {
          imports: [NgpTooltipTrigger, NgpTooltip],
          componentProperties: { showTooltip: true },
        },
      );

      fireEvent.mouseEnter(getByRole('button'));

      // Clear the content before the show delay elapses - the pending open has to find
      // nothing to render rather than blowing up.
      vi.advanceTimersByTime(150);
      fixture.componentInstance.showTooltip = false;
      fixture.detectChanges();
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')).not.toBeInTheDocument();
      });
    });

    it('should pick up a reference that changed during the exit animation', async () => {
      // A content change is skipped while a close is under way - re-entering cancels that
      // close and restores the portal, which must not bring the old content back.
      let simulateExitAnimation = false;
      const originalGetAnimations = Element.prototype.getAnimations;
      Element.prototype.getAnimations = function () {
        if (simulateExitAnimation && this.hasAttribute('data-exit')) {
          return [
            { finished: new Promise<void>(() => {}), cancel: () => {} },
          ] as unknown as Animation[];
        }
        return [];
      };

      try {
        const { fixture, getByRole } = await renderDynamic();
        const trigger = getByRole('button');

        fireEvent.mouseEnter(trigger);
        await waitFor(() => {
          expect(document.querySelector('[ngpTooltip]')?.textContent?.trim()).toBe('First tooltip');
        });

        // Start the exit animation, then swap the content while it plays.
        simulateExitAnimation = true;
        fireEvent.mouseLeave(trigger);
        await new Promise(resolve => setTimeout(resolve, 50));

        fixture.componentInstance.useFirst = false;
        fixture.detectChanges();

        // Re-enter: the exit is cancelled and the tooltip stays up, now with the content
        // the trigger currently points at.
        simulateExitAnimation = false;
        fireEvent.mouseEnter(trigger);

        await waitFor(() => {
          const tooltips = document.querySelectorAll('[ngpTooltip]');
          expect(tooltips).toHaveLength(1);
          expect(tooltips[0].textContent?.trim()).toBe('Second tooltip');
        });
      } finally {
        Element.prototype.getAnimations = originalGetAnimations;
      }
    });

    it('should not show a tooltip on hover once the reference is cleared', async () => {
      // The trigger has no content and no text content to fall back on, so it reports
      // that in dev mode - keep it off the console for the duration of the test.
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      try {
        const { fixture, getByRole } = await renderDynamic();

        const trigger = getByRole('button');
        fireEvent.mouseEnter(trigger);

        await waitFor(() => {
          expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
        });

        fireEvent.mouseLeave(trigger);
        await waitFor(() => {
          expect(document.querySelector('[ngpTooltip]')).not.toBeInTheDocument();
        });

        fixture.componentInstance.showTooltip = false;
        fixture.detectChanges();

        fireEvent.mouseEnter(trigger);
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(document.querySelector('[ngpTooltip]')).not.toBeInTheDocument();
      } finally {
        consoleSpy.mockRestore();
      }
    });

    it('should show a tooltip once a reference is provided', async () => {
      // Starts with no content, which is reported in dev mode - see above.
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      try {
        const { fixture, getByRole } = await renderDynamic({ showTooltip: false });

        const trigger = getByRole('button');
        fireEvent.mouseEnter(trigger);
        await new Promise(resolve => setTimeout(resolve, 100));
        expect(document.querySelector('[ngpTooltip]')).not.toBeInTheDocument();

        fireEvent.mouseLeave(trigger);

        fixture.componentInstance.showTooltip = true;
        fixture.detectChanges();

        fireEvent.mouseEnter(trigger);

        await waitFor(() => {
          expect(document.querySelector('[ngpTooltip]')?.textContent?.trim()).toBe('First tooltip');
        });
      } finally {
        consoleSpy.mockRestore();
      }
    });

    it('should render, and update, a string set through the injected state', async () => {
      // A string tooltip is only reachable programmatically - the directive input
      // transform maps strings to null - and is wrapped in the text content component.
      @Directive({ selector: '[setTooltipText]' })
      class SetTooltipText {
        private readonly trigger = injectTooltipTriggerState();

        readonly text = input<string>('', { alias: 'setTooltipText' });

        constructor() {
          effect(() => this.trigger().setTooltip(this.text()));
        }
      }

      const { fixture, getByRole } = await render(
        `
          <button
            ngpTooltipTrigger
            [setTooltipText]="text"
            ngpTooltipTriggerShowDelay="0"
            [ngpTooltipTriggerUseTextContent]="false"
          ></button>
        `,
        {
          imports: [NgpTooltipTrigger, NgpTooltip, SetTooltipText],
          componentProperties: { text: 'First text' },
        },
      );

      fireEvent.mouseEnter(getByRole('button'));

      await waitFor(() => {
        expect(document.querySelector('[role="tooltip"]')?.textContent?.trim()).toBe('First text');
      });

      const tooltip = document.querySelector('[role="tooltip"]');

      fixture.componentInstance.text = 'Second text';
      fixture.detectChanges();

      // Both strings render through the same component, so only the context changes -
      // the text updates in place rather than the portal being rebuilt.
      await waitFor(() => {
        const tooltips = document.querySelectorAll('[role="tooltip"]');
        expect(tooltips).toHaveLength(1);
        expect(tooltips[0].textContent?.trim()).toBe('Second text');
      });
      expect(document.querySelector('[role="tooltip"]')).toBe(tooltip);
    });

    it('should react to the tooltip being set through the injected state', async () => {
      // Mirrors the wrapper-component use case from the issue: a directive that
      // enables or disables the tooltip by writing to the injected state.
      @Directive({ selector: '[setTooltipContent]' })
      class SetTooltipContent {
        private readonly trigger = injectTooltipTriggerState();

        readonly content = input<TemplateRef<void> | null>(null, { alias: 'setTooltipContent' });

        constructor() {
          effect(() => this.trigger().setTooltip(this.content()));
        }
      }

      const { fixture, getByRole } = await render(
        `
          <button
            ngpTooltipTrigger
            [setTooltipContent]="enabled ? content : null"
            ngpTooltipTriggerShowDelay="0"
            [ngpTooltipTriggerUseTextContent]="false"
          ></button>

          <ng-template #content>
            <div ngpTooltip>Injected tooltip</div>
          </ng-template>
        `,
        {
          imports: [NgpTooltipTrigger, NgpTooltip, SetTooltipContent],
          componentProperties: { enabled: true },
        },
      );

      const trigger = getByRole('button');
      fireEvent.mouseEnter(trigger);

      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')?.textContent?.trim()).toBe(
          'Injected tooltip',
        );
      });

      fixture.componentInstance.enabled = false;
      fixture.detectChanges();

      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')).not.toBeInTheDocument();
      });
    });
  });

  describe('injected state setters', () => {
    // Every input on NgpTooltipTrigger has a matching setter on the state, so a
    // wrapper component can configure the trigger it hosts.
    @Directive({ selector: '[tooltipState]' })
    class TooltipStateDirective {
      readonly trigger = injectTooltipTriggerState();
    }

    // The panel needs an explicit size and position for the positioning assertions
    // below - Floating UI writes `top`/`left`, which a static element ignores.
    const template = `
      <button [ngpTooltipTrigger]="content" ngpTooltipTriggerShowDelay="0" tooltipState>
        Trigger
      </button>

      <ng-template #content>
        <div ngpTooltip style="position: fixed; width: 120px; height: 60px;">Tooltip content</div>
      </ng-template>
    `;

    async function renderWithState(markup: string = template) {
      const result = await render(markup, {
        imports: [NgpTooltipTrigger, NgpTooltip, TooltipStateDirective],
      });

      const state = result.fixture.debugElement
        .query(By.directive(TooltipStateDirective))
        .injector.get(TooltipStateDirective).trigger;

      return { ...result, state, trigger: result.getByRole('button') };
    }

    type TooltipState = NgpTooltipTriggerState<unknown>;

    const anchorElement = document.createElement('div');

    const cases: Array<{
      setter: string;
      set: (state: TooltipState) => void;
      read: (state: TooltipState) => unknown;
      expected: unknown;
    }> = [
      {
        setter: 'setTooltip',
        set: state => state.setTooltip('text'),
        read: state => state.tooltip(),
        expected: 'text',
      },
      {
        setter: 'setDisabled',
        set: state => state.setDisabled(true),
        read: state => state.disabled(),
        expected: true,
      },
      {
        setter: 'setPlacement',
        set: state => state.setPlacement('right'),
        read: state => state.placement(),
        expected: 'right',
      },
      {
        setter: 'setOffset',
        set: state => state.setOffset(12),
        read: state => state.offset(),
        expected: 12,
      },
      {
        setter: 'setShowDelay',
        set: state => state.setShowDelay(50),
        read: state => state.showDelay(),
        expected: 50,
      },
      {
        setter: 'setHideDelay',
        set: state => state.setHideDelay(75),
        read: state => state.hideDelay(),
        expected: 75,
      },
      {
        setter: 'setFlip',
        set: state => state.setFlip(false),
        read: state => state.flip(),
        expected: false,
      },
      {
        setter: 'setShift',
        set: state => state.setShift(false),
        read: state => state.shift(),
        expected: false,
      },
      {
        setter: 'setContainer',
        set: state => state.setContainer('#host'),
        read: state => state.container(),
        expected: '#host',
      },
      {
        setter: 'setShowOnOverflow',
        set: state => state.setShowOnOverflow(true),
        read: state => state.showOnOverflow(),
        expected: true,
      },
      {
        setter: 'setAnchor',
        set: state => state.setAnchor(anchorElement),
        read: state => state.anchor(),
        expected: anchorElement,
      },
      {
        setter: 'setContext',
        set: state => state.setContext('ctx'),
        read: state => state.context(),
        expected: 'ctx',
      },
      {
        setter: 'setUseTextContent',
        set: state => state.setUseTextContent(false),
        read: state => state.useTextContent(),
        expected: false,
      },
      {
        setter: 'setTrackPosition',
        set: state => state.setTrackPosition(true),
        read: state => state.trackPosition(),
        expected: true,
      },
      {
        setter: 'setScrollBehavior',
        set: state => state.setScrollBehavior('close'),
        read: state => state.scrollBehavior(),
        expected: 'close',
      },
      {
        setter: 'setCooldown',
        set: state => state.setCooldown(250),
        read: state => state.cooldown(),
        expected: 250,
      },
      {
        setter: 'setHoverableContent',
        set: state => state.setHoverableContent(true),
        read: state => state.hoverableContent(),
        expected: true,
      },
      {
        setter: 'setTooltipId',
        set: state => state.setTooltipId('custom-id'),
        read: state => state.tooltipId(),
        expected: 'custom-id',
      },
    ];

    it.each(cases)('should update the state through $setter', async ({ set, read, expected }) => {
      const { state } = await renderWithState();

      set(state());

      expect(read(state())).toBe(expected);
    });

    it('should update the state through setPosition', async () => {
      const { state } = await renderWithState();

      state().setPosition({ x: 10, y: 20 });

      expect(state().position()).toEqual({ x: 10, y: 20 });
    });

    it('should warn but still apply when a state signal is written directly', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const { state } = await renderWithState();

      state().offset.set(16);

      expect(state().offset()).toBe(16);
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('setOffset'));
      warn.mockRestore();
    });

    it('should render the content passed to setTooltip', async () => {
      const { fixture, state, trigger } = await renderWithState();

      state().setTooltip('Replacement tooltip');
      fixture.detectChanges();

      fireEvent.mouseEnter(trigger);

      await waitFor(() => {
        expect(document.querySelector('[role="tooltip"]')?.textContent?.trim()).toBe(
          'Replacement tooltip',
        );
      });
    });

    it('should not show once disabled through setDisabled', async () => {
      const { fixture, state, trigger } = await renderWithState();

      state().setDisabled(true);
      fixture.detectChanges();

      fireEvent.mouseEnter(trigger);

      // Give the overlay a chance to appear so the assertion is not trivially true.
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(document.querySelector('[ngpTooltip]')).not.toBeInTheDocument();
    });

    it('should reflect setPlacement on the tooltip', async () => {
      const { state, trigger } = await renderWithState();

      state().setPlacement('right');
      fireEvent.mouseEnter(trigger);

      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')).toHaveAttribute('data-placement', 'right');
      });
    });

    it('should offset the tooltip by the value passed to setOffset', async () => {
      const { state, trigger } = await renderWithState();

      state().setPlacement('bottom');
      state().setOffset(60);
      state().setFlip(false);
      state().setShift(false);
      fireEvent.mouseEnter(trigger);

      // Floating UI positions asynchronously, so poll rather than measuring once.
      await waitFor(() => {
        const gap =
          document.querySelector('[ngpTooltip]')!.getBoundingClientRect().top -
          trigger.getBoundingClientRect().bottom;

        expect(gap).toBeCloseTo(60, 0);
      });
    });

    it('should delay showing by the value passed to setShowDelay', async () => {
      const { state, trigger } = await renderWithState();

      state().setShowDelay(150);
      fireEvent.mouseEnter(trigger);

      expect(document.querySelector('[ngpTooltip]')).not.toBeInTheDocument();

      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
      });
    });

    it('should delay hiding by the value passed to setHideDelay', async () => {
      const { state, trigger } = await renderWithState();

      state().setHideDelay(150);
      fireEvent.mouseEnter(trigger);

      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
      });

      fireEvent.mouseLeave(trigger);

      expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();

      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')).not.toBeInTheDocument();
      });
    });

    it('should attach the tooltip to the element passed to setContainer', async () => {
      const host = document.createElement('div');
      host.id = 'setter-tooltip-host';
      document.body.appendChild(host);

      const { state, trigger } = await renderWithState();

      state().setContainer(host);
      fireEvent.mouseEnter(trigger);

      await waitFor(() => {
        expect(host.querySelector('[ngpTooltip]')).toBeInTheDocument();
      });

      host.remove();
    });

    it('should position the tooltip against the element passed to setAnchor', async () => {
      const { state, trigger } = await renderWithState();

      const anchor = document.createElement('div');
      anchor.style.cssText = 'position:fixed;top:400px;left:40px;width:80px;height:20px;';
      document.body.appendChild(anchor);

      state().setAnchor(anchor);
      state().setPlacement('bottom');
      state().setOffset(0);
      state().setFlip(false);
      state().setShift(false);

      fireEvent.mouseEnter(trigger);

      await waitFor(() => {
        const tooltipTop = document.querySelector('[ngpTooltip]')!.getBoundingClientRect().top;

        expect(tooltipTop).toBeCloseTo(anchor.getBoundingClientRect().bottom, 0);
      });

      anchor.remove();
    });

    it('should position the tooltip at the coordinates passed to setPosition', async () => {
      const { state, trigger } = await renderWithState();

      state().setPlacement('bottom');
      state().setOffset(0);
      state().setFlip(false);
      state().setShift(false);
      state().setPosition({ x: 150, y: 250 });

      fireEvent.mouseEnter(trigger);

      await waitFor(() => {
        const tooltip = document.querySelector('[ngpTooltip]')!.getBoundingClientRect();

        expect(tooltip.top).toBeCloseTo(250, 0);
      });
    });

    it('should suppress the tooltip when setShowOnOverflow is enabled and the trigger fits', async () => {
      const { state, trigger } = await renderWithState();

      state().setShowOnOverflow(true);
      fireEvent.mouseEnter(trigger);

      // Give the overlay a chance to appear so the assertion is not trivially true.
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(document.querySelector('[ngpTooltip]')).not.toBeInTheDocument();
    });

    it('should stop falling back to the trigger text when setUseTextContent is disabled', async () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const markup = `<button ngpTooltipTrigger ngpTooltipTriggerShowDelay="0" tooltipState>Trigger text</button>`;

      const { state, trigger } = await renderWithState(markup);

      fireEvent.mouseEnter(trigger);

      await waitFor(() => {
        expect(document.querySelector('[role="tooltip"]')?.textContent?.trim()).toBe(
          'Trigger text',
        );
      });

      fireEvent.mouseLeave(trigger);
      await waitFor(() => {
        expect(document.querySelector('[role="tooltip"]')).not.toBeInTheDocument();
      });

      state().setUseTextContent(false);
      fireEvent.mouseEnter(trigger);

      // Give the overlay a chance to appear so the assertion is not trivially true.
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(document.querySelector('[role="tooltip"]')).not.toBeInTheDocument();

      error.mockRestore();
    });

    it('should keep the tooltip open on content hover once setHoverableContent is enabled', async () => {
      const { state, trigger } = await renderWithState();

      state().setHoverableContent(true);
      fireEvent.mouseEnter(trigger);

      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
      });

      const tooltip = document.querySelector('[ngpTooltip]') as HTMLElement;
      fireEvent.mouseLeave(trigger, { clientX: 0, clientY: 0 });
      fireEvent.mouseEnter(tooltip);

      // Without hoverable content the tooltip hides on mouseleave, so settle first.
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
    });
  });
});
