import {
  Component,
  Directive,
  OnDestroy,
  OnInit,
  TemplateRef,
  signal,
  viewChild,
} from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { fireEvent, render, waitFor } from '@testing-library/angular';
import {
  injectPopoverTriggerState,
  NgpPopover,
  NgpPopoverTrigger,
  NgpPopoverTriggerState,
} from 'ng-primitives/popover';
import { injectOverlay, NgpOverlay, NgpPlacement, NgpTemplatePortal } from 'ng-primitives/portal';
import { NgpTooltip, NgpTooltipTrigger, provideTooltipConfig } from 'ng-primitives/tooltip';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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

@Component({
  selector: 'test-keep-mounted-content',
  template: `
    Content instance {{ id }}
    <input data-testid="keep-mounted-input" />
  `,
})
class KeepMountedContentComponent implements OnInit, OnDestroy {
  static instanceCount = 0;
  static readonly onInitSpy = vi.fn();
  static readonly onDestroySpy = vi.fn();

  readonly id = ++KeepMountedContentComponent.instanceCount;

  ngOnInit(): void {
    KeepMountedContentComponent.onInitSpy(this.id);
  }

  ngOnDestroy(): void {
    KeepMountedContentComponent.onDestroySpy(this.id);
  }
}

/** Hands the overlay instance to a test, which can only reach it from inside the content. */
@Directive({
  selector: '[testCaptureOverlay]',
})
class CaptureOverlayDirective {
  static overlay: NgpOverlay<unknown> | null = null;

  constructor() {
    CaptureOverlayDirective.overlay = injectOverlay();
  }
}

@Component({
  template: `
    <button [ngpPopoverTrigger]="content" [ngpPopoverTriggerKeepMounted]="keepMounted()">
      Open Popover
    </button>

    <ng-template #content>
      <div ngpPopover testCaptureOverlay>
        <test-keep-mounted-content />
      </div>
    </ng-template>
  `,
  imports: [NgpPopoverTrigger, NgpPopover, KeepMountedContentComponent, CaptureOverlayDirective],
})
class KeepMountedTestComponent {
  readonly keepMounted = signal(false);
}

@Component({
  template: `
    <button [ngpPopoverTrigger]="content()" [ngpPopoverTriggerKeepMounted]="true">
      Open Popover
    </button>

    <ng-template #first>
      <div ngpPopover data-which="first">
        <test-keep-mounted-content />
      </div>
    </ng-template>

    <ng-template #second>
      <div ngpPopover data-which="second">Second content</div>
    </ng-template>
  `,
  imports: [NgpPopoverTrigger, NgpPopover, KeepMountedContentComponent],
})
class KeepMountedSwapTestComponent {
  readonly first = viewChild.required<TemplateRef<unknown>>('first');
  readonly second = viewChild.required<TemplateRef<unknown>>('second');
  readonly content = signal<TemplateRef<unknown> | undefined>(undefined);
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

    it('should tear the overlay down, without emitting, when destroyed while open', async () => {
      const { fixture, getByRole } = await render(OpenChangeTestComponent);
      const component = fixture.componentInstance;

      fireEvent.click(getByRole('button'));

      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
        expect(component.onOpenChange).toHaveBeenCalledWith(true);
      });

      component.onOpenChange.mockClear();

      // Teardown runs from the state's onDestroy, by which point Angular has already
      // destroyed the `openChange` OutputRef - emitting there throws NG0953.
      fixture.destroy();

      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')).not.toBeInTheDocument();
      });
      expect(component.onOpenChange).not.toHaveBeenCalled();
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

  describe('keepMounted', () => {
    // Cleared at the start (not end) of each test: `@testing-library/angular`'s own
    // automatic fixture cleanup runs *after* this describe block's own afterEach in
    // vitest's hook ordering, so a leftover fixture teardown from the previous test
    // (destroying a still-open/kept-mounted component) can call these spies after an
    // afterEach-based clear already ran, leaking a stray call into the next test.
    beforeEach(() => {
      KeepMountedContentComponent.onInitSpy.mockClear();
      KeepMountedContentComponent.onDestroySpy.mockClear();
      KeepMountedContentComponent.instanceCount = 0;
      CaptureOverlayDirective.overlay = null;
    });

    /**
     * Hold `detach()` open the way a pending exit animation would, so a test can act while
     * a close is still in flight. `release()` lets the real detach proceed.
     */
    function gateDetach(): { release: () => void; restore: () => void } {
      const realDetach = NgpTemplatePortal.prototype.detach;
      let release!: () => void;
      const gate = new Promise<void>(resolve => (release = resolve));
      const spy = vi
        .spyOn(NgpTemplatePortal.prototype, 'detach')
        .mockImplementation(async function (this: NgpTemplatePortal<unknown>, options) {
          await gate;
          return realDetach.call(this, options);
        });

      return { release, restore: () => spy.mockRestore() };
    }

    it('should destroy and recreate the content on every close/reopen by default', async () => {
      const { getByRole } = await render(KeepMountedTestComponent);
      const trigger = getByRole('button');

      fireEvent.click(trigger);
      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
      });
      expect(KeepMountedContentComponent.onInitSpy).toHaveBeenCalledTimes(1);

      fireEvent.click(trigger); // close
      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')).not.toBeInTheDocument();
      });
      expect(KeepMountedContentComponent.onDestroySpy).toHaveBeenCalledTimes(1);

      fireEvent.click(trigger); // reopen
      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
      });
      expect(KeepMountedContentComponent.onInitSpy).toHaveBeenCalledTimes(2);
    });

    it('should preserve the content component instance across repeated close and reopen when true', async () => {
      const { fixture, getByRole } = await render(KeepMountedTestComponent);
      fixture.componentInstance.keepMounted.set(true);
      fixture.detectChanges();
      const trigger = getByRole('button');

      fireEvent.click(trigger);
      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
      });
      expect(KeepMountedContentComponent.onInitSpy).toHaveBeenCalledTimes(1);
      expect(KeepMountedContentComponent.onInitSpy).toHaveBeenCalledWith(1);

      // Three close/reopen cycles - the portal must be handed back for reuse on every
      // hide, not just the first.
      for (let cycle = 0; cycle < 3; cycle++) {
        fireEvent.click(trigger); // close
        await waitFor(() => {
          // Absent from the document entirely while hidden, not hidden in place via CSS.
          expect(document.querySelector('[ngpPopover]')).not.toBeInTheDocument();
        });

        // Not destroyed on hide - the instance is kept alive in memory.
        expect(KeepMountedContentComponent.onDestroySpy).not.toHaveBeenCalled();

        fireEvent.click(trigger); // reopen
        await waitFor(() => {
          expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
        });

        // Still only initialized once - the same instance was reused, not recreated.
        expect(KeepMountedContentComponent.onInitSpy).toHaveBeenCalledTimes(1);
      }
    });

    it('should preserve live DOM state in the content across close and reopen when true', async () => {
      // The popover content is portalled to the body, so it has to be queried from the
      // document rather than the fixture.
      const queryInput = () =>
        document.querySelector<HTMLInputElement>('[data-testid="keep-mounted-input"]');

      const { fixture, getByRole } = await render(KeepMountedTestComponent);
      fixture.componentInstance.keepMounted.set(true);
      fixture.detectChanges();
      const trigger = getByRole('button');

      fireEvent.click(trigger);
      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
      });

      const input = queryInput()!;
      fireEvent.input(input, { target: { value: 'typed while open' } });

      fireEvent.click(trigger); // close
      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')).not.toBeInTheDocument();
      });

      fireEvent.click(trigger); // reopen
      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
      });

      // The very same DOM node comes back, with whatever the user left in it.
      const reopened = queryInput();
      expect(reopened).toBe(input);
      expect(reopened?.value).toBe('typed while open');
    });

    it('should trap focus again when a kept-mounted popover is reopened', async () => {
      const { fixture, getByRole } = await render(KeepMountedTestComponent);
      fixture.componentInstance.keepMounted.set(true);
      fixture.detectChanges();
      const trigger = getByRole('button');

      fireEvent.click(trigger);
      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
      });

      fireEvent.click(trigger); // close
      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')).not.toBeInTheDocument();
      });

      fireEvent.click(trigger); // reopen - the reused view does not re-run ngOnInit
      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
      });

      const popover = document.querySelector('[ngpPopover]');

      // Focus is moved into the reopened popover...
      await waitFor(() => {
        expect(popover?.contains(document.activeElement)).toBe(true);
      });

      // ...and is still trapped there.
      const outside = document.createElement('button');
      document.body.appendChild(outside);

      try {
        outside.focus();
        await waitFor(() => {
          expect(popover?.contains(document.activeElement)).toBe(true);
        });
      } finally {
        outside.remove();
      }
    });

    it('should not re-insert kept-mounted content still marked as exiting', async () => {
      const { fixture, getByRole } = await render(KeepMountedTestComponent);
      fixture.componentInstance.keepMounted.set(true);
      fixture.detectChanges();
      const trigger = getByRole('button');

      fireEvent.click(trigger);
      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
      });

      fireEvent.click(trigger); // close - leaves the element marked data-exit
      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')).not.toBeInTheDocument();
      });

      // Capture the attributes at the moment the element is put back in the document. A
      // re-inserted element restarts its CSS animations, so arriving still marked
      // `data-exit` would replay the exit animation over the reopened popover.
      let attributesOnInsertion: string[] | null = null;
      const observer = new MutationObserver(records => {
        for (const record of records) {
          for (const node of Array.from(record.addedNodes)) {
            if (node instanceof HTMLElement && node.hasAttribute('ngpPopover')) {
              attributesOnInsertion ??= node.getAttributeNames();
            }
          }
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });

      try {
        fireEvent.click(trigger); // reopen
        await waitFor(() => {
          expect(attributesOnInsertion).not.toBeNull();
        });
      } finally {
        observer.disconnect();
      }

      expect(attributesOnInsertion).not.toContain('data-exit');
    });

    it('should discard the kept-mounted content when the content changes while hidden', async () => {
      const { fixture, getByRole } = await render(KeepMountedSwapTestComponent);
      const host = fixture.componentInstance;
      host.content.set(host.first());
      fixture.detectChanges();
      const trigger = getByRole('button');

      fireEvent.click(trigger);
      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
      });
      expect(KeepMountedContentComponent.onInitSpy).toHaveBeenCalledTimes(1);

      fireEvent.click(trigger); // close - the first template is kept mounted
      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')).not.toBeInTheDocument();
      });

      host.content.set(host.second());
      fixture.detectChanges();

      fireEvent.click(trigger);
      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
      });

      // The kept-mounted view can no longer be reused, so it is destroyed rather than
      // leaked, and only the new content is in the DOM.
      expect(document.querySelector('[ngpPopover]')?.getAttribute('data-which')).toBe('second');
      expect(document.querySelectorAll('[ngpPopover]')).toHaveLength(1);
      expect(KeepMountedContentComponent.onDestroySpy).toHaveBeenCalledTimes(1);
    });

    it('should destroy the kept-mounted view via the portal when the trigger is destroyed', async () => {
      // Spying on the portal is what makes this test meaningful: the content view lives in
      // the trigger's ViewContainerRef, so Angular would destroy it on teardown regardless.
      // Only the overlay's own force-destroy path routes through `destroyView()`.
      const destroyView = vi.spyOn(NgpTemplatePortal.prototype, 'destroyView');

      try {
        const { fixture, getByRole } = await render(KeepMountedTestComponent);
        fixture.componentInstance.keepMounted.set(true);
        fixture.detectChanges();
        const trigger = getByRole('button');

        fireEvent.click(trigger);
        await waitFor(() => {
          expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
        });

        fireEvent.click(trigger); // close (kept mounted, not destroyed)
        await waitFor(() => {
          expect(document.querySelector('[ngpPopover]')).not.toBeInTheDocument();
        });
        expect(KeepMountedContentComponent.onDestroySpy).not.toHaveBeenCalled();
        expect(destroyView).not.toHaveBeenCalled();

        fixture.destroy();

        await waitFor(() => {
          expect(KeepMountedContentComponent.onDestroySpy).toHaveBeenCalledTimes(1);
        });
        expect(destroyView).toHaveBeenCalledTimes(1);
      } finally {
        destroyView.mockRestore();
      }
    });

    it('should destroy the kept-mounted view when the trigger is destroyed mid-close', async () => {
      // Teardown happens while the detach is still in flight - the pending detach must not
      // hand its view back for reuse.
      const gate = gateDetach();
      const destroyView = vi.spyOn(NgpTemplatePortal.prototype, 'destroyView');

      try {
        const { fixture, getByRole } = await render(KeepMountedTestComponent);
        fixture.componentInstance.keepMounted.set(true);
        fixture.detectChanges();
        const trigger = getByRole('button');

        fireEvent.click(trigger);
        await waitFor(() => {
          expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
        });

        fireEvent.click(trigger); // close - blocks inside detach()
        fixture.destroy();

        // The close finishes on its own clock, and must release the view rather than keeping
        // it mounted for a reuse that can never happen.
        gate.release();
        await waitFor(() => {
          expect(destroyView).toHaveBeenCalledTimes(1);
        });
        expect(document.querySelector('[ngpPopover]')).not.toBeInTheDocument();
      } finally {
        gate.restore();
        destroyView.mockRestore();
      }
    });

    it('should not revive a kept-mounted overlay shown after it was destroyed mid-close', async () => {
      const gate = gateDetach();
      const destroyView = vi.spyOn(NgpTemplatePortal.prototype, 'destroyView');

      try {
        const { fixture, getByRole } = await render(KeepMountedTestComponent);
        fixture.componentInstance.keepMounted.set(true);
        fixture.detectChanges();
        const trigger = getByRole('button');

        fireEvent.click(trigger);
        await waitFor(() => {
          expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
        });
        const overlay = CaptureOverlayDirective.overlay;
        expect(overlay).toBeTruthy();

        fireEvent.click(trigger); // close - blocks inside detach()
        fixture.destroy();

        // A show() landing between the teardown and the detach settling must not resurrect
        // the overlay, which would leave its view mounted with no trigger left to own it.
        const shown = overlay?.show();

        gate.release();
        await shown;
        await waitFor(() => {
          expect(destroyView).toHaveBeenCalledTimes(1);
        });
        expect(overlay?.isOpen()).toBe(false);
        expect(document.querySelector('[ngpPopover]')).not.toBeInTheDocument();
      } finally {
        gate.restore();
        destroyView.mockRestore();
      }
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
        readonly placement = signal<NgpPlacement>('bottom');
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

  describe('injected state setters', () => {
    // Every input on NgpPopoverTrigger has a matching setter on the state, so a
    // wrapper component can configure the trigger it hosts.
    @Directive({ selector: '[popoverState]' })
    class PopoverStateDirective {
      readonly trigger = injectPopoverTriggerState();
    }

    // The panel needs an explicit size and position for the positioning assertions
    // below - Floating UI writes `top`/`left`, which a static element ignores.
    const template = `
      <button [ngpPopoverTrigger]="content" popoverState>Open Popover</button>

      <ng-template #content>
        <div ngpPopover style="position: fixed; width: 120px; height: 60px;">Popover content</div>
      </ng-template>
    `;

    async function renderWithState() {
      const result = await render(template, {
        imports: [NgpPopoverTrigger, NgpPopover, PopoverStateDirective],
      });

      const state = result.fixture.debugElement
        .query(By.directive(PopoverStateDirective))
        .injector.get(PopoverStateDirective).trigger;

      return { ...result, state, trigger: result.getByRole('button') };
    }

    type PopoverState = NgpPopoverTriggerState<unknown>;

    const anchorElement = document.createElement('div');
    const guard = () => false;

    const cases: Array<{
      setter: string;
      set: (state: PopoverState) => void;
      read: (state: PopoverState) => unknown;
      expected: unknown;
    }> = [
      {
        setter: 'setPopover',
        set: state => state.setPopover(undefined),
        read: state => state.popover(),
        expected: undefined,
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
        setter: 'setCloseOnOutsideClick',
        set: state => state.setCloseOnOutsideClick(guard),
        read: state => state.closeOnOutsideClick(),
        expected: guard,
      },
      {
        setter: 'setCloseOnEscape',
        set: state => state.setCloseOnEscape(guard),
        read: state => state.closeOnEscape(),
        expected: guard,
      },
      {
        setter: 'setScrollBehavior',
        set: state => state.setScrollBehavior('close'),
        read: state => state.scrollBehavior(),
        expected: 'close',
      },
      {
        setter: 'setContext',
        set: state => state.setContext('ctx'),
        read: state => state.context(),
        expected: 'ctx',
      },
      {
        setter: 'setAnchor',
        set: state => state.setAnchor(anchorElement),
        read: state => state.anchor(),
        expected: anchorElement,
      },
      {
        setter: 'setTrackPosition',
        set: state => state.setTrackPosition(true),
        read: state => state.trackPosition(),
        expected: true,
      },
      {
        setter: 'setCooldown',
        set: state => state.setCooldown(250),
        read: state => state.cooldown(),
        expected: 250,
      },
    ];

    it.each(cases)('should update the state through $setter', async ({ set, read, expected }) => {
      const { state } = await renderWithState();

      set(state());

      expect(read(state())).toBe(expected);
    });

    it('should warn but still apply when a state signal is written directly', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const { state } = await renderWithState();

      state().offset.set(16);

      expect(state().offset()).toBe(16);
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('setOffset'));
      warn.mockRestore();
    });

    it('should render the content passed to setPopover', async () => {
      @Component({
        template: `
          <div ngpPopover>Replacement popover</div>
        `,
        imports: [NgpPopover],
      })
      class ReplacementPopover {}

      const { fixture, state, trigger } = await renderWithState();

      state().setPopover(ReplacementPopover);
      fixture.detectChanges();

      fireEvent.click(trigger);

      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')?.textContent?.trim()).toBe(
          'Replacement popover',
        );
      });
    });

    it('should reflect setPlacement on the trigger and the open popover', async () => {
      const { fixture, state, trigger } = await renderWithState();

      state().setPlacement('right');
      fixture.detectChanges();

      expect(trigger).toHaveAttribute('data-placement', 'right');

      fireEvent.click(trigger);

      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')).toHaveAttribute('data-placement', 'right');
      });
    });

    it('should not open once disabled through setDisabled', async () => {
      const { fixture, state, trigger } = await renderWithState();

      state().setDisabled(true);
      fixture.detectChanges();

      expect(trigger).toHaveAttribute('data-disabled', '');

      fireEvent.click(trigger);

      // Give the overlay a chance to appear so the assertion is not trivially true.
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(document.querySelector('[ngpPopover]')).not.toBeInTheDocument();
    });

    it('should delay opening by the value passed to setShowDelay', async () => {
      const { state, trigger } = await renderWithState();

      state().setShowDelay(150);
      fireEvent.click(trigger);

      expect(document.querySelector('[ngpPopover]')).not.toBeInTheDocument();

      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
      });
    });

    it('should delay closing by the value passed to setHideDelay', async () => {
      const { state, trigger } = await renderWithState();

      state().setHideDelay(150);
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
      });

      fireEvent.click(trigger);

      expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();

      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')).not.toBeInTheDocument();
      });
    });

    it('should offset the popover by the value passed to setOffset', async () => {
      const { state, trigger } = await renderWithState();

      state().setPlacement('bottom');
      state().setOffset(60);
      state().setFlip(false);
      state().setShift(false);
      fireEvent.click(trigger);

      // Floating UI positions asynchronously, so poll rather than measuring once.
      await waitFor(() => {
        const gap =
          document.querySelector('[ngpPopover]')!.getBoundingClientRect().top -
          trigger.getBoundingClientRect().bottom;

        expect(gap).toBeCloseTo(60, 0);
      });
    });

    it('should keep the popover open when setCloseOnOutsideClick refuses', async () => {
      const { state, trigger } = await renderWithState();

      state().setCloseOnOutsideClick(false);
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
      });

      fireEvent.mouseUp(document.body);

      // Dismissal is async, so settle before asserting the guard held.
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
    });

    it('should keep the popover open when setCloseOnEscape refuses', async () => {
      const { state, trigger } = await renderWithState();

      state().setCloseOnEscape(false);
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
      });

      fireEvent.keyDown(document.querySelector('[ngpPopover]')!, { key: 'Escape' });

      // Dismissal is async, so settle before asserting the guard held.
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
    });

    it('should position the popover against the element passed to setAnchor', async () => {
      const { state, trigger } = await renderWithState();

      const anchor = document.createElement('div');
      anchor.style.cssText = 'position:fixed;top:400px;left:40px;width:80px;height:20px;';
      document.body.appendChild(anchor);

      state().setAnchor(anchor);
      state().setPlacement('bottom');
      state().setOffset(0);
      state().setFlip(false);
      state().setShift(false);

      fireEvent.click(trigger);

      await waitFor(() => {
        const popoverTop = document.querySelector('[ngpPopover]')!.getBoundingClientRect().top;

        expect(popoverTop).toBeCloseTo(anchor.getBoundingClientRect().bottom, 0);
      });

      anchor.remove();
    });

    it('should attach the popover to the element passed to setContainer', async () => {
      const host = document.createElement('div');
      host.id = 'setter-popover-host';
      document.body.appendChild(host);

      const { state, trigger } = await renderWithState();

      state().setContainer(host);
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(host.querySelector('[ngpPopover]')).toBeInTheDocument();
      });

      host.remove();
    });
  });

  describe('dynamic content', () => {
    const template = `
      <button [ngpPopoverTrigger]="useFirst ? first : second">Open Popover</button>

      <ng-template #first>
        <div ngpPopover>First popover</div>
      </ng-template>
      <ng-template #second>
        <div ngpPopover>Second popover</div>
      </ng-template>
    `;

    it('should render the new template when the reference changes while closed', async () => {
      const { fixture, getByRole } = await render(template, {
        imports: [NgpPopoverTrigger, NgpPopover],
        componentProperties: { useFirst: true },
      });

      const trigger = getByRole('button');
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')?.textContent?.trim()).toBe('First popover');
      });

      fireEvent.click(trigger);
      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')).not.toBeInTheDocument();
      });

      fixture.componentInstance.useFirst = false;
      fixture.detectChanges();

      fireEvent.click(trigger);

      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')?.textContent?.trim()).toBe('Second popover');
      });
    });

    it('should close and report closed when the reference is cleared', async () => {
      const openChange = vi.fn();
      const { fixture, getByRole } = await render(
        `
          <button
            [ngpPopoverTrigger]="show ? first : null"
            (ngpPopoverTriggerOpenChange)="openChange($event)"
          >
            Open Popover
          </button>

          <ng-template #first>
            <div ngpPopover>First popover</div>
          </ng-template>
        `,
        {
          imports: [NgpPopoverTrigger, NgpPopover],
          componentProperties: { show: true, openChange },
        },
      );

      fireEvent.click(getByRole('button'));

      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
      });
      openChange.mockClear();

      fixture.componentInstance.show = false;
      fixture.detectChanges();

      // Nothing left to render, so the popover closes - and consumers binding
      // [(ngpPopoverTriggerOpen)] have to see that, not silently drift open.
      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')).not.toBeInTheDocument();
        expect(openChange).toHaveBeenCalledWith(false);
      });
    });

    it('should still dismiss on outside click after the content is swapped', async () => {
      const { fixture, getByRole } = await render(template, {
        imports: [NgpPopoverTrigger, NgpPopover],
        componentProperties: { useFirst: true },
      });

      fireEvent.click(getByRole('button'));

      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')).toBeInTheDocument();
      });

      fixture.componentInstance.useFirst = false;
      fixture.detectChanges();

      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')?.textContent?.trim()).toBe('Second popover');
      });

      // The swap reuses the overlay instance, so its registry entry has to keep
      // resolving the elements that are actually on screen.
      fireEvent.mouseUp(document.body);

      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')).not.toBeInTheDocument();
      });
    });

    it('should swap the visible popover when the reference changes while open', async () => {
      const { fixture, getByRole } = await render(template, {
        imports: [NgpPopoverTrigger, NgpPopover],
        componentProperties: { useFirst: true },
      });

      fireEvent.click(getByRole('button'));

      await waitFor(() => {
        expect(document.querySelector('[ngpPopover]')?.textContent?.trim()).toBe('First popover');
      });

      fixture.componentInstance.useFirst = false;
      fixture.detectChanges();

      await waitFor(() => {
        const popovers = document.querySelectorAll('[ngpPopover]');
        expect(popovers).toHaveLength(1);
        expect(popovers[0].textContent?.trim()).toBe('Second popover');
      });
    });
  });
});
