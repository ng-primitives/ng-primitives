import { signal } from '@angular/core';
import { fireEvent, render } from '@testing-library/angular';
import { NgpPress } from 'ng-primitives/interactions';
import { describe, expect, it, vi } from 'vitest';

describe('NgpPress disabled binding', () => {
  it('should follow ngpPressDisabled as it changes at runtime', async () => {
    const pressStart = vi.fn();
    const disabled = signal(true);

    const { fixture, getByTestId } = await render(
      `<div data-testid="trigger" ngpPress [ngpPressDisabled]="disabled()" (ngpPressStart)="pressStart()"></div>`,
      { imports: [NgpPress], componentProperties: { pressStart, disabled } },
    );
    const trigger = getByTestId('trigger');

    fireEvent.pointerDown(trigger);
    fireEvent.pointerUp(trigger);
    expect(pressStart).not.toHaveBeenCalled();

    disabled.set(false);
    fixture.detectChanges();

    fireEvent.pointerDown(trigger);
    expect(pressStart).toHaveBeenCalledTimes(1);
  });
});
