import { Component, Directive } from '@angular/core';
import { fireEvent, render, waitFor } from '@testing-library/angular';
import {
  NgpMenu,
  NgpMenuItem,
  NgpMenuTrigger,
  NgpSubmenuTrigger,
  provideMenuConfig,
} from 'ng-primitives/menu';
import { describe, expect, it } from 'vitest';

/** A trigger whose menu defaults come from a config provided on the trigger element itself. */
@Directive({
  selector: '[closeOnScrollMenu]',
  hostDirectives: [{ directive: NgpMenuTrigger, inputs: ['ngpMenuTrigger:closeOnScrollMenu'] }],
  providers: [provideMenuConfig({ scrollBehavior: 'close', placement: 'right-start' })],
})
class CloseOnScrollMenuDirective {}

@Component({
  template: `
    <div style="height: 200px; overflow: auto" data-testid="scroller">
      <button [closeOnScrollMenu]="menu" data-testid="trigger">Open</button>
      <div style="height: 1000px"></div>
    </div>

    <ng-template #menu>
      <div ngpMenu style="max-height: 60px; overflow: auto" data-testid="menu">
        <button ngpMenuItem>Item 1</button>
        <button ngpMenuItem>Item 2</button>
        <button ngpMenuItem>Item 3</button>
        <button ngpMenuItem>Item 4</button>
      </div>
    </ng-template>
  `,
  imports: [CloseOnScrollMenuDirective, NgpMenu, NgpMenuItem],
})
class MenuConfigComponent {}

@Component({
  template: `
    <button
      [ngpMenuTrigger]="menu"
      [ngpMenuTriggerOffset]="{ mainAxis: 10, crossAxis: 20 }"
      [ngpMenuTriggerFlip]="false"
      ngpMenuTriggerPlacement="bottom-start"
      style="position: absolute; top: 100px; left: 100px; width: 80px; height: 30px"
      data-testid="trigger"
    >
      Open
    </button>

    <ng-template #menu>
      <div ngpMenu style="position: absolute; width: 150px" data-testid="menu">
        <button
          [ngpSubmenuTrigger]="submenu"
          [ngpSubmenuTriggerOffset]="12"
          [ngpSubmenuTriggerFlip]="false"
          ngpMenuItem
          ngpSubmenuTriggerPlacement="right-start"
          data-testid="submenu-trigger"
        >
          More
        </button>
      </div>
    </ng-template>

    <ng-template #submenu>
      <div ngpMenu style="position: absolute; width: 100px" data-testid="submenu">
        <button ngpMenuItem>Nested</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem, NgpSubmenuTrigger],
})
class MenuOffsetComponent {}

@Component({
  template: `
    <button
      [ngpMenuTrigger]="menu"
      [ngpMenuTriggerOpenTriggers]="triggers"
      [ngpMenuTriggerShowDelay]="showDelay"
      style="margin: 200px"
      data-testid="trigger"
    >
      Open
    </button>

    <ng-template #menu>
      <div ngpMenu data-testid="menu">
        <button ngpMenuItem data-testid="item-1">Item 1</button>
        <button ngpMenuItem data-testid="item-2">Item 2</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem],
})
class OpenTriggersComponent {
  triggers: ('hover' | 'click' | 'enter' | 'arrowkey')[] = ['hover'];
  showDelay = 0;
}

const query = (id: string) => document.querySelector<HTMLElement>(`[data-testid="${id}"]`);

describe('NgpMenuTrigger options', () => {
  describe('config provided on the trigger element', () => {
    it('applies the configured placement', async () => {
      const { getByTestId } = await render(MenuConfigComponent);

      fireEvent.click(getByTestId('trigger'));

      await waitFor(() => expect(query('menu')).toBeInTheDocument());
      expect(getByTestId('trigger')).toHaveAttribute('data-placement', 'right-start');
    });

    it('closes the menu when a scrollable ancestor scrolls', async () => {
      const { getByTestId } = await render(MenuConfigComponent);
      fireEvent.click(getByTestId('trigger'));
      await waitFor(() => expect(query('menu')).toBeInTheDocument());

      const scroller = getByTestId('scroller');
      scroller.scrollTop = 50;
      fireEvent.scroll(scroller);

      await waitFor(() => expect(query('menu')).not.toBeInTheDocument());
    });

    it('stays open when the menu content itself scrolls', async () => {
      const { getByTestId } = await render(MenuConfigComponent);
      fireEvent.click(getByTestId('trigger'));
      await waitFor(() => expect(query('menu')).toBeInTheDocument());

      const menu = query('menu')!;
      menu.scrollTop = 20;
      fireEvent.scroll(menu);
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(query('menu')).toBeInTheDocument();
    });
  });

  describe('offset', () => {
    it('applies an object offset on both the main and cross axis', async () => {
      const { getByTestId } = await render(MenuOffsetComponent);
      const trigger = getByTestId('trigger');

      fireEvent.click(trigger);

      await waitFor(() => {
        const triggerRect = trigger.getBoundingClientRect();
        const menuRect = query('menu')!.getBoundingClientRect();
        expect(menuRect.top).toBeCloseTo(triggerRect.bottom + 10, 0);
        expect(menuRect.left).toBeCloseTo(triggerRect.left + 20, 0);
      });
    });

    it('applies a numeric submenu offset along the main axis', async () => {
      const { getByTestId } = await render(MenuOffsetComponent);
      fireEvent.click(getByTestId('trigger'));
      await waitFor(() => expect(query('submenu-trigger')).toBeInTheDocument());

      const submenuTrigger = query('submenu-trigger')!;
      fireEvent.click(submenuTrigger);

      await waitFor(() => {
        const triggerRect = submenuTrigger.getBoundingClientRect();
        const submenuRect = query('submenu')!.getBoundingClientRect();
        expect(submenuRect.left).toBeCloseTo(triggerRect.right + 12, 0);
        expect(submenuRect.top).toBeCloseTo(triggerRect.top, 0);
      });
    });
  });

  describe('open triggers', () => {
    it('waits for the show delay before opening on hover', async () => {
      const { getByTestId } = await render(OpenTriggersComponent, {
        componentProperties: { showDelay: 300 },
      });

      fireEvent.pointerEnter(getByTestId('trigger'), { pointerType: 'mouse' });

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(query('menu')).not.toBeInTheDocument();
      await waitFor(() => expect(query('menu')).toBeInTheDocument(), { timeout: 1000 });
    });

    it('does not open on click when only hover is enabled', async () => {
      const { getByTestId } = await render(OpenTriggersComponent);

      fireEvent.click(getByTestId('trigger'));
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(query('menu')).not.toBeInTheDocument();
    });

    it('opens on the arrow key matching the placement and focuses the first item', async () => {
      const { getByTestId } = await render(OpenTriggersComponent, {
        componentProperties: { triggers: ['hover', 'arrowkey'] },
      });
      const trigger = getByTestId('trigger');
      trigger.focus();

      fireEvent.keyDown(trigger, { key: 'ArrowUp' });
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(query('menu')).not.toBeInTheDocument();

      fireEvent.keyDown(trigger, { key: 'ArrowDown' });
      await waitFor(() => expect(document.activeElement).toBe(query('item-1')));
    });

    it('toggles on Enter when the enter trigger is enabled', async () => {
      const { getByTestId } = await render(OpenTriggersComponent, {
        componentProperties: { triggers: ['hover', 'enter'] },
      });
      const trigger = getByTestId('trigger');
      trigger.focus();

      fireEvent.keyDown(trigger, { key: 'Enter' });
      await waitFor(() => expect(query('menu')).toBeInTheDocument());

      fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
      await waitFor(() => expect(query('menu')).not.toBeInTheDocument());
      await waitFor(() => expect(document.activeElement).toBe(trigger));

      fireEvent.keyDown(trigger, { key: 'Enter' });
      await waitFor(() => expect(query('menu')).toBeInTheDocument());
      fireEvent.keyDown(trigger, { key: 'Enter' });
      await waitFor(() => expect(query('menu')).not.toBeInTheDocument());
    });
  });
});
