import { FocusMonitor } from '@angular/cdk/a11y';
import { Component, Input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { fireEvent, render } from '@testing-library/angular';
import { NgpButton } from 'ng-primitives/button';
import { describe, expect, it } from 'vitest';

@Component({
  imports: [NgpButton],
  template: `
    <button [disabled]="isDisabled" ngpButton>Test</button>
  `,
})
class ButtonHost {
  @Input() isDisabled = false;
}

@Component({
  imports: [NgpButton],
  template: `
    <button [disabled]="true" ngpButton>Test</button>
  `,
})
class InitiallyDisabledButtonHost {}

describe('NgpButton', () => {
  it('should set the disabled state during the initial change detection (no flash on navigation)', () => {
    // Flash regression: an initially-disabled button must reflect disabled
    // during the CD that creates it, not in the deferred afterRender phase
    // (which paints it enabled for a frame on zoneless client-nav). We use the
    // CDRef directly (not the fixture, which also flushes afterRender) so the
    // assertion fails if the binding only lands after a render frame.
    const fixture = TestBed.createComponent(InitiallyDisabledButtonHost);
    fixture.changeDetectorRef.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.hasAttribute('disabled')).toBe(true);
    expect(button.hasAttribute('data-disabled')).toBe(true);
  });

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
