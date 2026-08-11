import { fireEvent, render, screen, waitFor } from '@testing-library/angular';
import { NgpAvatar, NgpAvatarImage, NgpAvatarStatus } from 'ng-primitives/avatar';
import { describe, expect, it } from 'vitest';

// A valid 1x1 transparent GIF that loads synchronously in the browser.
const VALID_IMAGE_SRC = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

describe('NgpAvatarImage', () => {
  describe('roles & attributes', () => {
    it('should apply the ngpAvatarImage directive to an img element', async () => {
      await render(
        `<div ngpAvatar><img ngpAvatarImage data-testid="avatar-image" [src]="src" alt="Avatar" /></div>`,
        { imports: [NgpAvatar, NgpAvatarImage], componentProperties: { src: VALID_IMAGE_SRC } },
      );

      expect(screen.getByTestId('avatar-image')).toBeInTheDocument();
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('should preserve the alt text on the image', async () => {
      await render(`<div ngpAvatar><img ngpAvatarImage [src]="src" alt="User Avatar" /></div>`, {
        imports: [NgpAvatar, NgpAvatarImage],
        componentProperties: { src: VALID_IMAGE_SRC },
      });

      expect(screen.getByRole('img')).toHaveAttribute('alt', 'User Avatar');
    });

    it('should be exportable as a template reference', async () => {
      await render(
        `<div ngpAvatar><img #imageRef="ngpAvatarImage" ngpAvatarImage data-testid="avatar-image" [src]="src" alt="Avatar" /></div>`,
        { imports: [NgpAvatar, NgpAvatarImage], componentProperties: { src: VALID_IMAGE_SRC } },
      );

      expect(screen.getByTestId('avatar-image')).toBeInTheDocument();
    });
  });

  describe('image load/error state', () => {
    it('should report loaded to the avatar when the image loads successfully', async () => {
      const { fixture } = await render(
        `<div ngpAvatar data-testid="avatar"><img ngpAvatarImage data-testid="avatar-image" [src]="src" alt="Avatar" /></div>`,
        { imports: [NgpAvatar, NgpAvatarImage], componentProperties: { src: VALID_IMAGE_SRC } },
      );

      const avatar = screen.getByTestId('avatar');
      const image = screen.getByTestId('avatar-image');

      fireEvent.load(image);
      await fixture.whenStable();
      expect(avatar).toHaveAttribute('data-status', NgpAvatarStatus.Loaded);
    });

    it('should report error to the avatar when the image fails to load', async () => {
      const { fixture } = await render(
        `<div ngpAvatar data-testid="avatar"><img ngpAvatarImage data-testid="avatar-image" src="invalid.jpg" alt="Avatar" /></div>`,
        { imports: [NgpAvatar, NgpAvatarImage] },
      );

      const avatar = screen.getByTestId('avatar');
      const image = screen.getByTestId('avatar-image');

      fireEvent.error(image);
      await fixture.whenStable();
      expect(avatar).toHaveAttribute('data-status', NgpAvatarStatus.Error);
    });

    it('should report error to the avatar when the image has no src', async () => {
      const { fixture } = await render(
        `<div ngpAvatar data-testid="avatar"><img ngpAvatarImage alt="Avatar" /></div>`,
        { imports: [NgpAvatar, NgpAvatarImage] },
      );

      await fixture.whenStable();
      // An <img> with no src is `complete` in the browser but has naturalWidth === 0, so it
      // must be reported as an error rather than loaded.
      expect(screen.getByTestId('avatar')).toHaveAttribute('data-status', NgpAvatarStatus.Error);
    });

    it('should transition between error and loaded across repeated events', async () => {
      const { fixture } = await render(
        `<div ngpAvatar data-testid="avatar"><img ngpAvatarImage data-testid="avatar-image" [src]="src" alt="Avatar" /></div>`,
        { imports: [NgpAvatar, NgpAvatarImage], componentProperties: { src: VALID_IMAGE_SRC } },
      );

      const avatar = screen.getByTestId('avatar');
      const image = screen.getByTestId('avatar-image');

      fireEvent.error(image);
      await fixture.whenStable();
      expect(avatar).toHaveAttribute('data-status', NgpAvatarStatus.Error);

      fireEvent.load(image);
      await fixture.whenStable();
      expect(avatar).toHaveAttribute('data-status', NgpAvatarStatus.Loaded);

      fireEvent.error(image);
      await fixture.whenStable();
      expect(avatar).toHaveAttribute('data-status', NgpAvatarStatus.Error);
    });

    it('should report loaded for an image that is already complete at construction', async () => {
      await render(
        `<div ngpAvatar data-testid="avatar"><img ngpAvatarImage [src]="src" alt="Avatar" /></div>`,
        { imports: [NgpAvatar, NgpAvatarImage], componentProperties: { src: VALID_IMAGE_SRC } },
      );

      const avatar = screen.getByTestId('avatar');
      await waitFor(() => expect(avatar).toHaveAttribute('data-status', NgpAvatarStatus.Loaded));
    });
  });
});
