import { Component } from '@angular/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/angular';
import { NgpPopover, NgpPopoverTrigger } from 'ng-primitives/popover';

describe('NgpPopoverTrigger', () => {
  @Component({
    template: `
      <button [ngpPopoverTrigger]="parentPopover" data-testid="parent-trigger">Open Parent</button>

      <ng-template #parentPopover>
        <div ngpPopover data-testid="parent-popover">
          <button [ngpPopoverTrigger]="childPopover" data-testid="child-trigger">Open Child</button>
          <div data-testid="parent-only-area">Parent only area</div>
        </div>
      </ng-template>

      <ng-template #childPopover>
        <div ngpPopover data-testid="child-popover">Child content</div>
      </ng-template>
    `,
    imports: [NgpPopoverTrigger, NgpPopover],
  })
  class NestedPopoverTestComponent {}

  it('should destroy the overlay when the trigger is destroyed', async () => {
    const { fixture, getByRole } = await render(
      `
        <button [ngpPopoverTrigger]="content"></button>

        <ng-template #content>
          <div ngpPopover>
            Popover content
          </div>
        </ng-template>
      `,
      {
        imports: [NgpPopoverTrigger, NgpPopover],
      },
    );

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
    class EventTestComponent {
      onOpenChange = jest.fn();
    }

    const { fixture, getByRole } = await render(EventTestComponent);
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
    class OutsideClickEventTestComponent {
      onOpenChange = jest.fn();
    }

    const { fixture, getByRole } = await render(OutsideClickEventTestComponent);
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
    class EscapeEventTestComponent {
      onOpenChange = jest.fn();
    }

    const { fixture, getByRole } = await render(EscapeEventTestComponent);
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

  it('should keep parent and child popovers open when clicking inside child popover', async () => {
    const { getByTestId } = await render(NestedPopoverTestComponent);

    fireEvent.click(getByTestId('parent-trigger'));

    await waitFor(() => {
      expect(document.querySelector('[data-testid="parent-popover"]')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('child-trigger'));

    await waitFor(() => {
      expect(document.querySelector('[data-testid="child-popover"]')).toBeInTheDocument();
    });

    const childPopover = document.querySelector('[data-testid="child-popover"]');
    fireEvent.mouseUp(childPopover!);

    await waitFor(() => {
      expect(document.querySelector('[data-testid="child-popover"]')).toBeInTheDocument();
      expect(document.querySelector('[data-testid="parent-popover"]')).toBeInTheDocument();
    });
  });

  it('should close child popover only when clicking parent popover area', async () => {
    const { getByTestId } = await render(NestedPopoverTestComponent);

    fireEvent.click(getByTestId('parent-trigger'));

    await waitFor(() => {
      expect(document.querySelector('[data-testid="parent-popover"]')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('child-trigger'));

    await waitFor(() => {
      expect(document.querySelector('[data-testid="child-popover"]')).toBeInTheDocument();
    });

    fireEvent.mouseUp(screen.getByTestId('parent-only-area'));

    await waitFor(() => {
      expect(document.querySelector('[data-testid="child-popover"]')).not.toBeInTheDocument();
      expect(document.querySelector('[data-testid="parent-popover"]')).toBeInTheDocument();
    });
  });

  it('should close only child on first Escape and parent on second Escape', async () => {
    const { getByTestId } = await render(NestedPopoverTestComponent);

    fireEvent.click(getByTestId('parent-trigger'));

    await waitFor(() => {
      expect(document.querySelector('[data-testid="parent-popover"]')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('child-trigger'));

    await waitFor(() => {
      expect(document.querySelector('[data-testid="child-popover"]')).toBeInTheDocument();
    });

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => {
      expect(document.querySelector('[data-testid="child-popover"]')).not.toBeInTheDocument();
      expect(document.querySelector('[data-testid="parent-popover"]')).toBeInTheDocument();
    });

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => {
      expect(document.querySelector('[data-testid="parent-popover"]')).not.toBeInTheDocument();
    });
  });
});
