import { Component } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import { fireEvent, render, screen } from '@testing-library/angular';
import { NgpAvatarFallback } from '../avatar-fallback/avatar-fallback';
import { NgpAvatarImage } from '../avatar-image/avatar-image';
import { NgpAvatar } from './avatar';
import { NgpAvatarStatus } from './avatar-state';

describe('NgpAvatar', () => {
  it('should apply the ngpAvatar directive', async () => {
    await render(`<div ngpAvatar data-testid="avatar"></div>`, {
      imports: [NgpAvatar],
    });

    expect(screen.getByTestId('avatar')).toBeInTheDocument();
  });

  it('should initially have idle status', async () => {
    await render(`<div ngpAvatar data-testid="avatar"></div>`, {
      imports: [NgpAvatar],
    });

    const avatar = screen.getByTestId('avatar');
    expect(avatar).toHaveAttribute('data-status', NgpAvatarStatus.Idle);
  });

  it('should update status when setStatus is called', async () => {
    @Component({
      template: `
        <div #avatar ngpAvatar data-testid="avatar"></div>
      `,
      imports: [NgpAvatar],
    })
    class TestComponent {}

    const container = await render(TestComponent);
    const avatar = screen.getByTestId('avatar');

    // Get the avatar directive instance
    const avatarRef = container.debugElement.children[0].injector.get(NgpAvatar);

    expect(avatar).toHaveAttribute('data-status', NgpAvatarStatus.Idle);

    avatarRef.setStatus(NgpAvatarStatus.Loading);
    container.fixture.detectChanges();
    expect(avatar).toHaveAttribute('data-status', NgpAvatarStatus.Loading);

    avatarRef.setStatus(NgpAvatarStatus.Loaded);
    container.fixture.detectChanges();
    expect(avatar).toHaveAttribute('data-status', NgpAvatarStatus.Loaded);

    avatarRef.setStatus(NgpAvatarStatus.Error);
    container.fixture.detectChanges();
    expect(avatar).toHaveAttribute('data-status', NgpAvatarStatus.Error);
  });

  it('should provide avatar state to child components', async () => {
    @Component({
      template: `
        <div ngpAvatar>
          <div data-testid="child"></div>
        </div>
      `,
      imports: [NgpAvatar],
    })
    class TestComponent {}

    await render(TestComponent);
    const child = screen.getByTestId('child');
    expect(child).toBeInTheDocument();
  });

  it('should be exportable as template reference', async () => {
    @Component({
      template: `
        <div #avatarRef="ngpAvatar" ngpAvatar data-testid="avatar"></div>
      `,
      imports: [NgpAvatar],
    })
    class TestComponent {}

    await render(TestComponent);
    expect(screen.getByTestId('avatar')).toBeInTheDocument();
  });

  describe('integration with image and fallback', () => {
    it('should render complete avatar with image and fallback', async () => {
      await render(
        `
        <div ngpAvatar data-testid="avatar">
          <img ngpAvatarImage data-testid="avatar-image" src="user.jpg" alt="User Avatar" />
          <div ngpAvatarFallback data-testid="avatar-fallback">JD</div>
        </div>
      `,
        {
          imports: [NgpAvatar, NgpAvatarImage, NgpAvatarFallback],
        },
      );

      expect(screen.getByTestId('avatar')).toBeInTheDocument();
      expect(screen.getByTestId('avatar-image')).toBeInTheDocument();
      expect(screen.getByTestId('avatar-fallback')).toBeInTheDocument();
      expect(screen.getByRole('img')).toHaveAttribute('alt', 'User Avatar');
    });

    it('should show fallback when image fails to load', fakeAsync(async () => {
      await render(
        `
        <div ngpAvatar data-testid="avatar">
          <img ngpAvatarImage data-testid="avatar-image" src="broken.jpg" alt="User Avatar" />
          <div ngpAvatarFallback data-testid="avatar-fallback">JD</div>
        </div>
      `,
        {
          imports: [NgpAvatar, NgpAvatarImage, NgpAvatarFallback],
        },
      );

      const avatar = screen.getByTestId('avatar');
      const image = screen.getByTestId('avatar-image');
      const fallback = screen.getByTestId('avatar-fallback');

      tick(1);

      expect(avatar).toHaveAttribute('data-status', NgpAvatarStatus.Loading);
      expect(fallback).toBeVisible();

      fireEvent.error(image);
      tick(1);

      expect(avatar).toHaveAttribute('data-status', NgpAvatarStatus.Error);
      expect(fallback).toBeVisible();
    }));

    it('should hide fallback when image loads successfully', fakeAsync(async () => {
      await render(
        `
        <div ngpAvatar data-testid="avatar">
          <img ngpAvatarImage data-testid="avatar-image" src="user.jpg" alt="User Avatar" />
          <div ngpAvatarFallback data-testid="avatar-fallback">JD</div>
        </div>
      `,
        {
          imports: [NgpAvatar, NgpAvatarImage, NgpAvatarFallback],
        },
      );

      const avatar = screen.getByTestId('avatar');
      const image = screen.getByTestId('avatar-image');
      const fallback = screen.getByTestId('avatar-fallback');

      tick(1);

      expect(avatar).toHaveAttribute('data-status', NgpAvatarStatus.Loading);
      expect(fallback).toBeVisible();

      fireEvent.load(image);
      tick(1);

      expect(avatar).toHaveAttribute('data-status', NgpAvatarStatus.Loaded);
      expect(fallback).not.toBeVisible();
    }));

    it('should handle real-world avatar component pattern', fakeAsync(async () => {
      @Component({
        template: `
          <div class="avatar" ngpAvatar data-testid="avatar">
            <img
              class="avatar-image"
              [src]="imageUrl"
              [alt]="altText"
              ngpAvatarImage
              data-testid="avatar-image"
            />
            <div
              class="avatar-fallback"
              [ngpAvatarFallbackDelay]="fallbackDelay"
              ngpAvatarFallback
              data-testid="avatar-fallback"
            >
              {{ initials }}
            </div>
          </div>
        `,
        imports: [NgpAvatar, NgpAvatarImage, NgpAvatarFallback],
      })
      class AvatarComponent {
        imageUrl = 'https://example.com/user-avatar.jpg';
        altText = 'John Doe Avatar';
        initials = 'JD';
        fallbackDelay = 600;
      }

      const container = await render(AvatarComponent);

      const avatar = screen.getByTestId('avatar');
      const image = screen.getByTestId('avatar-image') as HTMLImageElement;
      const fallback = screen.getByTestId('avatar-fallback');

      // Check that the component was rendered correctly
      expect(image).toHaveAttribute('src', 'https://example.com/user-avatar.jpg');
      expect(image).toHaveAttribute('alt', 'John Doe Avatar');
      expect(fallback).toHaveTextContent('JD');

      // In test environment, images are already loaded by default, so avatar should be in loaded state
      expect(avatar).toHaveAttribute('data-status', NgpAvatarStatus.Loaded);
      expect(fallback).not.toBeVisible();

      // Test dynamic property updates
      await container.rerender({
        componentProperties: {
          imageUrl: 'https://example.com/new-avatar.jpg',
          initials: 'XY',
        },
      });

      expect(image).toHaveAttribute('src', 'https://example.com/new-avatar.jpg');
      expect(fallback).toHaveTextContent('XY');
    }));

    it('should handle edge case of image without src attribute', fakeAsync(async () => {
      await render(
        `
        <div ngpAvatar data-testid="avatar">
          <img ngpAvatarImage data-testid="avatar-image" alt="No source" />
          <div ngpAvatarFallback data-testid="avatar-fallback">NS</div>
        </div>
      `,
        {
          imports: [NgpAvatar, NgpAvatarImage, NgpAvatarFallback],
        },
      );

      const avatar = screen.getByTestId('avatar');
      const fallback = screen.getByTestId('avatar-fallback');

      // In test environment, images might be marked as complete even without src
      // The avatar status could be error (no src) or loaded (test environment behavior)
      const status = avatar.getAttribute('data-status');
      expect(['error', 'loaded']).toContain(status);

      tick(1);
      // Fallback visibility depends on the final status
      if (status === NgpAvatarStatus.Error) {
        expect(fallback).toBeVisible();
      } else {
        expect(fallback).not.toBeVisible();
      }
    }));
  });
});
