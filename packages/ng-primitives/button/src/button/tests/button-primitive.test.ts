import { FocusMonitor } from '@angular/cdk/a11y';
import { Component, input, signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { fireEvent, render } from '@testing-library/angular';
import { NgpButton } from 'ng-primitives/button';
import { describe, expect, it } from 'vitest';

@Component({
  imports: [NgpButton],
  template: `
    <button [disabled]="isDisabled()" ngpButton>Test</button>
  `,
})
class ButtonHost {
  readonly isDisabled = input(false);
}

describe('NgpButton', () => {
  it('should set the disabled attribute when disabled', async () => {
    const container = await render(`<button ngpButton [disabled]="true"></button>`, {
      imports: [NgpButton],
    });

    expect(container.getByRole('button')).toHaveAttribute('disabled');
  });

  it('should not set the disabled attribute when not disabled', async () => {
    const container = await render(`<button ngpButton></button>`, {
      imports: [NgpButton],
    });

    expect(container.getByRole('button')).not.toHaveAttribute('disabled');
  });

  it('should not set the disabled attribute when not a button', async () => {
    const container = await render(`<a data-testid="button" ngpButton [disabled]="true"></a>`, {
      imports: [NgpButton],
    });
    const anchor = container.getByTestId('button');

    expect(anchor).not.toHaveAttribute('disabled');
  });

  it('should set aria-disabled but not the native disabled attribute when soft disabled', async () => {
    const container = await render(`<button ngpButton [disabled]="'soft'"></button>`, {
      imports: [NgpButton],
    });

    const button = container.getByRole('button');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).not.toHaveAttribute('disabled');
  });

  it('should not set aria-disabled when not disabled', async () => {
    const container = await render(`<button ngpButton></button>`, {
      imports: [NgpButton],
    });

    expect(container.getByRole('button')).not.toHaveAttribute('aria-disabled');
  });

  it('should not set aria-disabled when fully disabled on a native button', async () => {
    const container = await render(`<button ngpButton [disabled]="true"></button>`, {
      imports: [NgpButton],
    });

    expect(container.getByRole('button')).not.toHaveAttribute('aria-disabled');
  });

  it('should set aria-disabled when fully disabled on a non-native host', async () => {
    const container = await render(`<a data-testid="button" ngpButton [disabled]="true"></a>`, {
      imports: [NgpButton],
    });

    expect(container.getByTestId('button')).toHaveAttribute('aria-disabled', 'true');
  });

  it('should set aria-disabled when soft disabled on a non-native host', async () => {
    const container = await render(`<a data-testid="button" ngpButton [disabled]="'soft'"></a>`, {
      imports: [NgpButton],
    });

    expect(container.getByTestId('button')).toHaveAttribute('aria-disabled', 'true');
  });

  it('should keep a soft-disabled button in the tab order', async () => {
    const container = await render(`<button ngpButton [disabled]="'soft'"></button>`, {
      imports: [NgpButton],
    });

    const button = container.getByRole('button');
    button.focus();
    expect(button).toHaveFocus();
  });

  it('should set the data-disabled attribute when disabled', async () => {
    const container = await render(`<button ngpButton [disabled]="true"></button>`, {
      imports: [NgpButton],
    });

    expect(container.getByRole('button')).toHaveAttribute('data-disabled', '');
  });

  it('should set data-disabled="soft" when soft disabled', async () => {
    const container = await render(`<button ngpButton [disabled]="'soft'"></button>`, {
      imports: [NgpButton],
    });

    expect(container.getByRole('button')).toHaveAttribute('data-disabled', 'soft');
  });

  it('should not set the data-disabled attribute when not disabled', async () => {
    const container = await render(`<button ngpButton></button>`, {
      imports: [NgpButton],
    });

    expect(container.getByRole('button')).not.toHaveAttribute('data-disabled');
  });

  it('should update the data-disabled attribute when disabled changes', async () => {
    const container = await render(ButtonHost, {
      componentInputs: {
        isDisabled: false,
      },
    });

    expect(container.getByRole('button')).not.toHaveAttribute('data-disabled');
    expect(container.getByRole('button')).not.toHaveAttribute('disabled');

    container.fixture.componentRef.setInput('isDisabled', true);
    container.fixture.detectChanges();

    expect(container.getByRole('button')).toHaveAttribute('data-disabled');
    expect(container.getByRole('button')).toHaveAttribute('disabled');
  });

  it('should add the data-hover attribute when hovered', async () => {
    const container = await render(`<button ngpButton></button>`, {
      imports: [NgpButton],
    });

    const button = container.getByRole('button');
    fireEvent.mouseEnter(button);
    expect(button).toHaveAttribute('data-hover', '');
  });

  it('should remove the data-hover attribute when not hovered', async () => {
    const container = await render(`<button ngpButton></button>`, {
      imports: [NgpButton],
    });

    const button = container.getByRole('button');
    fireEvent.mouseEnter(button);
    expect(button).toHaveAttribute('data-hover', '');
    fireEvent.mouseLeave(button);
    expect(button).not.toHaveAttribute('data-hover');
  });

  it('should add the data-focus attribute when focused', async () => {
    const container = await render(`<button ngpButton></button>`, {
      imports: [NgpButton],
    });

    const focusMonitor = container.fixture.debugElement.injector.get(FocusMonitor);

    const button = container.getByRole('button');
    focusMonitor.focusVia(button, 'keyboard');
    container.detectChanges();
    expect(button).toHaveAttribute('data-focus-visible');
  });

  it('should remove the data-focus attribute when not focused', async () => {
    const container = await render(`<button ngpButton></button>`, {
      imports: [NgpButton],
    });

    const focusMonitor = container.fixture.debugElement.injector.get(FocusMonitor);

    const button = container.getByRole('button');
    focusMonitor.focusVia(button, 'keyboard');
    container.detectChanges();
    expect(button).toHaveAttribute('data-focus-visible');
    fireEvent.blur(button);
    container.detectChanges();
    expect(button).not.toHaveAttribute('data-focus-visible');
  });

  it('should add the data-press attribute when pressed', async () => {
    const container = await render(`<button ngpButton></button>`, {
      imports: [NgpButton],
    });

    const button = container.getByRole('button');
    fireEvent.pointerDown(button);
    expect(button).toHaveAttribute('data-press', '');
  });

  it('should remove the data-press attribute when not pressed', async () => {
    const container = await render(`<button ngpButton></button>`, {
      imports: [NgpButton],
    });

    const button = container.getByRole('button');
    fireEvent.pointerDown(button);
    expect(button).toHaveAttribute('data-press', '');
    fireEvent.pointerUp(button);
    expect(button).not.toHaveAttribute('data-press');
  });

  it('should not add the data-press attribute when disabled', async () => {
    const container = await render(`<button ngpButton [disabled]="true"></button>`, {
      imports: [NgpButton],
    });

    const button = container.getByRole('button');
    fireEvent.pointerDown(button);
    expect(button).not.toHaveAttribute('data-press');
  });

  it('should not add the data-focus-visible attribute when disabled', async () => {
    const container = await render(`<button ngpButton [disabled]="true"></button>`, {
      imports: [NgpButton],
    });

    const focusMonitor = container.fixture.debugElement.injector.get(FocusMonitor);

    const button = container.getByRole('button');
    focusMonitor.focusVia(button, 'keyboard');
    container.detectChanges();
    expect(button).not.toHaveAttribute('data-focus-visible');
  });

  it('should not add the data-hover attribute when disabled', async () => {
    const container = await render(`<button ngpButton [disabled]="true"></button>`, {
      imports: [NgpButton],
    });

    const button = container.getByRole('button');
    fireEvent.mouseEnter(button);
    expect(button).not.toHaveAttribute('data-hover');
  });

  it('should not add the data-hover attribute when soft disabled', async () => {
    const container = await render(`<button ngpButton [disabled]="'soft'"></button>`, {
      imports: [NgpButton],
    });

    const button = container.getByRole('button');
    fireEvent.mouseEnter(button);
    expect(button).not.toHaveAttribute('data-hover');
  });

  it('should not add the data-press attribute when soft disabled', async () => {
    const container = await render(`<button ngpButton [disabled]="'soft'"></button>`, {
      imports: [NgpButton],
    });

    const button = container.getByRole('button');
    fireEvent.pointerDown(button);
    expect(button).not.toHaveAttribute('data-press');
  });

  it('should still add the data-focus-visible attribute when soft disabled', async () => {
    const container = await render(`<button ngpButton [disabled]="'soft'"></button>`, {
      imports: [NgpButton],
    });

    const focusMonitor = container.fixture.debugElement.injector.get(FocusMonitor);

    const button = container.getByRole('button');
    focusMonitor.focusVia(button, 'keyboard');
    container.detectChanges();
    expect(button).toHaveAttribute('data-focus-visible');
  });
});

describe('NgpButton disabled sources', () => {
  @Component({
    imports: [NgpButton],
    template: `
      <button [disabled]="disabled()" ngpButton>Test</button>
    `,
  })
  class Host {
    readonly disabled = signal<boolean | 'soft'>(false);
  }

  async function setup() {
    const view = await render(Host);
    const button = view.fixture.debugElement.query(By.directive(NgpButton)).injector.get(NgpButton);
    const source = signal(false);
    button.registerDisabledSource(source);
    await view.fixture.whenStable();
    return { view, button, source, element: view.getByRole('button') };
  }

  it('disables the button while a registered source is true', async () => {
    const { view, source, element } = await setup();
    expect(element).not.toBeDisabled();

    source.set(true);
    await view.fixture.whenStable();
    expect(element).toBeDisabled();
    expect(element).toHaveAttribute('data-disabled', '');

    source.set(false);
    await view.fixture.whenStable();
    expect(element).not.toBeDisabled();
    expect(element).not.toHaveAttribute('data-disabled');
  });

  it('keeps the button disabled by its own input when every source is false', async () => {
    const { view, element } = await setup();

    view.fixture.componentInstance.disabled.set(true);
    await view.fixture.whenStable();

    expect(element).toBeDisabled();
  });

  it('stays disabled while a source is true, whatever the input does', async () => {
    const { view, source, element } = await setup();
    source.set(true);
    view.fixture.componentInstance.disabled.set(true);
    await view.fixture.whenStable();

    view.fixture.componentInstance.disabled.set(false);
    await view.fixture.whenStable();
    expect(element).toBeDisabled();

    source.set(false);
    await view.fixture.whenStable();
    expect(element).not.toBeDisabled();
  });

  it('upgrades a soft-disabled button to fully disabled while a source is true', async () => {
    const { view, source, element } = await setup();
    view.fixture.componentInstance.disabled.set('soft');
    source.set(true);
    await view.fixture.whenStable();

    expect(element).toBeDisabled();
    expect(element).toHaveAttribute('data-disabled', '');
    expect(element).not.toHaveAttribute('aria-disabled');
  });

  it('stops following a source once it is unregistered', async () => {
    const { view, button, source, element } = await setup();
    source.set(true);
    await view.fixture.whenStable();

    button.unregisterDisabledSource(source);
    await view.fixture.whenStable();

    expect(element).not.toBeDisabled();
  });
});
