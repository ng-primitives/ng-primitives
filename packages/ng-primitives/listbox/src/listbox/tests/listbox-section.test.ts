import { Component, signal } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import { NgpListboxHeader, NgpListboxSection } from 'ng-primitives/listbox';
import { describe, expect, it } from 'vitest';

describe('NgpListboxSection', () => {
  it('should have role="group"', async () => {
    await render(`<div ngpListboxSection data-testid="section"></div>`, {
      imports: [NgpListboxSection],
    });

    expect(screen.getByTestId('section')).toHaveAttribute('role', 'group');
  });

  it('should set aria-labelledby from header', async () => {
    await render(
      `<div ngpListboxSection data-testid="section">
        <div ngpListboxHeader data-testid="header">Fruits</div>
      </div>`,
      {
        imports: [NgpListboxSection, NgpListboxHeader],
      },
    );

    const section = screen.getByTestId('section');
    const header = screen.getByTestId('header');

    expect(header).toHaveAttribute('id');
    expect(section).toHaveAttribute('aria-labelledby', header.id);
  });

  it('should not have aria-labelledby when no header is present', async () => {
    await render(`<div ngpListboxSection data-testid="section"></div>`, {
      imports: [NgpListboxSection],
    });

    expect(screen.getByTestId('section')).not.toHaveAttribute('aria-labelledby');
  });

  it('should render header with role="presentation"', async () => {
    await render(
      `<div ngpListboxSection>
        <div ngpListboxHeader data-testid="header">Group Label</div>
      </div>`,
      {
        imports: [NgpListboxSection, NgpListboxHeader],
      },
    );

    expect(screen.getByTestId('header')).toHaveAttribute('role', 'presentation');
  });

  it('should remove aria-labelledby when the header is removed', async () => {
    @Component({
      template: `
        <div ngpListboxSection data-testid="section">
          @if (showHeader()) {
            <div ngpListboxHeader data-testid="header">Fruits</div>
          }
        </div>
      `,
      imports: [NgpListboxSection, NgpListboxHeader],
    })
    class TestHost {
      readonly showHeader = signal(true);
    }

    const { fixture } = await render(TestHost);
    const section = screen.getByTestId('section');

    await waitFor(() => expect(section).toHaveAttribute('aria-labelledby'));

    fixture.componentInstance.showHeader.set(false);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(section).not.toHaveAttribute('aria-labelledby');
  });
});
