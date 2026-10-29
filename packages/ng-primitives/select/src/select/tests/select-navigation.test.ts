import { Component, Provider } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { fireEvent, render, screen, waitFor } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import {
  NgpSelect,
  NgpSelectDropdown,
  NgpSelectOption,
  NgpSelectPortal,
  provideSelectConfig,
} from '../../index';

@Component({
  template: `
    <div ngpSelect data-testid="select">
      Select
      <div *ngpSelectPortal ngpSelectDropdown data-testid="dropdown">
        <div ngpSelectOption ngpSelectOptionValue="apple">Apple</div>
      </div>
    </div>
  `,
  imports: [NgpSelect, NgpSelectDropdown, NgpSelectOption, NgpSelectPortal],
})
class SelectComponent {}

@Component({
  template: `
    <div [ngpSelectDropdownCloseOnNavigation]="false" ngpSelect data-testid="select">
      Select
      <div *ngpSelectPortal ngpSelectDropdown data-testid="dropdown">
        <div ngpSelectOption ngpSelectOptionValue="apple">Apple</div>
      </div>
    </div>
  `,
  imports: [NgpSelect, NgpSelectDropdown, NgpSelectOption, NgpSelectPortal],
})
class SelectOptOutComponent {}

async function openSelect(component: typeof SelectComponent, providers: Provider[] = []) {
  const view = await render(component, {
    providers: [provideRouter([{ path: '**', children: [] }]), ...providers],
  });
  fireEvent.click(view.getByTestId('select'));
  await waitFor(() => expect(screen.queryByTestId('dropdown')).toBeInTheDocument());
  return view;
}

describe('NgpSelect close on navigation', () => {
  it('should close the dropdown when the router navigates', async () => {
    const view = await openSelect(SelectComponent);

    await TestBed.inject(Router).navigateByUrl('/other');

    await waitFor(() => expect(screen.queryByTestId('dropdown')).not.toBeInTheDocument());
    expect(view.getByTestId('select')).toHaveAttribute('aria-expanded', 'false');
  });

  it('should stay open when closeOnNavigation is false on the select', async () => {
    await openSelect(SelectOptOutComponent);

    await TestBed.inject(Router).navigateByUrl('/other');

    expect(screen.getByTestId('dropdown')).toBeInTheDocument();
  });

  it('should stay open when closeOnNavigation is false in the global config', async () => {
    await openSelect(SelectComponent, [provideSelectConfig({ closeOnNavigation: false })]);

    await TestBed.inject(Router).navigateByUrl('/other');

    expect(screen.getByTestId('dropdown')).toBeInTheDocument();
  });
});
