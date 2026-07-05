import { Component, input } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import { NgpAvatar, NgpAvatarFallback, NgpAvatarImage } from 'ng-primitives/avatar';
import { describe, expect, it } from 'vitest';

const VALID_IMAGE_SRC = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

/**
 * Inline fixture mirroring the reusable component at
 * apps/components/src/app/pages/reusable-components/avatar. Only conditionally renders the image
 * when a source is provided, always renders the fallback.
 */
@Component({
  selector: 'app-avatar',
  hostDirectives: [NgpAvatar],
  imports: [NgpAvatarImage, NgpAvatarFallback],
  template: `
    @if (image()) {
      <img [src]="image()" ngpAvatarImage alt="Profile Image" data-testid="image" />
    }
    <span ngpAvatarFallback data-testid="fallback">{{ fallback() }}</span>
  `,
})
class AvatarFixture {
  readonly image = input<string>();
  readonly fallback = input<string>();
}

describe('Avatar (reusable component) — standalone', () => {
  it('renders the fallback text', async () => {
    await render(`<app-avatar fallback="JD"></app-avatar>`, { imports: [AvatarFixture] });
    expect(screen.getByTestId('fallback')).toHaveTextContent('JD');
  });

  it('shows the fallback and reports error status when no image is provided', async () => {
    const { container } = await render(`<app-avatar fallback="JD"></app-avatar>`, {
      imports: [AvatarFixture],
    });
    const host = container.querySelector('app-avatar')!;

    // No image element is rendered.
    expect(screen.queryByTestId('image')).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('fallback')).toBeVisible());
    expect(host).toHaveAttribute('data-status');
  });

  it('renders the image with the provided source and alt text', async () => {
    await render(`<app-avatar [image]="src" fallback="JD"></app-avatar>`, {
      imports: [AvatarFixture],
      componentProperties: { src: VALID_IMAGE_SRC },
    });

    const image = await screen.findByTestId('image');
    expect(image).toHaveAttribute('src', VALID_IMAGE_SRC);
    expect(image).toHaveAttribute('alt', 'Profile Image');
  });

  it('hides the fallback and reports loaded once a valid image loads', async () => {
    const { container } = await render(`<app-avatar [image]="src" fallback="JD"></app-avatar>`, {
      imports: [AvatarFixture],
      componentProperties: { src: VALID_IMAGE_SRC },
    });
    const host = container.querySelector('app-avatar')!;

    await waitFor(() => expect(host).toHaveAttribute('data-status', 'loaded'));
    expect(screen.getByTestId('fallback')).not.toBeVisible();
  });
});
