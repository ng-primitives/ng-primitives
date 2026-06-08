import { fireEvent, render, waitFor } from '@testing-library/angular';
import { NgpTooltip, NgpTooltipTrigger, provideTooltipConfig } from 'ng-primitives/tooltip';
import { describe, expect, it, vi, afterEach } from 'vitest';

describe('NgpTooltipTrigger', () => {
  afterEach(() => {
    // Clean up any remaining tooltips from DOM between tests
    document.querySelectorAll('[ngpTooltip]').forEach(el => el.remove());
    vi.useRealTimers();
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

  describe('id / aria-describedby', () => {
    it('should give the tooltip a generated id and link the trigger via aria-describedby', async () => {
      const { getByRole } = await render(
        `
          <button [ngpTooltipTrigger]="content"></button>

          <ng-template #content>
            <div ngpTooltip>Tooltip content</div>
          </ng-template>
        `,
        {
          imports: [NgpTooltipTrigger, NgpTooltip],
        },
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
          <button [ngpTooltipTrigger]="content"></button>

          <ng-template #content>
            <div ngpTooltip id="custom-tooltip-id">Tooltip content</div>
          </ng-template>
        `,
        {
          imports: [NgpTooltipTrigger, NgpTooltip],
        },
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

    expect(tooltip).toBeInTheDocument();
  });

  describe('useTextContent', () => {
    it('should show tooltip with trigger element text content when useTextContent is enabled', async () => {
      const { getByRole } = await render(`<button ngpTooltipTrigger>Button text</button>`, {
        imports: [NgpTooltipTrigger, NgpTooltip],
      });

      const trigger = getByRole('button');
      fireEvent.mouseEnter(trigger);

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
        {
          imports: [NgpTooltipTrigger, NgpTooltip],
        },
      );

      const trigger = getByRole('button');
      fireEvent.mouseEnter(trigger);

      // Wait a bit to ensure tooltip doesn't show
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
        {
          imports: [NgpTooltipTrigger, NgpTooltip],
        },
      );

      const trigger = getByRole('button');
      fireEvent.mouseEnter(trigger);

      await waitFor(() => {
        const tooltip = document.querySelector('[role="tooltip"]');
        expect(tooltip).toBeInTheDocument();
        expect(tooltip?.textContent?.trim()).toBe('Template content');
      });
    });

    it('should use global config for useTextContent when not specified on element', async () => {
      const { getByRole } = await render(`<button ngpTooltipTrigger>Button text</button>`, {
        imports: [NgpTooltipTrigger, NgpTooltip],
        providers: [
          provideTooltipConfig({
            useTextContent: true,
          }),
        ],
      });

      const trigger = getByRole('button');
      fireEvent.mouseEnter(trigger);

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
          providers: [
            provideTooltipConfig({
              useTextContent: true,
            }),
          ],
        },
      );

      const trigger = getByRole('button');
      fireEvent.mouseEnter(trigger);

      await waitFor(() => {
        const tooltip = document.querySelector('[role="tooltip"]');
        expect(tooltip).toBeInTheDocument();
        expect(tooltip?.textContent?.trim()).toBe('Template content');
      });
    });

    it('should trim whitespace from text content', async () => {
      const { getByRole } = await render(
        `<button ngpTooltipTrigger ngpTooltipTriggerUseTextContent="true">   Button text with whitespace   </button>`,
        {
          imports: [NgpTooltipTrigger, NgpTooltip],
        },
      );

      const trigger = getByRole('button');
      fireEvent.mouseEnter(trigger);

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
        {
          imports: [NgpTooltipTrigger, NgpTooltip],
        },
      );

      const trigger = getByRole('button');
      fireEvent.mouseEnter(trigger);

      // Wait a bit to ensure the error is logged
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify the error was logged
      expect(consoleSpy).toHaveBeenCalledWith(
        '[ngpTooltipTrigger]: Tooltip must be a string, TemplateRef, or ComponentType. Alternatively, set useTextContent to true if none is provided.',
      );

      consoleSpy.mockRestore();
    });
  });

  describe('disabled', () => {
    it('should not show tooltip on mouseenter when disabled', async () => {
      const { getByRole } = await render(
        `
          <button [ngpTooltipTrigger]="content" ngpTooltipTriggerDisabled="true"></button>

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

    it('should not show tooltip on focus when disabled', async () => {
      const { getByRole } = await render(
        `
          <button [ngpTooltipTrigger]="content" ngpTooltipTriggerDisabled="true"></button>

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
      fireEvent.focus(trigger);

      // Wait a bit to ensure tooltip doesn't show
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(document.querySelector('[ngpTooltip]')).not.toBeInTheDocument();
    });

    it('should allow programmatic show() when disabled', async () => {
      const { fixture } = await render(
        `
          <button [ngpTooltipTrigger]="content" ngpTooltipTriggerDisabled="true" #trigger="ngpTooltipTrigger"></button>

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

      const triggerDirective = fixture.debugElement.children[0].injector.get(NgpTooltipTrigger);

      // Programmatically show the tooltip
      triggerDirective.show();

      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
      });
    });

    it('should allow programmatic hide() when disabled', async () => {
      const { fixture } = await render(
        `
          <button [ngpTooltipTrigger]="content" ngpTooltipTriggerDisabled="true" ngpTooltipTriggerHideDelay="0" #trigger="ngpTooltipTrigger"></button>

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

      const triggerDirective = fixture.debugElement.children[0].injector.get(NgpTooltipTrigger);

      // Programmatically show the tooltip
      triggerDirective.show();

      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
      });

      // Programmatically hide the tooltip
      triggerDirective.hide();

      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')).not.toBeInTheDocument();
      });
    });

    it('should not hide tooltip on mouseleave when disabled (if shown programmatically)', async () => {
      const { fixture, getByRole } = await render(
        `
          <button [ngpTooltipTrigger]="content" ngpTooltipTriggerDisabled="true" #trigger="ngpTooltipTrigger"></button>

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
      const triggerDirective = fixture.debugElement.children[0].injector.get(NgpTooltipTrigger);

      // Programmatically show the tooltip
      triggerDirective.show();

      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
      });

      // Fire mouseleave event - tooltip should NOT hide because disabled
      fireEvent.mouseLeave(trigger);

      // Wait a bit and verify tooltip is still there
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
    });

    it('should not hide tooltip on blur when disabled (if shown programmatically)', async () => {
      const { fixture, getByRole } = await render(
        `
          <button [ngpTooltipTrigger]="content" ngpTooltipTriggerDisabled="true" #trigger="ngpTooltipTrigger"></button>

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
      const triggerDirective = fixture.debugElement.children[0].injector.get(NgpTooltipTrigger);

      // Programmatically show the tooltip
      triggerDirective.show();

      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
      });

      // Fire blur event - tooltip should NOT hide because disabled
      fireEvent.blur(trigger);

      // Wait a bit and verify tooltip is still there
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
    });
  });

  describe('trackPosition', () => {
    it('should accept trackPosition attribute', async () => {
      const { getByRole } = await render(
        `
          <button [ngpTooltipTrigger]="content" ngpTooltipTriggerTrackPosition></button>

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
      });
    });

    it('should use global config for trackPosition when not specified on element', async () => {
      const { getByRole } = await render(
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
          providers: [
            provideTooltipConfig({
              trackPosition: true,
            }),
          ],
        },
      );

      const trigger = getByRole('button');
      fireEvent.mouseEnter(trigger);

      await waitFor(() => {
        const tooltip = document.querySelector('[ngpTooltip]');
        expect(tooltip).toBeInTheDocument();
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
            <div ngpTooltip>
              Tooltip content
            </div>
          </ng-template>
        `,
        {
          imports: [NgpTooltipTrigger, NgpTooltip],
        },
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
            <div ngpTooltip>
              Tooltip content
            </div>
          </ng-template>
        `,
        {
          imports: [NgpTooltipTrigger, NgpTooltip],
        },
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
            <div ngpTooltip>
              Tooltip content
            </div>
          </ng-template>
        `,
        {
          imports: [NgpTooltipTrigger, NgpTooltip],
          providers: [
            provideTooltipConfig({
              scrollBehavior: 'close',
            }),
          ],
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
        {
          imports: [NgpTooltipTrigger, NgpTooltip],
        },
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
        {
          imports: [NgpTooltipTrigger, NgpTooltip],
        },
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
        {
          imports: [NgpTooltipTrigger, NgpTooltip],
        },
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
        {
          imports: [NgpTooltipTrigger, NgpTooltip],
        },
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
        {
          imports: [NgpTooltipTrigger, NgpTooltip],
        },
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
        {
          imports: [NgpTooltipTrigger, NgpTooltip],
        },
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
        {
          imports: [NgpTooltipTrigger, NgpTooltip],
        },
      );

      fireEvent.mouseEnter(getByRole('button'));

      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
      });
    });
  });

  describe('text content styling', () => {
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
        {
          imports: [NgpTooltipTrigger, NgpTooltip],
        },
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
        {
          imports: [NgpTooltipTrigger, NgpTooltip],
        },
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
          {
            imports: [NgpTooltipTrigger, NgpTooltip],
          },
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
          {
            imports: [NgpTooltipTrigger, NgpTooltip],
          },
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
          {
            imports: [NgpTooltipTrigger, NgpTooltip],
          },
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
          {
            imports: [NgpTooltipTrigger, NgpTooltip],
          },
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
        {
          imports: [NgpTooltipTrigger, NgpTooltip],
        },
      );

      const trigger = getByRole('button');
      fireEvent.mouseEnter(trigger);

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
        {
          imports: [NgpTooltipTrigger, NgpTooltip],
        },
      );

      const trigger = getByRole('button');
      fireEvent.mouseEnter(trigger);

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
        {
          imports: [NgpTooltipTrigger, NgpTooltip],
        },
      );

      const trigger = getByRole('button');

      // Should be able to open tooltip with anchor element configured
      fireEvent.mouseEnter(trigger);

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
            #trigger="ngpTooltipTrigger"
          ></button>

          <ng-template #content>
            <div ngpTooltip>
              Tooltip content
            </div>
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

      // Programmatically show the tooltip
      triggerDirective.show();

      await waitFor(() => {
        const tooltip = document.querySelector('[ngpTooltip]');
        expect(tooltip).toBeInTheDocument();
      });
    });

    it('should allow null position to use trigger element positioning', async () => {
      const { fixture } = await render(
        `
          <button
            [ngpTooltipTrigger]="content"
            [ngpTooltipTriggerPosition]="position"
            ngpTooltipTriggerDisabled="true"
            #trigger="ngpTooltipTrigger"
          ></button>

          <ng-template #content>
            <div ngpTooltip>
              Tooltip content
            </div>
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

      // Programmatically show the tooltip
      triggerDirective.show();

      await waitFor(() => {
        const tooltip = document.querySelector('[ngpTooltip]');
        expect(tooltip).toBeInTheDocument();
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
            #trigger="ngpTooltipTrigger"
          ></button>

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

      const triggerDirective = fixture.debugElement.children[0].injector.get(NgpTooltipTrigger);

      // Programmatically show the tooltip
      triggerDirective.show();

      await waitFor(() => {
        const tooltip = document.querySelector('[ngpTooltip]');
        expect(tooltip).toBeInTheDocument();
      });

      // Tooltip should still be visible with trackPosition enabled
      await waitFor(() => {
        const tooltip = document.querySelector('[ngpTooltip]');
        expect(tooltip).toBeInTheDocument();
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
            #trigger="ngpTooltipTrigger"
          ></button>

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

      const triggerDirective = fixture.debugElement.children[0].injector.get(NgpTooltipTrigger);

      // Programmatically show the tooltip
      triggerDirective.show();

      await waitFor(() => {
        const tooltip = document.querySelector('[ngpTooltip]');
        expect(tooltip).toBeInTheDocument();
        // Tooltip should have left and top position styles applied
        const tooltipElement = tooltip as HTMLElement;
        expect(tooltipElement.style.left).toBeTruthy();
        expect(tooltipElement.style.top).toBeTruthy();
      });
    });
  });
});
