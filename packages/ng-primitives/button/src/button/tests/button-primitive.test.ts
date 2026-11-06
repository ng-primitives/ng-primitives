import { FocusMonitor } from '@angular/cdk/a11y';
import { Component, input, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { fireEvent, render } from '@testing-library/angular';
import { NgpButton } from 'ng-primitives/button';
import { afterEach, describe, expect, it, onTestFinished, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { NgpButtonAnnouncer } from '../button-announcer';

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

describe('NgpButton pending', () => {
  @Component({
    imports: [NgpButton],
    template: `
      <form (submit)="onSubmit($event)">
        <input aria-label="Name" />
        <button
          [ngpButtonPending]="pending()"
          [disabled]="disabled()"
          (click)="clicks.set(clicks() + 1)"
          ngpButton
          type="submit"
        >
          Save
        </button>
      </form>
      <button type="button">Elsewhere</button>
    `,
  })
  class Host {
    readonly pending = signal(false);
    readonly disabled = signal<boolean | 'soft'>(false);
    readonly clicks = signal(0);
    readonly submits = signal(0);

    onSubmit(event: Event): void {
      event.preventDefault();
      this.submits.update(count => count + 1);
    }
  }

  async function setup({ pending = true } = {}) {
    const view = await render(Host);
    view.fixture.componentInstance.pending.set(pending);
    await view.fixture.whenStable();
    return {
      view,
      host: view.fixture.componentInstance,
      button: view.getByRole('button', { name: 'Save' }),
      field: view.getByRole('textbox', { name: 'Name' }),
    };
  }

  function announcements(): Element[] {
    return Array.from(document.querySelectorAll('[aria-live] [aria-labelledby]'));
  }

  it('sets data-pending and aria-disabled without the native disabled attribute', async () => {
    const { button } = await setup();

    expect(button).toHaveAttribute('data-pending', '');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).not.toBeDisabled();
  });

  it('clears data-pending and aria-disabled when pending ends', async () => {
    const { view, host, button } = await setup();

    host.pending.set(false);
    await view.fixture.whenStable();

    expect(button).not.toHaveAttribute('data-pending');
    expect(button).not.toHaveAttribute('aria-disabled');
  });

  it('sets aria-disabled on a pending non-native host', async () => {
    const view = await render(`<a data-testid="button" ngpButton ngpButtonPending></a>`, {
      imports: [NgpButton],
    });

    expect(view.getByTestId('button')).toHaveAttribute('aria-disabled', 'true');
  });

  it('lets a full disable take over a pending button', async () => {
    const { view, host, button } = await setup();

    host.disabled.set(true);
    await view.fixture.whenStable();

    expect(button).toBeDisabled();
    expect(button).not.toHaveAttribute('aria-disabled');
  });

  it('keeps focus on the button when pending starts', async () => {
    const { view, host, button } = await setup({ pending: false });
    button.focus();

    host.pending.set(true);
    await view.fixture.whenStable();

    expect(button).toHaveFocus();
  });

  it('runs click handlers and submits the form when not pending', async () => {
    const { host, button, field } = await setup({ pending: false });

    await userEvent.click(button);
    expect(host.clicks()).toBe(1);
    expect(host.submits()).toBe(1);

    await userEvent.click(field);
    await userEvent.keyboard('{Enter}');
    expect(host.submits()).toBe(2);
  });

  it('ignores clicks while pending', async () => {
    const { host, button } = await setup();

    // Playwright treats aria-disabled as not actionable; force the real click through.
    await userEvent.click(button, { force: true });

    expect(host.clicks()).toBe(0);
    expect(host.submits()).toBe(0);
  });

  it('does not submit its form on Enter or Space while pending', async () => {
    const { host, button } = await setup();
    button.focus();

    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');

    expect(host.clicks()).toBe(0);
    expect(host.submits()).toBe(0);
  });

  it('does not submit its form on Enter in a field while pending', async () => {
    const { host, field } = await setup();

    await userEvent.click(field);
    await userEvent.keyboard('{Enter}');

    expect(host.submits()).toBe(0);
  });

  it('ignores clicks on a pending soft-disabled button', async () => {
    const { view, host, button } = await setup();
    host.disabled.set('soft');
    await view.fixture.whenStable();

    await userEvent.click(button, { force: true });

    expect(host.clicks()).toBe(0);
    expect(host.submits()).toBe(0);
  });

  it('does not follow the link of a pending anchor', async () => {
    const view = await render(`<a href="#ngp-pending-link" ngpButton ngpButtonPending>Open</a>`, {
      imports: [NgpButton],
    });

    await userEvent.click(view.getByRole('link'), { force: true });

    expect(window.location.hash).not.toBe('#ngp-pending-link');
  });

  it('blocks the host click listener of a component using NgpButton as a host directive', async () => {
    @Component({
      selector: 'button[app-pending-button]',
      hostDirectives: [{ directive: NgpButton, inputs: ['ngpButtonPending: pending'] }],
      host: { '(click)': 'clicks.set(clicks() + 1)' },
      template: `
        <ng-content />
      `,
    })
    class PendingButton {
      readonly clicks = signal(0);
    }

    const view = await render(`<button app-pending-button pending>Save</button>`, {
      imports: [PendingButton],
    });
    const component = view.fixture.debugElement
      .query(By.directive(PendingButton))
      .injector.get(PendingButton);

    await userEvent.click(view.getByRole('button'), { force: true });

    expect(component.clicks()).toBe(0);
  });

  it('does not add hover or press states while pending', async () => {
    const { button } = await setup();

    fireEvent.pointerEnter(button);
    fireEvent.pointerDown(button);

    expect(button).not.toHaveAttribute('data-hover');
    expect(button).not.toHaveAttribute('data-press');
  });

  it('keeps focus-visible while pending', async () => {
    const { view, button } = await setup();

    view.fixture.debugElement.injector.get(FocusMonitor).focusVia(button, 'keyboard');
    view.fixture.detectChanges();

    expect(button).toHaveAttribute('data-focus-visible');
  });

  it('can be set through the state', async () => {
    const { view, button } = await setup({ pending: false });
    const directive = view.fixture.debugElement
      .query(By.directive(NgpButton))
      .injector.get(NgpButton);

    directive.setPending(true);
    await view.fixture.whenStable();

    expect(button).toHaveAttribute('data-pending', '');
  });

  it('announces the button name when pending starts and ends while focused', async () => {
    const { view, host, button } = await setup({ pending: false });
    button.focus();

    host.pending.set(true);
    await view.fixture.whenStable();
    await vi.waitFor(() => expect(announcements()).toHaveLength(1));

    const [started] = announcements();
    expect(button.id).not.toBe('');
    expect(started).toHaveAttribute('aria-labelledby', button.id);
    expect(started).toHaveAttribute('role', 'img');
    expect(started).toHaveAccessibleName('Save');

    host.pending.set(false);
    await view.fixture.whenStable();
    await vi.waitFor(() => expect(announcements()).toHaveLength(2));
  });

  it('keeps an existing id when announcing', async () => {
    const view = await render(
      `<button id="save" ngpButton [ngpButtonPending]="pending()">Save</button>`,
      { imports: [NgpButton], componentProperties: { pending: signal(false) } },
    );
    const button = view.getByRole('button');
    button.focus();

    view.fixture.componentInstance.pending.set(true);
    await view.fixture.whenStable();

    await vi.waitFor(() => expect(announcements()).toHaveLength(1));
    expect(announcements()[0]).toHaveAttribute('aria-labelledby', 'save');
  });

  it('does not announce when the button does not have focus', async () => {
    const { view, host } = await setup({ pending: false });
    view.getByRole('button', { name: 'Elsewhere' }).focus();

    host.pending.set(true);
    await view.fixture.whenStable();
    await new Promise(resolve => setTimeout(resolve, 150));

    expect(announcements()).toHaveLength(0);
  });

  it('does not announce the initial pending state', async () => {
    await setup();
    await new Promise(resolve => setTimeout(resolve, 150));

    expect(announcements()).toHaveLength(0);
  });
});

describe('NgpButtonAnnouncer', () => {
  afterEach(() => vi.useRealTimers());

  function setup() {
    vi.useFakeTimers();
    const announcer = TestBed.inject(NgpButtonAnnouncer);
    const button = document.createElement('button');
    button.id = 'ngp-announced-button';
    button.textContent = 'Save';
    document.body.appendChild(button);
    onTestFinished(() => button.remove());
    return { announcer, button };
  }

  function announcements(): Element[] {
    return Array.from(document.querySelectorAll('[aria-live] [aria-labelledby]'));
  }

  it('removes an announcement once it has been read', () => {
    const { announcer } = setup();

    announcer.announceName('ngp-announced-button');
    vi.advanceTimersByTime(100);
    expect(announcements()).toHaveLength(1);

    vi.advanceTimersByTime(7000);
    expect(announcements()).toHaveLength(0);
  });

  it('skips the announcement when the element left the DOM before it was added', () => {
    const { announcer, button } = setup();

    announcer.announceName('ngp-announced-button');
    button.remove();
    vi.advanceTimersByTime(100);

    expect(announcements()).toHaveLength(0);
  });
});
