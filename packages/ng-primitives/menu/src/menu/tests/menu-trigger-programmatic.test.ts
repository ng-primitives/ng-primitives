import { Component, Directive, effect, inject, input, viewChild } from '@angular/core';
import { fireEvent, render, waitFor } from '@testing-library/angular';
import { NgpMenu, NgpMenuItem, NgpMenuTrigger, injectMenuTriggerState } from 'ng-primitives/menu';
import { NgpOverlay, NgpOverlayContent } from 'ng-primitives/portal';
import { describe, expect, it } from 'vitest';

interface MenuContext {
  label: string;
}

/** Opens its menu from code only, with the built-in click toggle switched off. */
@Directive({
  selector: '[programmaticMenu]',
  hostDirectives: [{ directive: NgpMenuTrigger, inputs: ['ngpMenuTrigger:programmaticMenu'] }],
  host: { '(click)': 'onClick()' },
})
class ProgrammaticMenuDirective {
  readonly state = injectMenuTriggerState<MenuContext>();
  readonly label = input('first');

  constructor() {
    this.state().setDisabled(true);
    this.state().setPlacement('top-start');
    effect(() => this.state().setContext({ label: this.label() }));
  }

  onClick(): void {
    if (this.state().open()) {
      this.state().hide();
      return;
    }
    this.state().show();
  }
}

/** Menu content that reads its trigger's context and closes itself. */
@Component({
  selector: 'context-reader',
  template: `
    <span data-testid="injected-label">{{ trigger().context()?.label }}</span>
    <button (click)="trigger().hide()" data-testid="close-from-content">Close</button>
  `,
})
class ContextReaderComponent {
  readonly trigger = injectMenuTriggerState<MenuContext | undefined>();
}

@Component({
  template: `
    <button
      [programmaticMenu]="menu"
      [label]="label"
      style="margin-top: 300px"
      data-testid="trigger"
    >
      Open
    </button>

    <ng-template #menu let-ctx>
      <div ngpMenu data-testid="menu">
        <span data-testid="template-label">{{ ctx()?.label }}</span>
        <context-reader />
        <button ngpMenuItem>Item</button>
      </div>
    </ng-template>
  `,
  imports: [ProgrammaticMenuDirective, NgpMenu, NgpMenuItem, ContextReaderComponent],
})
class ProgrammaticMenuComponent {
  label = 'first';
}

@Component({
  template: `
    <button [ngpMenuTrigger]="menu" [ngpMenuTriggerOpenTriggers]="[]" data-testid="trigger">
      Open
    </button>
    <button (click)="open()" data-testid="external-opener">External</button>

    <ng-template #menu>
      <div ngpMenu data-testid="menu">
        <button ngpMenuItem>Item</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem],
})
class NoOpenTriggersComponent {
  readonly trigger = viewChild.required(NgpMenuTrigger);

  open(): void {
    this.trigger().show();
  }
}

/** Supplies the menu content from code instead of through the trigger input. */
@Directive({ selector: '[lateMenu]' })
class LateMenuDirective {
  readonly lateMenu = input.required<NgpOverlayContent<unknown>>();
  private readonly state = injectMenuTriggerState();

  constructor() {
    effect(() => this.state().setMenu(this.lateMenu()));
  }
}

@Component({
  template: `
    <button [lateMenu]="menu" ngpMenuTrigger data-testid="trigger">Open</button>

    <ng-template #menu>
      <div ngpMenu data-testid="menu">
        <button ngpMenuItem>Item</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem, LateMenuDirective],
})
class SetMenuComponent {}

/** Reports the placement the overlay actually rendered with, read from inside the menu. */
@Directive({ selector: '[placementProbe]' })
class PlacementProbeDirective {
  private readonly overlay = inject(NgpOverlay);

  constructor() {
    effect(() => {
      lastResolvedPlacement = this.overlay.finalPlacement();
    });
  }
}

let lastResolvedPlacement: string | undefined;

@Component({
  template: `
    <div style="height: 100vh; display: flex; align-items: flex-end">
      <button [ngpMenuTrigger]="menu" ngpMenuTriggerPlacement="bottom-start" data-testid="trigger">
        Open
      </button>
    </div>

    <ng-template #menu>
      <div ngpMenu placementProbe data-testid="menu" style="height: 200px">
        <button ngpMenuItem>Item</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem, PlacementProbeDirective],
})
class ResolvedPlacementComponent {}

const queryMenu = () => document.querySelector<HTMLElement>('[data-testid="menu"]');

describe('NgpMenuTrigger programmatic control', () => {
  it('opens and closes through show() and hide() while the trigger is disabled', async () => {
    const { getByTestId } = await render(ProgrammaticMenuComponent);
    const trigger = getByTestId('trigger');

    fireEvent.click(trigger);
    await waitFor(() => expect(queryMenu()).toBeInTheDocument());
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(trigger);
    await waitFor(() => expect(queryMenu()).not.toBeInTheDocument());
  });

  it('applies a placement set through setPlacement() to the trigger and the menu', async () => {
    const { getByTestId } = await render(ProgrammaticMenuComponent);
    const trigger = getByTestId('trigger');
    expect(trigger).toHaveAttribute('data-placement', 'top-start');

    fireEvent.click(trigger);
    await waitFor(() => expect(queryMenu()).toHaveAttribute('data-placement', 'top-start'));
  });

  it('passes the context to the template variable and to content injecting the trigger state', async () => {
    const { getByTestId } = await render(ProgrammaticMenuComponent);

    fireEvent.click(getByTestId('trigger'));

    await waitFor(() => {
      expect(document.querySelector('[data-testid="template-label"]')).toHaveTextContent('first');
      expect(document.querySelector('[data-testid="injected-label"]')).toHaveTextContent('first');
    });
  });

  it('reflects context updated while the menu is open', async () => {
    const { getByTestId, fixture } = await render(ProgrammaticMenuComponent);
    fireEvent.click(getByTestId('trigger'));
    await waitFor(() => expect(queryMenu()).toBeInTheDocument());

    fixture.componentInstance.label = 'second';
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    await waitFor(() => {
      expect(document.querySelector('[data-testid="template-label"]')).toHaveTextContent('second');
      expect(document.querySelector('[data-testid="injected-label"]')).toHaveTextContent('second');
    });
  });

  it('closes when content calls hide() on the injected trigger state', async () => {
    const { getByTestId } = await render(ProgrammaticMenuComponent);
    fireEvent.click(getByTestId('trigger'));
    await waitFor(() => expect(queryMenu()).toBeInTheDocument());

    fireEvent.click(document.querySelector('[data-testid="close-from-content"]')!);

    await waitFor(() => expect(queryMenu()).not.toBeInTheDocument());
  });

  it('ignores clicks when no open triggers are enabled but still opens through show()', async () => {
    const { getByTestId } = await render(NoOpenTriggersComponent);

    fireEvent.click(getByTestId('trigger'));
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(queryMenu()).not.toBeInTheDocument();

    fireEvent.click(getByTestId('external-opener'));
    await waitFor(() => expect(queryMenu()).toBeInTheDocument());
    expect(getByTestId('trigger')).toHaveAttribute('data-open');
  });

  it('opens content supplied through setMenu()', async () => {
    const { getByTestId } = await render(SetMenuComponent);

    fireEvent.click(getByTestId('trigger'));

    await waitFor(() => expect(queryMenu()).toBeInTheDocument());
  });

  it('exposes the flipped placement to content that injects the overlay', async () => {
    lastResolvedPlacement = undefined;
    const { getByTestId } = await render(ResolvedPlacementComponent);

    fireEvent.click(getByTestId('trigger'));

    await waitFor(() => {
      expect(queryMenu()).toHaveAttribute('data-placement', 'top-start');
      expect(lastResolvedPlacement).toBe('top-start');
    });
  });
});
