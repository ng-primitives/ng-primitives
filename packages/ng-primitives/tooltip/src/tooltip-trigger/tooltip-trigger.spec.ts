import { fireEvent, render, waitFor } from '@testing-library/angular';
import { NgpTooltip, NgpTooltipTrigger, provideTooltipConfig } from 'ng-primitives/tooltip';

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
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

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
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

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
