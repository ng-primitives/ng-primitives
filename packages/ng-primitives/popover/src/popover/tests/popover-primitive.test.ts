import { Component, Directive, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { fireEvent, render, waitFor } from '@testing-library/angular';
import {
  injectPopoverTriggerState,
  NgpPopover,
  type NgpPopoverPlacement,
  NgpPopoverTrigger,
} from 'ng-primitives/popover';
import { NgpTooltip, NgpTooltipTrigger, provideTooltipConfig } from 'ng-primitives/tooltip';
import { afterEach, describe, expect, it, vi } from 'vitest';

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

@Component({
  template: `
    <button [ngpPopoverTrigger]="content" (ngpPopoverTriggerOpenChange)="onOpenChange($event)">
      Open Popover
    </button>

    <ng-template #content>
      <div ngpPopover>
        <button>Inside</button>
      </div>
    </ng-template>
  `,
  imports: [NgpPopoverTrigger, NgpPopover],
})
class OpenChangeTestComponent {
  readonly onOpenChange = vi.fn();
}

describe('NgpPopover', () => {
  afterEach(() => {
    // Overlay content is attached to the document body, not the fixture, so remove
    // any leftover popovers in case a test ends with one still open.
    document.querySelectorAll('[ngpPopover]').forEach(el => el.remove());
  });

  describe('roles & attributes', () => {
    it('should expose role="dialog" on the popover element', async () => {
      const { getByRole } = await render(PopoverTestComponent);
      fireEvent.click(getByRole('button'));

      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
      });

      const popover = document.querySelector('[ngpPopover]') as HTMLElement;
      expect(popover.getAttribute('role')).toBe('dialog');
    });

    it('should generate a non-empty id on the popover element', async () => {
      const { getByRole } = await render(PopoverTestComponent);
      fireEvent.click(getByRole('button'));

      await waitFor(() => {
        const popover = document.querySelector('[ngpPopover]') as HTMLElement | null;
        expect(popover?.getAttribute('id')).toBeTruthy();
      });
    });

    it('should mark the popover with data-overlay', async () => {
      const { getByRole } = await render(PopoverTestComponent);
      fireEvent.click(getByRole('button'));

      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')).toHaveAttribute('data-overlay');
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

    it('should set data-open on the trigger only while open', async () => {
      const { getByRole } = await render(PopoverTestComponent);
      const trigger = getByRole('button');
      expect(trigger).not.toHaveAttribute('data-open');

      fireEvent.click(trigger);

      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
        expect(trigger).toHaveAttribute('data-open');
      });
    });

    it('should reflect the placement on the trigger via data-placement', async () => {
      const { getByRole } = await render(
        `
          <button [ngpPopoverTrigger]="content" ngpPopoverTriggerPlacement="right">Open</button>
          <ng-template #content><div ngpPopover>Content</div></ng-template>
        `,
        { imports: [NgpPopoverTrigger, NgpPopover] },
      );
      expect(getByRole('button')).toHaveAttribute('data-placement', 'right');
    });

    it('should set data-disabled on the trigger when disabled', async () => {
      const { getByRole } = await render(
        `
          <button [ngpPopoverTrigger]="content" ngpPopoverTriggerDisabled>Open</button>
          <ng-template #content><div ngpPopover>Content</div></ng-template>
        `,
        { imports: [NgpPopoverTrigger, NgpPopover] },
      );
      expect(getByRole('button')).toHaveAttribute('data-disabled');
    });
  });

  describe('open/close via trigger', () => {
    it('should open the popover when the trigger is clicked', async () => {
      const { getByRole } = await render(PopoverTestComponent);
      fireEvent.click(getByRole('button'));

      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
      });
    });

    it('should close the popover when the trigger is clicked again', async () => {
      const { getByRole } = await render(PopoverTestComponent);
      const trigger = getByRole('button');

      fireEvent.click(trigger);
      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
      });

      fireEvent.click(trigger);
      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')).not.toBeInTheDocument();
      });
    });

    it('should open when the trigger is activated via keyboard (event.detail === 0)', async () => {
      const { getByRole } = await render(PopoverTestComponent);
      // A keyboard-activated click reports detail 0.
      fireEvent.click(getByRole('button'), { detail: 0 });

      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
      });
    });
  });

  describe('escape & outside-click close', () => {
    it('should close when the Escape key is pressed', async () => {
      const { getByRole } = await render(PopoverTestComponent);
      fireEvent.click(getByRole('button'));

      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
      });

      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')).not.toBeInTheDocument();
      });
    });

    it('should close when clicking outside the popover', async () => {
      const { getByRole } = await render(PopoverTestComponent);
      fireEvent.click(getByRole('button'));

      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
      });

      fireEvent.mouseUp(document.body);

      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')).not.toBeInTheDocument();
      });
    });

    it('should stay open on Escape when closeOnEscape is false', async () => {
      const { getByRole } = await render(
        `
          <button [ngpPopoverTrigger]="content" [ngpPopoverTriggerCloseOnEscape]="false">Open</button>
          <ng-template #content><div ngpPopover>Content</div></ng-template>
        `,
        { imports: [NgpPopoverTrigger, NgpPopover] },
      );
      fireEvent.click(getByRole('button'));

      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
      });

      fireEvent.keyDown(document, { key: 'Escape' });

      // Give any close handler a chance to run, then assert it stayed open.
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
    });

    it('should stay open on outside click when closeOnOutsideClick is false', async () => {
      const { getByRole } = await render(
        `
          <button [ngpPopoverTrigger]="content" [ngpPopoverTriggerCloseOnOutsideClick]="false">
            Open
          </button>
          <ng-template #content><div ngpPopover>Content</div></ng-template>
        `,
        { imports: [NgpPopoverTrigger, NgpPopover] },
      );
      fireEvent.click(getByRole('button'));

      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
      });

      fireEvent.mouseUp(document.body);

      await new Promise(resolve => setTimeout(resolve, 50));
      expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
    });
  });

  describe('focus management', () => {
    it('should move focus into the popover when opened', async () => {
      const { getByRole } = await render(OpenChangeTestComponent);
      const trigger = getByRole('button', { name: 'Open Popover' });
      trigger.focus();

      fireEvent.click(trigger);

      await waitFor(() => {
        const popover = document.querySelector('[ngpPopover]') as HTMLElement | null;
        expect(popover).toBeInTheDocument();
        expect(popover!.contains(document.activeElement)).toBe(true);
      });
    });

    it('should return focus to the trigger when closed via Escape', async () => {
      const { getByRole } = await render(OpenChangeTestComponent);
      const trigger = getByRole('button', { name: 'Open Popover' });
      trigger.focus();

      fireEvent.click(trigger);
      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
      });

      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')).not.toBeInTheDocument();
        expect(document.activeElement).toBe(trigger);
      });
    });
  });

  describe('aria wiring', () => {
    it('should expose aria-expanded="false" on the trigger when closed', async () => {
      const { getByRole } = await render(PopoverTestComponent);
      expect(getByRole('button')).toHaveAttribute('aria-expanded', 'false');
    });

    it('should toggle aria-expanded to "true" when the popover opens and back to "false" on close', async () => {
      const { getByRole } = await render(PopoverTestComponent);
      const trigger = getByRole('button');

      fireEvent.click(trigger);
      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
      });

      fireEvent.click(trigger);
      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')).not.toBeInTheDocument();
        expect(trigger).toHaveAttribute('aria-expanded', 'false');
      });
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

    it('should advertise the popup with aria-haspopup="dialog"', async () => {
      const { getByRole } = await render(PopoverTestComponent);
      expect(getByRole('button')).toHaveAttribute('aria-haspopup', 'dialog');
    });

    it('should set aria-controls to the popover id while open', async () => {
      const { getByRole } = await render(PopoverTestComponent);
      const trigger = getByRole('button');
      expect(trigger).not.toHaveAttribute('aria-controls');

      fireEvent.click(trigger);

      await waitFor(() => {
        const popover = document.querySelector('[ngpPopover]') as HTMLElement | null;
        expect(popover).toBeInTheDocument();
        expect(trigger.getAttribute('aria-controls')).toBe(popover?.getAttribute('id'));
      });
    });
  });

  describe('disabled trigger', () => {
    it('should not open when a disabled trigger is clicked', async () => {
      const { getByRole } = await render(
        `
          <button [ngpPopoverTrigger]="content" ngpPopoverTriggerDisabled>Open</button>
          <ng-template #content><div ngpPopover>Content</div></ng-template>
        `,
        { imports: [NgpPopoverTrigger, NgpPopover] },
      );

      fireEvent.click(getByRole('button'));

      await new Promise(resolve => setTimeout(resolve, 50));
      expect(document.querySelector('[ngpPopover]')).not.toBeInTheDocument();
    });

    it('should keep aria-expanded="false" on a disabled trigger after a click', async () => {
      const { getByRole } = await render(
        `
          <button [ngpPopoverTrigger]="content" ngpPopoverTriggerDisabled>Open</button>
          <ng-template #content><div ngpPopover>Content</div></ng-template>
        `,
        { imports: [NgpPopoverTrigger, NgpPopover] },
      );

      const trigger = getByRole('button');
      fireEvent.click(trigger);

      await new Promise(resolve => setTimeout(resolve, 50));
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('should not open when show() is called on a disabled trigger', async () => {
      const { fixture, getByRole } = await render(
        `
          <button [ngpPopoverTrigger]="content" ngpPopoverTriggerDisabled>Open</button>
          <ng-template #content><div ngpPopover>Content</div></ng-template>
        `,
        { imports: [NgpPopoverTrigger, NgpPopover] },
      );

      const directive = fixture.debugElement
        .query(By.directive(NgpPopoverTrigger))
        .injector.get(NgpPopoverTrigger);
      await directive.show();

      expect(document.querySelector('[ngpPopover]')).not.toBeInTheDocument();
      expect(getByRole('button')).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('openChange output', () => {
    it('should emit openChange with the correct state on open and close', async () => {
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
        expect(component.onOpenChange).toHaveBeenCalledWith(true);
      });

      fireEvent.mouseUp(document.body);

      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')).not.toBeInTheDocument();
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
        expect(component.onOpenChange).toHaveBeenCalledWith(true);
      });

      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')).not.toBeInTheDocument();
        expect(component.onOpenChange).toHaveBeenLastCalledWith(false);
      });
    });

    it('should emit openChange false when destroyed while open', async () => {
      const { fixture, getByRole } = await render(OpenChangeTestComponent);
      const component = fixture.componentInstance;

      fireEvent.click(getByRole('button'));

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
  });

  describe('lifecycle', () => {
    it('should destroy the overlay when the trigger is destroyed', async () => {
      const { fixture, getByRole } = await render(OpenChangeTestComponent);

      fireEvent.click(getByRole('button'));

      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
      });

      fixture.destroy();

      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')).not.toBeInTheDocument();
      });
    });
  });

  describe('positioning', () => {
    it('should keep positioning CSS variables reactive when the popover repositions', async () => {
      @Component({
        template: `
          <button
            [ngpPopoverTrigger]="content"
            [ngpPopoverTriggerPlacement]="placement()"
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
        readonly placement = signal<NgpPopoverPlacement>('bottom');
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
      fixture.componentInstance.placement.set('top');
      await fixture.whenStable();

      await waitFor(() => {
        const popover = document.querySelector('[ngpPopover]') as HTMLElement;
        expect(popover.style.getPropertyValue('--ngp-popover-available-height')).not.toBe(
          initialHeight,
        );
      });
    });

    it('should position the popover relative to the anchor element when provided', async () => {
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
      fireEvent.click(getByRole('button'));

      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
      });

      // The popover should be positioned relative to the anchor (left 200px) rather than
      // the trigger (left 400px).
      const popover = document.querySelector('[ngpPopover]') as HTMLElement;
      expect(popover.getBoundingClientRect().left).toBeLessThan(300);
    });

    it('should fall back to the trigger element when the anchor is null', async () => {
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
      fireEvent.click(getByRole('button'));

      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
      });
    });
  });

  describe('control container isolation', () => {
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
        readonly form = new FormGroup({});
        value = '';
      }

      const { getByRole } = await render(FormLeakTestComponent);

      // This would throw NG01350 if ControlContainer leaked into the overlay
      fireEvent.click(getByRole('button'));

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
        readonly form = new FormGroup({});
        value = '';
      }

      const { getByRole } = await render(FormLeakInsideFormNgModelComponent);

      // NG01350 would be thrown if ControlContainer leaked from the parent form
      // into the overlay when the template is declared inside the form.
      fireEvent.click(getByRole('button'));

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
        readonly outerForm = new FormGroup({
          outerField: new FormControl('outer'),
        });
        readonly innerForm = new FormGroup({
          innerField: new FormControl('inner'),
        });
      }

      const { getByRole } = await render(FormLeakInsideFormControlNameComponent);

      // The inner formControlName should bind to innerForm, not the outer form
      fireEvent.click(getByRole('button'));

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
        readonly outerForm = new FormGroup({});
      }

      const { getByRole } = await render(FormControlNameLeakComponent);

      // The child component's formControlName should resolve against its own form,
      // not the outer form from the host component
      fireEvent.click(getByRole('button'));

      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
        expect(document.querySelector('input')).toBeInTheDocument();
      });
    });
  });

  describe('multiple popovers', () => {
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

    it('should close the previous popover when combining tooltip with popover on buttons (fixes #728)', async () => {
      @Component({
        template: `
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

      fireEvent.click(getByTestId('button-a'));
      await waitFor(() => {
        expect(document.querySelector('[data-testid="popover-a"]')).toBeInTheDocument();
      });

      fireEvent.click(getByTestId('button-b'));
      await waitFor(() => {
        expect(document.querySelector('[data-testid="popover-a"]')).not.toBeInTheDocument();
        expect(document.querySelector('[data-testid="popover-b"]')).toBeInTheDocument();
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

      fireEvent.click(buttonA);
      await waitFor(() => {
        expect(document.querySelectorAll('[ngpPopover]').length).toBe(1);
        expect(document.querySelector('[ngpPopover]')!.textContent).toContain('Popover A');
      });

      fireEvent.mouseEnter(buttonB);
      await waitFor(() => {
        expect(document.querySelector('[ngpTooltip]')).toBeInTheDocument();
      });

      fireEvent.mouseUp(buttonB);
      fireEvent.click(buttonB);
      await waitFor(() => {
        const popovers = document.querySelectorAll('[ngpPopover]');
        expect(popovers.length).toBe(1);
        expect(popovers[0].textContent).toContain('Popover B');
      });
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

      fireEvent.click(getByTestId('outer-trigger'));
      await waitFor(() => {
        expect(document.querySelector('[data-testid="outer-popover"]')).toBeInTheDocument();
      });

      // The inner popover shares the same overlay type ('popover'), but as a descendant
      // it must not evict its ancestor.
      const innerTrigger = document.querySelector('[data-testid="inner-trigger"]') as HTMLElement;
      fireEvent.click(innerTrigger);

      await waitFor(() => {
        expect(document.querySelector('[data-testid="inner-popover"]')).toBeInTheDocument();
      });

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
