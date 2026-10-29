import { Location } from '@angular/common';
import { provideLocationMocks } from '@angular/common/testing';
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
    <div ngpSelect ngpSelectDropdownCloseOnNavigation data-testid="select">
      Select
      <div *ngpSelectPortal ngpSelectDropdown data-testid="dropdown">
        <div ngpSelectOption ngpSelectOptionValue="apple">Apple</div>
      </div>
    </div>
  `,
  imports: [NgpSelect, NgpSelectDropdown, NgpSelectOption, NgpSelectPortal],
})
class SelectEnabledComponent {}

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
class SelectDisabledComponent {}

async function openSelect(component: typeof SelectComponent, providers: Provider[] = []) {
  const view = await render(component, { providers: [provideLocationMocks(), ...providers] });
  fireEvent.click(view.getByTestId('select'));
  await waitFor(() => expect(screen.queryByTestId('dropdown')).toBeInTheDocument());
  return view;
}

const withRouter = provideRouter([{ path: '**', children: [] }]);

describe('NgpSelect close on navigation', () => {
  it('should close on a router navigation when enabled on the select', async () => {
    const view = await openSelect(SelectEnabledComponent, [withRouter]);

    await TestBed.inject(Router).navigateByUrl('/other');

    await waitFor(() => expect(screen.queryByTestId('dropdown')).not.toBeInTheDocument());
    expect(view.getByTestId('select')).toHaveAttribute('aria-expanded', 'false');
  });

  it('should close on a router navigation when enabled in the global config', async () => {
    await openSelect(SelectComponent, [
      withRouter,
      provideSelectConfig({ closeOnNavigation: true }),
    ]);

    await TestBed.inject(Router).navigateByUrl('/other');

    await waitFor(() => expect(screen.queryByTestId('dropdown')).not.toBeInTheDocument());
  });

  it('should close on a URL change without a router', async () => {
    await openSelect(SelectEnabledComponent);

    TestBed.inject(Location).go('/other');

    await waitFor(() => expect(screen.queryByTestId('dropdown')).not.toBeInTheDocument());
  });

  it('should stay open by default', async () => {
    await openSelect(SelectComponent, [withRouter]);

    await TestBed.inject(Router).navigateByUrl('/other');

    expect(screen.getByTestId('dropdown')).toBeInTheDocument();
  });

  it('should stay open when the select disables it over the global config', async () => {
    await openSelect(SelectDisabledComponent, [
      withRouter,
      provideSelectConfig({ closeOnNavigation: true }),
    ]);

    await TestBed.inject(Router).navigateByUrl('/other');

    expect(screen.getByTestId('dropdown')).toBeInTheDocument();
  });
});
