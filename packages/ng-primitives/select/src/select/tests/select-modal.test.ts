import { Component, signal } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import {
  NgpSelect,
  NgpSelectDropdown,
  NgpSelectInput,
  NgpSelectList,
  NgpSelectOption,
  NgpSelectPortal,
  provideSelectConfig,
} from 'ng-primitives/select';
import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

@Component({
  imports: [NgpSelect, NgpSelectDropdown, NgpSelectOption, NgpSelectPortal],
  template: `
    <button (click)="pageClicks.set(pageClicks() + 1)" data-testid="page-button">Page</button>

    <div [ngpSelectDropdownModal]="modal()" ngpSelect data-testid="select">
      Pick a fruit
      <div *ngpSelectPortal ngpSelectDropdown data-testid="dropdown">
        <div ngpSelectOptionValue="Apple" ngpSelectOption>Apple</div>
      </div>
    </div>
  `,
})
class ModalSelectHost {
  readonly modal = signal(true);
  readonly pageClicks = signal(0);
}

function isInert(element: Element): boolean {
  return element.closest('[inert]') !== null;
}

async function openDropdown(): Promise<HTMLElement> {
  await userEvent.click(screen.getByTestId('select'));
  return screen.findByTestId('dropdown');
}

describe('NgpSelect modal', () => {
  // The pointer keeps its position across test files: park it where nothing renders, so a later
  // file does not open something on hover.
  afterEach(async () => {
    const corner = document.body.appendChild(document.createElement('div'));
    corner.style.cssText = 'position: fixed; right: 0; bottom: 0; width: 4px; height: 4px;';
    await userEvent.hover(corner);
    corner.remove();
  });

  it('makes the rest of the page inert, but not the select', async () => {
    await render(ModalSelectHost);
    const dropdown = await openDropdown();

    expect(isInert(screen.getByTestId('page-button'))).toBe(true);
    expect(isInert(screen.getByTestId('select'))).toBe(false);
    expect(isInert(dropdown)).toBe(false);
  });

  it('keeps the select usable, so clicking it closes the dropdown', async () => {
    await render(ModalSelectHost);
    await openDropdown();
    expect(isInert(screen.getByTestId('page-button'))).toBe(true);

    await userEvent.click(screen.getByTestId('select'));

    await waitFor(() => expect(screen.queryByTestId('dropdown')).toBeNull());
  });

  it('closes on a click outside without letting the click through', async () => {
    const { fixture } = await render(ModalSelectHost);
    await openDropdown();

    // `force` skips Playwright's check that the target takes pointer events
    await userEvent.click(screen.getByTestId('page-button'), { force: true });

    await waitFor(() => expect(screen.queryByTestId('dropdown')).toBeNull());
    expect(fixture.componentInstance.pageClicks()).toBe(0);
    expect(isInert(screen.getByTestId('page-button'))).toBe(false);
  });

  it('lets the click through when it is not modal', async () => {
    const { fixture } = await render(ModalSelectHost);
    fixture.componentInstance.modal.set(false);
    fixture.detectChanges();
    await openDropdown();

    expect(isInert(screen.getByTestId('page-button'))).toBe(false);

    await userEvent.click(screen.getByTestId('page-button'));

    await waitFor(() => expect(screen.queryByTestId('dropdown')).toBeNull());
    expect(fixture.componentInstance.pageClicks()).toBe(1);
  });

  it('moves on to the next field on Tab', async () => {
    @Component({
      imports: [NgpSelect, NgpSelectDropdown, NgpSelectOption, NgpSelectPortal],
      template: `
        <div ngpSelect ngpSelectDropdownModal data-testid="select">
          Pick a fruit
          <div *ngpSelectPortal ngpSelectDropdown data-testid="dropdown">
            <div ngpSelectOptionValue="Apple" ngpSelectOption>Apple</div>
          </div>
        </div>
        <input data-testid="next" aria-label="Next" />
      `,
    })
    class TabHost {}

    await render(TabHost);
    await openDropdown();

    await userEvent.keyboard('{Tab}');

    expect(document.activeElement).toBe(screen.getByTestId('next'));
    await waitFor(() => expect(screen.queryByTestId('dropdown')).toBeNull());
  });

  it('moves on to the next field on Tab from the search input', async () => {
    @Component({
      imports: [
        NgpSelect,
        NgpSelectDropdown,
        NgpSelectInput,
        NgpSelectList,
        NgpSelectOption,
        NgpSelectPortal,
      ],
      template: `
        <div ngpSelect ngpSelectDropdownModal data-testid="select">
          Pick a fruit
          <div *ngpSelectPortal ngpSelectDropdown data-testid="dropdown" aria-label="Fruits">
            <input ngpSelectInput aria-label="Search" data-testid="search" />
            <div ngpSelectList aria-label="Options">
              <div ngpSelectOptionValue="Apple" ngpSelectOption>Apple</div>
            </div>
          </div>
        </div>
        <input data-testid="next" aria-label="Next" />
      `,
    })
    class SearchTabHost {}

    await render(SearchTabHost);
    await openDropdown();
    await waitFor(() => expect(document.activeElement).toBe(screen.getByTestId('search')));

    await userEvent.keyboard('{Tab}');

    expect(document.activeElement).toBe(screen.getByTestId('next'));
  });

  it('can be made modal from the config', async () => {
    @Component({
      imports: [NgpSelect, NgpSelectDropdown, NgpSelectOption, NgpSelectPortal],
      providers: [provideSelectConfig({ modal: true })],
      template: `
        <button data-testid="page-button">Page</button>
        <div ngpSelect data-testid="select">
          Pick a fruit
          <div *ngpSelectPortal ngpSelectDropdown data-testid="dropdown">
            <div ngpSelectOptionValue="Apple" ngpSelectOption>Apple</div>
          </div>
        </div>
      `,
    })
    class ConfiguredHost {}

    await render(ConfiguredHost);
    await openDropdown();

    expect(isInert(screen.getByTestId('page-button'))).toBe(true);
  });
});
