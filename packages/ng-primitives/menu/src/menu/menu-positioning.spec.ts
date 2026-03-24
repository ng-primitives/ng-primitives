import { Component } from '@angular/core';
import * as floatingUiDom from '@floating-ui/dom';
import { fireEvent, render, waitFor } from '@testing-library/angular';
import { NgpMenuItem } from '../menu-item/menu-item';
import { NgpMenuTrigger } from '../menu-trigger/menu-trigger';
import { NgpMenu } from './menu';

/**
 * Standard template-based menu — the `ngpMenu` directive is placed directly
 * on the root element of the ng-template.
 */
@Component({
  template: `
    <button [ngpMenuTrigger]="menu" data-testid="trigger">Open Menu</button>

    <ng-template #menu>
      <div ngpMenu data-testid="menu">
        <button ngpMenuItem>Item 1</button>
        <button ngpMenuItem>Item 2</button>
      </div>
    </ng-template>
  `,
  imports: [NgpMenuTrigger, NgpMenu, NgpMenuItem],
})
class TemplateMenuComponent {}

/**
 * Component-based menu using hostDirectives — the `ngpMenu` directive is
 * applied via hostDirectives on the component class itself, so the host
 * element is the portal root AND the `[ngpMenu]` element.
 */
@Component({
  selector: 'app-preset-menu',
  hostDirectives: [NgpMenu],
  template: `
    <button ngpMenuItem>Preset Item 1</button>
    <button ngpMenuItem>Preset Item 2</button>
  `,
  imports: [NgpMenuItem],
})
class PresetMenuComponent {}

@Component({
  template: `
    <button [ngpMenuTrigger]="menu" data-testid="trigger">Open Menu</button>

    <ng-template #menu>
      <app-preset-menu data-testid="menu" />
    </ng-template>
  `,
  imports: [NgpMenuTrigger, PresetMenuComponent],
})
class HostDirectiveMenuComponent {}

/**
 * Wrapped component menu — the `ngpMenu` directive is on a child div inside
 * a wrapper component. The portal root is the wrapper's host element, but
 * positioning should use the inner `[ngpMenu]` div.
 */
@Component({
  selector: 'app-wrapped-menu',
  template: `
    <div ngpMenu data-testid="menu">
      <button ngpMenuItem>Wrapped Item 1</button>
      <button ngpMenuItem>Wrapped Item 2</button>
    </div>
  `,
  imports: [NgpMenu, NgpMenuItem],
})
class WrappedMenuComponent {}

@Component({
  template: `
    <button [ngpMenuTrigger]="menu" data-testid="trigger">Open Menu</button>

    <ng-template #menu>
      <app-wrapped-menu data-testid="wrapper" />
    </ng-template>
  `,
  imports: [NgpMenuTrigger, WrappedMenuComponent],
})
class WrappedMenuTestComponent {}

/**
 * Component class passed directly to [ngpMenuTrigger] — no ng-template involved.
 * The trigger receives a Type<unknown> instead of a TemplateRef.
 */
@Component({
  selector: 'app-direct-menu',
  template: `
    <div ngpMenu data-testid="menu">
      <button ngpMenuItem>Direct Item 1</button>
      <button ngpMenuItem>Direct Item 2</button>
    </div>
  `,
  imports: [NgpMenu, NgpMenuItem],
})
class DirectMenuComponent {}

@Component({
  template: `
    <button [ngpMenuTrigger]="menu" data-testid="trigger">Open Menu</button>
  `,
  imports: [NgpMenuTrigger],
})
class DirectComponentClassMenuComponent {
  readonly menu = DirectMenuComponent;
}

/**
 * Helper to open a menu and return the computePosition spy.
 */
async function openMenu(fixture: {
  autoDetectChanges: (autoDetect: boolean) => void;
  debugElement: { nativeElement: HTMLElement };
}): Promise<void> {
  fixture.autoDetectChanges(true);

  const trigger = fixture.debugElement.nativeElement.querySelector('[data-testid="trigger"]')!;
  fireEvent.click(trigger);

  await waitFor(() => {
    expect(document.querySelector('[data-testid="menu"]')).toBeInTheDocument();
  });
}

describe('Menu outlet element positioning', () => {
  let computePositionSpy: jest.SpyInstance;

  beforeEach(() => {
    computePositionSpy = jest.spyOn(floatingUiDom, 'computePosition');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should position the [ngpMenu] element for template-based menus', async () => {
    const { fixture } = await render(TemplateMenuComponent);
    await openMenu(fixture);

    expect(computePositionSpy).toHaveBeenCalled();

    // The second argument to computePosition is the floating element
    const lastCall = computePositionSpy.mock.calls[computePositionSpy.mock.calls.length - 1];
    const floatingElement = lastCall[1] as HTMLElement;

    expect(floatingElement.getAttribute('data-testid')).toBe('menu');
    expect(floatingElement.getAttribute('role')).toBe('menu');
  });

  it('should position the host element for hostDirective-based menus', async () => {
    const { fixture } = await render(HostDirectiveMenuComponent);
    await openMenu(fixture);

    expect(computePositionSpy).toHaveBeenCalled();

    const lastCall = computePositionSpy.mock.calls[computePositionSpy.mock.calls.length - 1];
    const floatingElement = lastCall[1] as HTMLElement;

    expect(floatingElement.getAttribute('data-testid')).toBe('menu');
    expect(floatingElement.getAttribute('role')).toBe('menu');
  });

  it('should position the inner [ngpMenu] element for wrapped component menus', async () => {
    const { fixture } = await render(WrappedMenuTestComponent);
    await openMenu(fixture);

    expect(computePositionSpy).toHaveBeenCalled();

    const lastCall = computePositionSpy.mock.calls[computePositionSpy.mock.calls.length - 1];
    const floatingElement = lastCall[1] as HTMLElement;

    // The floating element should be the inner [ngpMenu] div, NOT the wrapper host
    expect(floatingElement.getAttribute('data-testid')).toBe('menu');
    expect(floatingElement.getAttribute('role')).toBe('menu');

    // Verify it's not the wrapper element
    const wrapper = document.querySelector('[data-testid="wrapper"]');
    expect(floatingElement).not.toBe(wrapper);
  });

  it('should position the inner [ngpMenu] element when a component class is passed directly', async () => {
    const { fixture } = await render(DirectComponentClassMenuComponent);
    await openMenu(fixture);

    expect(computePositionSpy).toHaveBeenCalled();

    const lastCall = computePositionSpy.mock.calls[computePositionSpy.mock.calls.length - 1];
    const floatingElement = lastCall[1] as HTMLElement;

    // The floating element should be the inner [ngpMenu] div
    expect(floatingElement.getAttribute('data-testid')).toBe('menu');
    expect(floatingElement.getAttribute('role')).toBe('menu');
  });

  it('should set data-placement on the [ngpMenu] element for wrapped menus', async () => {
    const { fixture } = await render(WrappedMenuTestComponent);
    await openMenu(fixture);

    await waitFor(() => {
      const menuElement = document.querySelector('[data-testid="menu"]');
      expect(menuElement).toBeInTheDocument();
      expect(menuElement?.getAttribute('data-placement')).toBeTruthy();
    });
  });
});
