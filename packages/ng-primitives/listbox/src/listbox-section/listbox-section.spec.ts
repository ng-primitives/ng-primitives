import { render, screen } from '@testing-library/angular';
import { NgpListboxHeader } from '../listbox-header/listbox-header';
import { NgpListboxSection } from './listbox-section';

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

    const section = screen.getByTestId('section');
    expect(section.getAttribute('aria-labelledby')).toBeNull();
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

    const header = screen.getByTestId('header');
    expect(header).toHaveAttribute('role', 'presentation');
  });
});
