import { Component, Directive, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { fireEvent, render, waitFor } from '@testing-library/angular';
import { NgpPopover, NgpPopoverTrigger } from 'ng-primitives/popover';
import { NgpTooltip, NgpTooltipTrigger, provideTooltipConfig } from 'ng-primitives/tooltip';
import { describe, expect, it, vi } from 'vitest';
import { injectPopoverTriggerState } from './popover-trigger-state';

@Component({
  template: `
    <button [ngpPopoverTrigger]="content" (ngpPopoverTriggerOpenChange)="onOpenChange($event)">
      Open Popover
    </button>

    <ng-template #content>
      <div ngpPopover>Popover content</div>
    </ng-template>
  `,
  imports: [NgpPopoverTrigger, NgpPopover],
})
class OpenChangeTestComponent {
  onOpenChange = vi.fn();
}

describe('NgpPopoverTrigger', () => {
  it('should destroy the overlay when the trigger is destroyed', async () => {
    const { fixture, getByRole } = await render(OpenChangeTestComponent);

    const trigger = getByRole('button');
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
    });

    fixture.destroy();

    await waitFor(() => {
      expect(document.querySelector('[ngpPopover]')).not.toBeInTheDocument();
    });
  });

  it('should emit openChange event with correct state', async () => {
    const { fixture, getByRole } = await render(OpenChangeTestComponent);
    const component = fixture.componentInstance;
    const trigger = getByRole('button');

    expect(component.onOpenChange).not.toHaveBeenCalled();

    fireEvent.click(trigger);

    await waitFor(() => {
      expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
      expect(component.onOpenChange).toHaveBeenCalledTimes(1);
      expect(component.onOpenChange).toHaveBeenCalledWith(true);
    });

    fireEvent.click(trigger);

    await waitFor(() => {
      expect(document.querySelector('[ngpPopover]')).not.toBeInTheDocument();
      expect(component.onOpenChange).toHaveBeenCalledTimes(2);
      expect(component.onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it('should emit openChange false when closing on outside click', async () => {
    const { fixture, getByRole } = await render(OpenChangeTestComponent);
    const component = fixture.componentInstance;
    const trigger = getByRole('button');

    fireEvent.click(trigger);

    await waitFor(() => {
      expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
      expect(component.onOpenChange).toHaveBeenCalledTimes(1);
      expect(component.onOpenChange).toHaveBeenCalledWith(true);
    });

    fireEvent.mouseUp(document.body);

    await waitFor(() => {
      expect(document.querySelector('[ngpPopover]')).not.toBeInTheDocument();
      expect(component.onOpenChange).toHaveBeenCalledTimes(2);
      expect(component.onOpenChange).toHaveBeenLastCalledWith(false);
    });
  });

  it('should emit openChange false when closing on Escape', async () => {
    const { fixture, getByRole } = await render(OpenChangeTestComponent);
    const component = fixture.componentInstance;
    const trigger = getByRole('button');

    fireEvent.click(trigger);

    await waitFor(() => {
      expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
      expect(component.onOpenChange).toHaveBeenCalledTimes(1);
      expect(component.onOpenChange).toHaveBeenCalledWith(true);
    });

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => {
      expect(document.querySelector('[ngpPopover]')).not.toBeInTheDocument();
      expect(component.onOpenChange).toHaveBeenCalledTimes(2);
      expect(component.onOpenChange).toHaveBeenLastCalledWith(false);
    });
  });

  it('should emit openChange false when destroyed while open', async () => {
    const { fixture, getByRole } = await render(OpenChangeTestComponent);
    const component = fixture.componentInstance;
    const trigger = getByRole('button');

    fireEvent.click(trigger);

    await waitFor(() => {
      expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
      expect(component.onOpenChange).toHaveBeenCalledWith(true);
    });

    component.onOpenChange.mockClear();

    // Destroy while open — should emit false
    fixture.destroy();
    expect(component.onOpenChange).toHaveBeenCalledWith(false);
    expect(component.onOpenChange).toHaveBeenCalledTimes(1);
  });

  it('should not emit openChange on destroy when already closed', async () => {
    const { fixture, getByRole } = await render(OpenChangeTestComponent);
    const component = fixture.componentInstance;
    const trigger = getByRole('button');

    fireEvent.click(trigger);

    await waitFor(() => {
      expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
      expect(component.onOpenChange).toHaveBeenCalledWith(true);
    });

    fireEvent.click(trigger);

    await waitFor(() => {
      expect(document.querySelector('[ngpPopover]')).not.toBeInTheDocument();
      expect(component.onOpenChange).toHaveBeenCalledWith(false);
    });

    expect(component.onOpenChange).toHaveBeenCalledTimes(2);
    component.onOpenChange.mockClear();

    // Destroy the component — should NOT emit openChange
    fixture.destroy();
    expect(component.onOpenChange).not.toHaveBeenCalled();
  });

  it('should position popover relative to anchor element when provided', async () => {
    @Component({
      template: `
        <div
          #anchor
          style="position: absolute; top: 100px; left: 200px; width: 50px; height: 30px;"
        >
          Anchor Element
        </div>
        <button
          [ngpPopoverTrigger]="content"
          [ngpPopoverTriggerAnchor]="anchor"
          style="position: absolute; top: 300px; left: 400px;"
        >
          Trigger
        </button>

        <ng-template #content>
          <div ngpPopover>Popover content</div>
        </ng-template>
      `,
      imports: [NgpPopoverTrigger, NgpPopover],
    })
    class AnchorTestComponent {}

    const { getByRole } = await render(AnchorTestComponent);
    const trigger = getByRole('button');

    fireEvent.click(trigger);

    await waitFor(() => {
      expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
    });

    // The popover should be positioned relative to the anchor element (top: 100px, left: 200px)
    // rather than the trigger element (top: 300px, left: 400px)
    const popover = document.querySelector('[ngpPopover]') as HTMLElement;
    const popoverRect = popover.getBoundingClientRect();

    // The popover should be positioned close to the anchor's position (200px left)
    // rather than near the trigger's position (400px left)
    expect(popoverRect.left).toBeLessThan(300); // Should be closer to anchor (200px) than trigger (400px)
  });

  it('should fall back to trigger element when anchor is null', async () => {
    @Component({
      template: `
        <button
          [ngpPopoverTrigger]="content"
          [ngpPopoverTriggerAnchor]="null"
          style="position: absolute; top: 100px; left: 200px;"
        >
          Trigger
        </button>

        <ng-template #content>
          <div ngpPopover>Popover content</div>
        </ng-template>
      `,
      imports: [NgpPopoverTrigger, NgpPopover],
    })
    class NullAnchorTestComponent {}

    const { getByRole } = await render(NullAnchorTestComponent);
    const trigger = getByRole('button');

    fireEvent.click(trigger);

    await waitFor(() => {
      expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
    });

    // Should position relative to trigger when anchor is null
    const popover = document.querySelector('[ngpPopover]') as HTMLElement;
    expect(popover).toBeInTheDocument();
  });

  it('should not leak ControlContainer into overlay content', async () => {
    @Component({
      template: `
        <form [formGroup]="form">
          <button [ngpPopoverTrigger]="content">Open</button>
        </form>

        <ng-template #content>
          <div ngpPopover>
            <input [(ngModel)]="value" />
          </div>
        </ng-template>
      `,
      imports: [NgpPopoverTrigger, NgpPopover, ReactiveFormsModule, FormsModule],
    })
    class FormLeakTestComponent {
      form = new FormGroup({});
      value = '';
    }

    const { getByRole } = await render(FormLeakTestComponent);
    const trigger = getByRole('button');

    // This would throw NG01350 if ControlContainer leaked into the overlay
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
      expect(document.querySelector('input')).toBeInTheDocument();
    });
  });

  it('should not leak ControlContainer into overlay content (template inside form, ngModel)', async () => {
    @Component({
      template: `
        <form [formGroup]="form">
          <button [ngpPopoverTrigger]="content">Open</button>

          <ng-template #content>
            <div ngpPopover>
              <input [(ngModel)]="value" />
            </div>
          </ng-template>
        </form>
      `,
      imports: [NgpPopoverTrigger, NgpPopover, ReactiveFormsModule, FormsModule],
    })
    class FormLeakInsideFormNgModelComponent {
      form = new FormGroup({});
      value = '';
    }

    const { getByRole } = await render(FormLeakInsideFormNgModelComponent);
    const trigger = getByRole('button');

    // NG01350 would be thrown if ControlContainer leaked from the parent form
    // into the overlay when the template is declared inside the form.
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
      expect(document.querySelector('input')).toBeInTheDocument();
    });
  });

  it('should not leak ControlContainer into overlay content (template inside form, formControlName)', async () => {
    @Component({
      template: `
        <form [formGroup]="outerForm">
          <input formControlName="outerField" />
          <button [ngpPopoverTrigger]="content">Open</button>

          <ng-template #content>
            <div ngpPopover>
              <form [formGroup]="innerForm">
                <input formControlName="innerField" />
              </form>
            </div>
          </ng-template>
        </form>
      `,
      imports: [NgpPopoverTrigger, NgpPopover, ReactiveFormsModule],
    })
    class FormLeakInsideFormControlNameComponent {
      outerForm = new FormGroup({
        outerField: new FormControl('outer'),
      });
      innerForm = new FormGroup({
        innerField: new FormControl('inner'),
      });
    }

    const { getByRole } = await render(FormLeakInsideFormControlNameComponent);
    const trigger = getByRole('button');

    // The inner formControlName should bind to innerForm, not the outer form
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
      const inputs = document.querySelectorAll('[ngpPopover] input');
      expect(inputs.length).toBe(1);
    });
  });

  it('should not leak ControlContainer to child components with formControlName', async () => {
    @Component({
      selector: 'test-child-form',
      template: `
        <form [formGroup]="innerForm">
          <input formControlName="name" />
        </form>
      `,
      imports: [ReactiveFormsModule],
    })
    class TestChildFormComponent {
      readonly innerForm = new FormGroup({
        name: new FormControl('test-value'),
      });
    }

    @Component({
      template: `
        <form [formGroup]="outerForm">
          <button [ngpPopoverTrigger]="content">Open</button>

          <ng-template #content>
            <div ngpPopover>
              <test-child-form />
            </div>
          </ng-template>
        </form>
      `,
      imports: [NgpPopoverTrigger, NgpPopover, ReactiveFormsModule, TestChildFormComponent],
    })
    class FormControlNameLeakComponent {
      outerForm = new FormGroup({});
    }

    const { getByRole } = await render(FormControlNameLeakComponent);
    const trigger = getByRole('button');

    // The child component's formControlName should resolve against its own form,
    // not the outer form from the host component
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
      expect(document.querySelector('input')).toBeInTheDocument();
    });
  });

  it('should accept anchor element input', async () => {
    @Component({
      template: `
        <div #anchor>Anchor Element</div>
        <button [ngpPopoverTrigger]="content" [ngpPopoverTriggerAnchor]="anchor">Trigger</button>

        <ng-template #content>
          <div ngpPopover>Popover content</div>
        </ng-template>
      `,
      imports: [NgpPopoverTrigger, NgpPopover],
    })
    class AnchorInputTestComponent {}

    const { getByRole } = await render(AnchorInputTestComponent);
    const trigger = getByRole('button');

    // Should be able to open popover with anchor element configured
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
    });
  });

  it('should close previous popover when combining tooltip with popover on buttons (fixes #728)', async () => {
    @Component({
      template: `
        <!-- Button A with tooltip + popover -->
        <button
          [ngpTooltipTrigger]="tooltipA"
          [ngpPopoverTrigger]="popoverA"
          data-testid="button-a"
        >
          Button A
        </button>
        <ng-template #tooltipA>
          <div ngpTooltip>Tooltip A</div>
        </ng-template>
        <ng-template #popoverA>
          <div ngpPopover data-testid="popover-a">Popover A</div>
        </ng-template>

        <!-- Button B with tooltip + popover -->
        <button
          [ngpTooltipTrigger]="tooltipB"
          [ngpPopoverTrigger]="popoverB"
          data-testid="button-b"
        >
          Button B
        </button>
        <ng-template #tooltipB>
          <div ngpTooltip>Tooltip B</div>
        </ng-template>
        <ng-template #popoverB>
          <div ngpPopover data-testid="popover-b">Popover B</div>
        </ng-template>
      `,
      imports: [NgpPopoverTrigger, NgpPopover, NgpTooltipTrigger, NgpTooltip],
    })
    class TooltipWithPopoverComponent {}

    const { getByTestId } = await render(TooltipWithPopoverComponent);
    const buttonA = getByTestId('button-a');
    const buttonB = getByTestId('button-b');

    // Click Button A → opens Popover A
    fireEvent.click(buttonA);

    await waitFor(() => {
      expect(document.querySelector('[data-testid="popover-a"]')).toBeInTheDocument();
    });

    // Click Button B → should close Popover A and open Popover B
    fireEvent.click(buttonB);

    await waitFor(() => {
      // Popover A should be closed
      expect(document.querySelector('[data-testid="popover-a"]')).not.toBeInTheDocument();
      // Only Popover B should be open
      expect(document.querySelector('[data-testid="popover-b"]')).toBeInTheDocument();
    });
  });

  it('should close popover A when clicking button B (no tooltips)', async () => {
    @Component({
      template: `
        <button [ngpPopoverTrigger]="contentA">Button A</button>
        <button [ngpPopoverTrigger]="contentB">Button B</button>

        <ng-template #contentA>
          <div ngpPopover>Popover A</div>
        </ng-template>
        <ng-template #contentB>
          <div ngpPopover>Popover B</div>
        </ng-template>
      `,
      imports: [NgpPopoverTrigger, NgpPopover],
    })
    class TwoPopoversComponent {}

    const { getAllByRole } = await render(TwoPopoversComponent);
    const [buttonA, buttonB] = getAllByRole('button');

    // Open popover A
    fireEvent.click(buttonA);
    await waitFor(() => {
      expect(document.querySelectorAll('[ngpPopover]').length).toBe(1);
      expect(document.querySelector('[ngpPopover]')!.textContent).toContain('Popover A');
    });

    // Click button B — fire mouseUp first (overlay registry listens for mouseup),
    // then click (popover trigger listens for click)
    fireEvent.mouseUp(buttonB);
    fireEvent.click(buttonB);
    await waitFor(() => {
      const popovers = document.querySelectorAll('[ngpPopover]');
      expect(popovers.length).toBe(1);
      expect(popovers[0].textContent).toContain('Popover B');
    });
  });

  it('should close popover A when clicking button B that has a tooltip open', async () => {
    @Component({
      template: `
        <button [ngpPopoverTrigger]="contentA" [ngpTooltipTrigger]="tooltipA">Button A</button>
        <button [ngpPopoverTrigger]="contentB" [ngpTooltipTrigger]="tooltipB">Button B</button>

        <ng-template #contentA>
          <div ngpPopover>Popover A</div>
        </ng-template>
        <ng-template #contentB>
          <div ngpPopover>Popover B</div>
        </ng-template>
        <ng-template #tooltipA>
          <div ngpTooltip>Tooltip A</div>
        </ng-template>
        <ng-template #tooltipB>
          <div ngpTooltip>Tooltip B</div>
        </ng-template>
      `,
      imports: [NgpPopoverTrigger, NgpPopover, NgpTooltipTrigger, NgpTooltip],
    })
    class TwoPopoversWithTooltipsComponent {}

    const { getAllByRole } = await render(TwoPopoversWithTooltipsComponent, {
      providers: [provideTooltipConfig({ showDelay: 0, hideDelay: 0 })],
    });
    const [buttonA, buttonB] = getAllByRole('button');

    // Open popover A
    fireEvent.click(buttonA);
    await waitFor(() => {
      expect(document.querySelectorAll('[ngpPopover]').length).toBe(1);
      expect(document.querySelector('[ngpPopover]')!.textContent).toContain('Popover A');
    });

    // Hover button B to show its tooltip
    fireEvent.mouseEnter(buttonB);
    await waitFor(() => {
      expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
    });

    // Click button B — fire mouseUp first (overlay registry listens for mouseup),
    // then click (popover trigger listens for click)
    fireEvent.mouseUp(buttonB);
    fireEvent.click(buttonB);
    await waitFor(() => {
      const popovers = document.querySelectorAll('[ngpPopover]');
      expect(popovers.length).toBe(1);
      expect(popovers[0].textContent).toContain('Popover B');
    });
  });

  describe('nested popovers', () => {
    @Component({
      template: `
        <button [ngpPopoverTrigger]="outer" data-testid="outer-trigger">Open panel</button>

        <ng-template #outer>
          <div ngpPopover data-testid="outer-popover">
            <button [ngpPopoverTrigger]="inner" data-testid="inner-trigger">Open calendar</button>
          </div>
        </ng-template>

        <ng-template #inner>
          <div ngpPopover data-testid="inner-popover">Inner content</div>
        </ng-template>
      `,
      imports: [NgpPopoverTrigger, NgpPopover],
    })
    class NestedPopoverComponent {}

    it('should keep the outer popover open when opening a popover nested inside it', async () => {
      const { getByTestId } = await render(NestedPopoverComponent);

      // Open the outer popover
      fireEvent.click(getByTestId('outer-trigger'));

      await waitFor(() => {
        expect(document.querySelector('[data-testid="outer-popover"]')).toBeInTheDocument();
      });

      // Click the trigger that lives inside the outer popover content. The inner popover
      // shares the same overlay type ('popover'), but as a descendant it must not evict
      // its ancestor.
      const innerTrigger = document.querySelector('[data-testid="inner-trigger"]') as HTMLElement;
      fireEvent.click(innerTrigger);

      await waitFor(() => {
        // The inner popover should open
        expect(document.querySelector('[data-testid="inner-popover"]')).toBeInTheDocument();
      });

      // The outer popover must remain open — it is an ancestor and must not be evicted.
      expect(document.querySelector('[data-testid="outer-popover"]')).toBeInTheDocument();
    });

    it('should restore the outer popover as the active overlay after the nested popover closes', async () => {
      @Component({
        template: `
          <button [ngpPopoverTrigger]="outer" data-testid="outer-trigger">Open panel</button>
          <button [ngpPopoverTrigger]="sibling" data-testid="sibling-trigger">Open sibling</button>

          <ng-template #outer>
            <div ngpPopover data-testid="outer-popover">
              <button [ngpPopoverTrigger]="inner" data-testid="inner-trigger">Open nested</button>
            </div>
          </ng-template>

          <ng-template #inner>
            <div ngpPopover data-testid="inner-popover">Inner content</div>
          </ng-template>

          <ng-template #sibling>
            <div ngpPopover data-testid="sibling-popover">Sibling content</div>
          </ng-template>
        `,
        imports: [NgpPopoverTrigger, NgpPopover],
      })
      class NestedThenSiblingComponent {}

      const { getByTestId } = await render(NestedThenSiblingComponent);

      // Open outer, then the nested popover inside it.
      fireEvent.click(getByTestId('outer-trigger'));
      await waitFor(() => {
        expect(document.querySelector('[data-testid="outer-popover"]')).toBeInTheDocument();
      });

      const innerTrigger = document.querySelector('[data-testid="inner-trigger"]') as HTMLElement;
      fireEvent.click(innerTrigger);
      await waitFor(() => {
        expect(document.querySelector('[data-testid="inner-popover"]')).toBeInTheDocument();
      });

      // Close just the nested popover by clicking its trigger again.
      fireEvent.click(innerTrigger);
      await waitFor(() => {
        expect(document.querySelector('[data-testid="inner-popover"]')).not.toBeInTheDocument();
        expect(document.querySelector('[data-testid="outer-popover"]')).toBeInTheDocument();
      });

      // Opening an unrelated sibling popover should still evict the outer popover
      // (the one-popover-at-a-time rule for siblings is preserved).
      fireEvent.mouseUp(getByTestId('sibling-trigger'));
      fireEvent.click(getByTestId('sibling-trigger'));
      await waitFor(() => {
        expect(document.querySelector('[data-testid="sibling-popover"]')).toBeInTheDocument();
        expect(document.querySelector('[data-testid="outer-popover"]')).not.toBeInTheDocument();
      });
    });
  });

  describe('container', () => {
    it('should expose container on the injected state so it can be set programmatically', async () => {
      @Directive({
        selector: '[setPopoverContainer]',
      })
      class SetPopoverContainerDirective implements OnInit {
        private readonly trigger = injectPopoverTriggerState();

        ngOnInit(): void {
          const host = document.querySelector('#popover-host') as HTMLElement;
          this.trigger().setContainer(host);
        }
      }

      const { getByRole } = await render(
        `
          <div id="popover-host"></div>

          <button [ngpPopoverTrigger]="content" setPopoverContainer>Open Popover</button>

          <ng-template #content>
            <div ngpPopover>Popover content</div>
          </ng-template>
        `,
        {
          imports: [NgpPopoverTrigger, NgpPopover, SetPopoverContainerDirective],
        },
      );

      fireEvent.click(getByRole('button'));

      await waitFor(() => {
        const container = document.querySelector('#popover-host');
        expect(container?.querySelector('[ngpPopover]')).toBeInTheDocument();
      });
    });
  });
});
