import { Component, Directive, OnInit, signal, viewChild } from '@angular/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { injectMenuTriggerState, NgpMenu, NgpMenuItem, NgpMenuTrigger } from 'ng-primitives/menu';
import { afterEach, describe, expect, it, vi } from 'vitest';

@Component({
  template: `
    <button
      [(ngpMenuTriggerOpen)]="open"
      [ngpMenuTrigger]="menu"
      (ngpMenuTriggerOpenChange)="changes.push($event)"
    >
      Trigger
    </button>
    <button data-testid="outside">Outside</button>

    <ng-template #menu>
      <div ngpMenu>
        <button ngpMenuItem>Rename</button>
        <button ngpMenuItem>Delete</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem],
})
class TwoWayComponent {
  readonly open = signal(false);
  readonly changes: boolean[] = [];
}

@Component({
  template: `
    <button
      #trigger="ngpMenuTrigger"
      [ngpMenuTrigger]="menu"
      [ngpMenuTriggerOpen]="open()"
      [ngpMenuTriggerDisabled]="disabled()"
      (ngpMenuTriggerOpenChange)="changes.push($event)"
    >
      Trigger
    </button>

    <ng-template #menu>
      <div ngpMenu>
        <button ngpMenuItem>Rename</button>
        <button ngpMenuItem>Delete</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem],
})
class OneWayComponent {
  readonly open = signal<boolean | undefined>(false);
  readonly disabled = signal(false);
  readonly changes: boolean[] = [];
  readonly trigger = viewChild.required<NgpMenuTrigger>('trigger');
}

@Component({
  template: `
    <button
      [ngpMenuTrigger]="hasContent() ? menu : undefined"
      [ngpMenuTriggerOpen]="true"
      (ngpMenuTriggerOpenChange)="changes.push($event)"
    >
      Trigger
    </button>

    <ng-template #menu>
      <div ngpMenu>
        <button ngpMenuItem>Rename</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem],
})
class LateContentComponent {
  readonly hasContent = signal(false);
  readonly changes: boolean[] = [];
}

@Component({
  template: `
    <button
      [ngpMenuTrigger]="menu"
      [ngpMenuTriggerOpen]="false"
      (ngpMenuTriggerOpenChange)="changes.push($event)"
      ngpMenuTriggerShowDelay="100"
    >
      Trigger
    </button>

    <ng-template #menu>
      <div ngpMenu>
        <button ngpMenuItem>Rename</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem],
})
class ShowDelayComponent {
  readonly changes: boolean[] = [];
}

@Component({
  template: `
    <button
      [ngpMenuTrigger]="menu"
      (ngpMenuTriggerOpenChange)="changes.push($event)"
      ngpMenuTriggerDefaultOpen
    >
      Trigger
    </button>

    <ng-template #menu>
      <div ngpMenu>
        <button ngpMenuItem>Rename</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem],
})
class DefaultOpenComponent {
  readonly changes: boolean[] = [];
}

@Component({
  template: `
    <button [ngpMenuTrigger]="menu" (ngpMenuTriggerOpenChange)="changes.push($event)">
      Trigger
    </button>

    <ng-template #menu>
      <div ngpMenu>
        <button ngpMenuItem>Rename</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem],
})
class UnboundComponent {
  readonly changes: boolean[] = [];
}

/** Sets `defaultOpen` through the state, as a reusable component wrapping the trigger would. */
@Directive({ selector: '[setDefaultOpen]' })
class SetDefaultOpen implements OnInit {
  private readonly state = injectMenuTriggerState();

  ngOnInit(): void {
    this.state().setDefaultOpen(true);
  }
}

@Component({
  template: `
    <button [ngpMenuTrigger]="menu" setDefaultOpen>Trigger</button>

    <ng-template #menu>
      <div ngpMenu>
        <button ngpMenuItem>Rename</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem, SetDefaultOpen],
})
class SetDefaultOpenComponent {}

const menu = () => document.querySelector('[ngpMenu]');
const settle = () => new Promise(resolve => setTimeout(resolve, 50));

describe('NgpMenuTrigger open binding', () => {
  afterEach(() => {
    document.querySelectorAll('[ngpMenu]').forEach(el => el.remove());
  });

  describe('unbound', () => {
    it('emits openChange when the user opens and closes the menu', async () => {
      const { fixture, getByRole } = await render(UnboundComponent);

      fireEvent.click(getByRole('button', { name: 'Trigger' }));
      await waitFor(() => expect(menu()).toBeInTheDocument());

      fireEvent.keyDown(menu()!, { key: 'Escape' });
      await waitFor(() => expect(menu()).not.toBeInTheDocument());

      expect(fixture.componentInstance.changes).toEqual([true, false]);
    });
  });

  describe('two-way', () => {
    it('opens and closes as the bound value changes, without emitting', async () => {
      const { fixture } = await render(TwoWayComponent);
      const host = fixture.componentInstance;

      host.open.set(true);
      fixture.detectChanges();
      await waitFor(() => expect(menu()).toBeInTheDocument());

      host.open.set(false);
      fixture.detectChanges();
      await waitFor(() => expect(menu()).not.toBeInTheDocument());

      expect(host.changes).toEqual([]);
    });

    it('updates the bound value when the user opens and closes it', async () => {
      const { fixture, getByRole } = await render(TwoWayComponent);
      const host = fixture.componentInstance;

      fireEvent.click(getByRole('button', { name: 'Trigger' }));
      await waitFor(() => expect(menu()).toBeInTheDocument());
      expect(host.open()).toBe(true);

      fireEvent.keyDown(menu()!, { key: 'Escape' });
      await waitFor(() => expect(menu()).not.toBeInTheDocument());
      expect(host.open()).toBe(false);

      expect(host.changes).toEqual([true, false]);
    });

    it('updates the bound value when an item is selected', async () => {
      const { fixture, getByRole } = await render(TwoWayComponent);
      const host = fixture.componentInstance;

      fireEvent.click(getByRole('button', { name: 'Trigger' }));
      await waitFor(() => expect(menu()).toBeInTheDocument());

      fireEvent.click(screen.getByRole('menuitem', { name: 'Rename' }));
      await waitFor(() => expect(menu()).not.toBeInTheDocument());

      expect(host.open()).toBe(false);
      expect(host.changes).toEqual([true, false]);
    });
  });

  describe('one-way', () => {
    it('reports a trigger press but stays closed until the binding opens it', async () => {
      const { fixture, getByRole } = await render(OneWayComponent);
      const host = fixture.componentInstance;

      fireEvent.click(getByRole('button', { name: 'Trigger' }));
      await settle();

      expect(host.changes).toEqual([true]);
      expect(menu()).not.toBeInTheDocument();
    });

    it('reports Escape, outside press, item selection and trigger press but stays open', async () => {
      const { fixture, getByRole } = await render(OneWayComponent);
      const host = fixture.componentInstance;
      host.open.set(true);
      fixture.detectChanges();
      await waitFor(() => expect(menu()).toBeInTheDocument());

      fireEvent.keyDown(menu()!, { key: 'Escape' });
      await settle();
      expect(host.changes).toEqual([false]);
      fireEvent.mouseUp(document.body);
      await settle();
      expect(host.changes).toEqual([false, false]);
      fireEvent.click(screen.getByRole('menuitem', { name: 'Rename' }));
      await settle();
      expect(host.changes).toEqual([false, false, false]);
      fireEvent.click(getByRole('button', { name: 'Trigger' }));
      await settle();

      expect(host.changes).toEqual([false, false, false, false]);
      expect(menu()).toBeInTheDocument();
    });

    it('opens on first render when bound to true', async () => {
      const { fixture } = await render(OneWayComponent, {
        componentProperties: { open: signal(true) },
      });

      await waitFor(() => expect(menu()).toBeInTheDocument());
      expect(fixture.componentInstance.changes).toEqual([]);
    });

    it('returns focus to the trigger when the binding closes it after Escape', async () => {
      const { fixture, getByRole } = await render(OneWayComponent);
      const host = fixture.componentInstance;
      host.open.set(true);
      fixture.detectChanges();
      await waitFor(() => expect(menu()).toBeInTheDocument());

      fireEvent.keyDown(menu()!, { key: 'Escape' });
      host.open.set(false);
      fixture.detectChanges();

      await waitFor(() => expect(menu()).not.toBeInTheDocument());
      expect(document.activeElement).toBe(getByRole('button', { name: 'Trigger' }));
    });

    it('keeps the focus trap after a declined Escape', async () => {
      const { fixture } = await render(OneWayComponent);
      const host = fixture.componentInstance;
      host.open.set(true);
      fixture.detectChanges();
      await waitFor(() => expect(menu()).toBeInTheDocument());
      await waitFor(() => expect(menu()!.contains(document.activeElement)).toBe(true));

      fireEvent.keyDown(menu()!, { key: 'Escape' });
      await settle();
      await userEvent.tab();

      expect(menu()!.contains(document.activeElement)).toBe(true);
    });

    it('reports a close it cannot decline, such as the trigger being hidden', async () => {
      const { fixture, getByRole } = await render(OneWayComponent, {
        componentProperties: { open: signal(true) },
      });
      await waitFor(() => expect(menu()).toBeInTheDocument());

      getByRole('button', { name: 'Trigger' }).style.display = 'none';

      await waitFor(() => expect(menu()).not.toBeInTheDocument());
      expect(fixture.componentInstance.changes).toEqual([false]);
    });

    it('reports a trigger press once the show delay has passed', async () => {
      const { fixture, getByRole } = await render(ShowDelayComponent);

      fireEvent.click(getByRole('button', { name: 'Trigger' }));
      expect(fixture.componentInstance.changes).toEqual([]);

      await waitFor(() => expect(fixture.componentInstance.changes).toEqual([true]));
      expect(menu()).not.toBeInTheDocument();
    });

    it('opens once content arrives for a binding that is already true', async () => {
      const error = vi.spyOn(console, 'error');
      const { fixture } = await render(LateContentComponent);
      await settle();
      expect(menu()).not.toBeInTheDocument();
      expect(error).not.toHaveBeenCalled();
      error.mockRestore();

      fixture.componentInstance.hasContent.set(true);
      fixture.detectChanges();

      await waitFor(() => expect(menu()).toBeInTheDocument());
      expect(fixture.componentInstance.changes).toEqual([]);
    });

    it('reports a show() call instead of opening', async () => {
      const { fixture } = await render(OneWayComponent);
      const host = fixture.componentInstance;

      host.trigger().show();
      await settle();

      expect(host.changes).toEqual([true]);
      expect(menu()).not.toBeInTheDocument();
    });

    it('follows the binding while the trigger is disabled', async () => {
      const { fixture } = await render(OneWayComponent);
      const host = fixture.componentInstance;
      host.disabled.set(true);
      host.open.set(true);
      fixture.detectChanges();

      await waitFor(() => expect(menu()).toBeInTheDocument());
    });

    it('goes back to managing itself when the binding is cleared', async () => {
      const { fixture, getByRole } = await render(OneWayComponent);
      const host = fixture.componentInstance;
      host.open.set(undefined);
      fixture.detectChanges();

      fireEvent.click(getByRole('button', { name: 'Trigger' }));

      await waitFor(() => expect(menu()).toBeInTheDocument());
      expect(host.changes).toEqual([true]);
    });

    it('does not emit when the trigger is destroyed while open', async () => {
      const { fixture } = await render(OneWayComponent, {
        componentProperties: { open: signal(true) },
      });
      await waitFor(() => expect(menu()).toBeInTheDocument());

      const warn = vi.spyOn(console, 'warn');

      expect(() => fixture.destroy()).not.toThrow();
      expect(fixture.componentInstance.changes).toEqual([]);
      // NG0953: an output emitting after its directive is destroyed
      expect(warn).not.toHaveBeenCalledWith(expect.stringContaining('NG0953'));
      warn.mockRestore();
    });
  });

  describe('defaultOpen', () => {
    it('opens on first render without emitting', async () => {
      const { fixture } = await render(DefaultOpenComponent);

      await waitFor(() => expect(menu()).toBeInTheDocument());
      expect(fixture.componentInstance.changes).toEqual([]);
    });

    it('can be set through the state before the first render', async () => {
      await render(SetDefaultOpenComponent);

      await waitFor(() => expect(menu()).toBeInTheDocument());
    });

    it('then behaves as an unbound menu', async () => {
      const { fixture } = await render(DefaultOpenComponent);
      await waitFor(() => expect(menu()).toBeInTheDocument());

      fireEvent.keyDown(menu()!, { key: 'Escape' });

      await waitFor(() => expect(menu()).not.toBeInTheDocument());
      expect(fixture.componentInstance.changes).toEqual([false]);
    });
  });
});
