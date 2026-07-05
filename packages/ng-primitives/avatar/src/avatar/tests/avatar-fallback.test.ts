import { By } from '@angular/platform-browser';
import { fireEvent, render, screen, waitFor } from '@testing-library/angular';
import {
  NgpAvatar,
  NgpAvatarFallback,
  NgpAvatarImage,
  NgpAvatarStatus,
} from 'ng-primitives/avatar';
import { describe, expect, it } from 'vitest';

const VALID_IMAGE_SRC = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

describe('NgpAvatarFallback', () => {
  describe('roles & attributes', () => {
    it('should apply the ngpAvatarFallback directive', async () => {
      await render(`<div ngpAvatar><div ngpAvatarFallback data-testid="fallback">JD</div></div>`, {
        imports: [NgpAvatar, NgpAvatarFallback],
      });
      expect(screen.getByTestId('fallback')).toHaveTextContent('JD');
    });

    it('should be exportable as a template reference', async () => {
      await render(
        `<div ngpAvatar><div #fallbackRef="ngpAvatarFallback" ngpAvatarFallback data-testid="fallback">JD</div></div>`,
        { imports: [NgpAvatar, NgpAvatarFallback] },
      );
      expect(screen.getByTestId('fallback')).toBeInTheDocument();
    });

    it('should accept the delay as a number attribute (string coercion)', async () => {
      await render(
        `<div ngpAvatar><div ngpAvatarFallback ngpAvatarFallbackDelay="1000" data-testid="fallback">JD</div></div>`,
        { imports: [NgpAvatar, NgpAvatarFallback] },
      );
      expect(screen.getByTestId('fallback')).toBeInTheDocument();
    });
  });

  describe('show/hide timing', () => {
    it('should be visible once the delay elapses when the avatar is not loaded', async () => {
      await render(`<div ngpAvatar><div ngpAvatarFallback data-testid="fallback">JD</div></div>`, {
        imports: [NgpAvatar, NgpAvatarFallback],
      });
      const fallback = screen.getByTestId('fallback');
      await waitFor(() => expect(fallback).toBeVisible());
    });

    it('should stay hidden until a custom delay elapses', async () => {
      const { fixture } = await render(
        `<div ngpAvatar><div ngpAvatarFallback [ngpAvatarFallbackDelay]="150" data-testid="fallback">JD</div></div>`,
        { imports: [NgpAvatar, NgpAvatarFallback] },
      );
      const fallback = screen.getByTestId('fallback');

      await fixture.whenStable();
      // Before the delay elapses the fallback is display:none.
      expect(fallback).not.toBeVisible();

      // After the delay it becomes visible.
      await waitFor(() => expect(fallback).toBeVisible());
    });

    it('should be hidden once the image reports loaded', async () => {
      const { fixture } = await render(
        `<div ngpAvatar><img ngpAvatarImage data-testid="image" [src]="src" alt="Avatar" /><div ngpAvatarFallback data-testid="fallback">JD</div></div>`,
        {
          imports: [NgpAvatar, NgpAvatarImage, NgpAvatarFallback],
          componentProperties: { src: VALID_IMAGE_SRC },
        },
      );
      const fallback = screen.getByTestId('fallback');

      fireEvent.load(screen.getByTestId('image'));
      await fixture.whenStable();

      await waitFor(() => expect(fallback).not.toBeVisible());
    });

    it('should remain visible when the image reports an error', async () => {
      const { fixture } = await render(
        `<div ngpAvatar><img ngpAvatarImage data-testid="image" src="invalid.jpg" alt="Avatar" /><div ngpAvatarFallback data-testid="fallback">JD</div></div>`,
        { imports: [NgpAvatar, NgpAvatarImage, NgpAvatarFallback] },
      );
      const fallback = screen.getByTestId('fallback');

      fireEvent.error(screen.getByTestId('image'));
      await fixture.whenStable();

      await waitFor(() => expect(fallback).toBeVisible());
    });

    it('should follow avatar status changes: hide on loaded, show again on error', async () => {
      const { fixture } = await render(
        `<div ngpAvatar><div ngpAvatarFallback data-testid="fallback">JD</div></div>`,
        { imports: [NgpAvatar, NgpAvatarFallback] },
      );
      const fallback = screen.getByTestId('fallback');
      const avatar = fixture.debugElement.query(By.directive(NgpAvatar)).injector.get(NgpAvatar);

      await waitFor(() => expect(fallback).toBeVisible());

      avatar.setStatus(NgpAvatarStatus.Loaded);
      await fixture.whenStable();
      expect(fallback).not.toBeVisible();

      avatar.setStatus(NgpAvatarStatus.Error);
      await fixture.whenStable();
      expect(fallback).toBeVisible();
    });
  });
});
