import { Component, viewChild } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { describe, expect, it, vi } from 'vitest';
import { NgpAutofill } from './autofill';

function createAnimationEvent(animationName: string): Event {
  const event = new Event('animationstart', { bubbles: true });
  (event as Event & { animationName: string }).animationName = animationName;
  return event;
}

describe('NgpAutofill', () => {
  it('should initialise correctly', async () => {
    await render(`<input ngpAutofill data-testid="input" />`, {
      imports: [NgpAutofill],
    });

    expect(screen.getByTestId('input')).toBeInTheDocument();
  });

  it('should set data-autofill when autofill animation fires', async () => {
    const { fixture } = await render(`<input ngpAutofill data-testid="input" />`, {
      imports: [NgpAutofill],
    });

    const input = screen.getByTestId('input');

    expect(input.getAttribute('data-autofill')).toBeNull();

    input.dispatchEvent(createAnimationEvent('ngp-autofill-start'));
    fixture.detectChanges();

    expect(input).toHaveAttribute('data-autofill', '');
  });

  it('should remove data-autofill when autofill ends', async () => {
    const { fixture } = await render(`<input ngpAutofill data-testid="input" />`, {
      imports: [NgpAutofill],
    });

    const input = screen.getByTestId('input');

    input.dispatchEvent(createAnimationEvent('ngp-autofill-start'));
    fixture.detectChanges();
    expect(input).toHaveAttribute('data-autofill', '');

    input.dispatchEvent(createAnimationEvent('ngp-autofill-end'));
    fixture.detectChanges();

    expect(input.getAttribute('data-autofill')).toBeNull();
  });

  it('should emit ngpAutofill output with true on autofill start', async () => {
    const autofillSpy = vi.fn();

    @Component({
      template: `
        <input (ngpAutofill)="onAutofill($event)" ngpAutofill data-testid="input" />
      `,
      imports: [NgpAutofill],
    })
    class TestComponent {
      onAutofill = autofillSpy;
    }

    const { fixture } = await render(TestComponent);

    const input = screen.getByTestId('input');
    input.dispatchEvent(createAnimationEvent('ngp-autofill-start'));
    fixture.detectChanges();

    expect(autofillSpy).toHaveBeenLastCalledWith(true);
  });

  it('should emit ngpAutofill output with false on autofill end', async () => {
    const autofillSpy = vi.fn();

    @Component({
      template: `
        <input (ngpAutofill)="onAutofill($event)" ngpAutofill data-testid="input" />
      `,
      imports: [NgpAutofill],
    })
    class TestComponent {
      onAutofill = autofillSpy;
    }

    const { fixture } = await render(TestComponent);

    const input = screen.getByTestId('input');
    input.dispatchEvent(createAnimationEvent('ngp-autofill-start'));
    fixture.detectChanges();
    input.dispatchEvent(createAnimationEvent('ngp-autofill-end'));
    fixture.detectChanges();

    expect(autofillSpy).toHaveBeenLastCalledWith(false);
  });

  it('should expose autofilled signal reflecting current state', async () => {
    @Component({
      template: `
        <input #ref="ngpAutofill" ngpAutofill data-testid="input" />
      `,
      imports: [NgpAutofill],
    })
    class TestComponent {
      readonly ref = viewChild.required<NgpAutofill>('ref');
    }

    const { fixture } = await render(TestComponent);
    const component = fixture.componentInstance;

    expect(component.ref().autofilled()).toBe(false);

    const input = screen.getByTestId('input');
    input.dispatchEvent(createAnimationEvent('ngp-autofill-start'));
    fixture.detectChanges();
    expect(component.ref().autofilled()).toBe(true);

    input.dispatchEvent(createAnimationEvent('ngp-autofill-end'));
    fixture.detectChanges();
    expect(component.ref().autofilled()).toBe(false);
  });

  it('should ignore unrelated animation events', async () => {
    const { fixture } = await render(`<input ngpAutofill data-testid="input" />`, {
      imports: [NgpAutofill],
    });

    const input = screen.getByTestId('input');
    input.dispatchEvent(createAnimationEvent('some-other-animation'));
    fixture.detectChanges();

    expect(input.getAttribute('data-autofill')).toBeNull();
  });
});
