import { render } from '@testing-library/angular';
import {
  NgpBreadcrumbItem,
  NgpBreadcrumbLink,
  NgpBreadcrumbList,
  NgpBreadcrumbPage,
  NgpBreadcrumbSeparator,
  NgpBreadcrumbs,
} from 'ng-primitives/breadcrumbs';

describe('Breadcrumb primitives', () => {
  it('should render a navigation landmark', async () => {
    const { getByRole } = await render(`<nav ngpBreadcrumbs></nav>`, {
      imports: [NgpBreadcrumbs],
    });

    expect(getByRole('navigation')).toBeTruthy();
  });

  it('should allow consumers to apply their own aria-label', async () => {
    const { getByRole } = await render(`<nav aria-label="Docs" ngpBreadcrumbs></nav>`, {
      imports: [NgpBreadcrumbs],
    });

    expect(getByRole('navigation')).toHaveAttribute('aria-label', 'Docs');
  });

  it('should mark page content as current', async () => {
    const { getByText } = await render(`<span ngpBreadcrumbPage>Docs</span>`, {
      imports: [NgpBreadcrumbPage],
    });

    const page = getByText('Docs');
    expect(page).toHaveAttribute('aria-current', 'page');
  });

  it('should apply list semantics to breadcrumb groups', async () => {
    const { getByRole, getAllByRole } = await render(
      `
        <nav ngpBreadcrumbs>
          <ol ngpBreadcrumbList>
            <li ngpBreadcrumbItem>
              <a href="/" ngpBreadcrumbLink>Home</a>
            </li>
            <li ngpBreadcrumbItem>
              <span ngpBreadcrumbPage>Docs</span>
            </li>
          </ol>
        </nav>
      `,
      {
        imports: [
          NgpBreadcrumbs,
          NgpBreadcrumbList,
          NgpBreadcrumbItem,
          NgpBreadcrumbLink,
          NgpBreadcrumbPage,
        ],
      },
    );

    expect(getByRole('list')).toBeTruthy();
    expect(getAllByRole('listitem')).toHaveLength(2);
  });

  it('should hide separators from assistive tech', async () => {
    const { getByText } = await render(`<span ngpBreadcrumbSeparator>/</span>`, {
      imports: [NgpBreadcrumbSeparator],
    });

    const separator = getByText('/');
    expect(separator).toHaveAttribute('aria-hidden', 'true');
    expect(separator).toHaveAttribute('role', 'presentation');
  });
});
