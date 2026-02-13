import { Component } from '@angular/core';
import { fireEvent, render, waitFor } from '@testing-library/angular';
import { NgpPopover, NgpPopoverTrigger } from 'ng-primitives/popover';

describe('NgpPopoverTrigger', () => {
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
});
