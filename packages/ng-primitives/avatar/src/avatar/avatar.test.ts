import { Component } from '@angular/core';
import { fireEvent, render, screen } from '@testing-library/angular';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NgpAvatarFallback } from '../avatar-fallback/avatar-fallback';
import { NgpAvatarImage } from '../avatar-image/avatar-image';
import { NgpAvatar } from './avatar';
import { NgpAvatarStatus } from './avatar-state';

const VALID_IMAGE_SRC = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

describe('NgpAvatar', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

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

    expect(screen.getByTestId('avatar')).toHaveAttribute('data-status', NgpAvatarStatus.Idle);
  });

  it('should update status when setStatus is called', async () => {
    @Component({
      template: `
        <div ngpAvatar data-testid="avatar"></div>
      `,
      imports: [NgpAvatar],
    })
    class TestComponent {}

    const { fixture } = await render(TestComponent);
    const avatar = screen.getByTestId('avatar');
    const avatarRef = fixture.debugElement.children[0].injector.get(NgpAvatar);

    expect(avatar).toHaveAttribute('data-status', NgpAvatarStatus.Idle);

    avatarRef.setStatus(NgpAvatarStatus.Loading);
    fixture.detectChanges();
    expect(avatar).toHaveAttribute('data-status', NgpAvatarStatus.Loading);

    avatarRef.setStatus(NgpAvatarStatus.Loaded);
    fixture.detectChanges();
    expect(avatar).toHaveAttribute('data-status', NgpAvatarStatus.Loaded);

    avatarRef.setStatus(NgpAvatarStatus.Error);
    fixture.detectChanges();
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
    expect(screen.getByTestId('child')).toBeInTheDocument();
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

    it('should show fallback when image fails to load', async () => {
      vi.useFakeTimers();

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

      await vi.advanceTimersByTimeAsync(1);

      expect([NgpAvatarStatus.Loading, NgpAvatarStatus.Error]).toContain(
        avatar.getAttribute('data-status'),
      );
      expect(fallback).toBeVisible();

      fireEvent.error(image);
      await vi.advanceTimersByTimeAsync(1);

      expect(avatar).toHaveAttribute('data-status', NgpAvatarStatus.Error);
      expect(fallback).toBeVisible();
    });

    it('should hide fallback when image loads successfully', async () => {
      vi.useFakeTimers();

      await render(
        `
        <div ngpAvatar data-testid="avatar">
          <img ngpAvatarImage data-testid="avatar-image" [src]="imageSrc" alt="User Avatar" />
          <div ngpAvatarFallback data-testid="avatar-fallback">JD</div>
        </div>
      `,
        {
          imports: [NgpAvatar, NgpAvatarImage, NgpAvatarFallback],
          componentProperties: {
            imageSrc: VALID_IMAGE_SRC,
          },
        },
      );

      const avatar = screen.getByTestId('avatar');
      const image = screen.getByTestId('avatar-image');
      const fallback = screen.getByTestId('avatar-fallback');

      await vi.advanceTimersByTimeAsync(1);

      expect([NgpAvatarStatus.Loading, NgpAvatarStatus.Loaded]).toContain(
        avatar.getAttribute('data-status'),
      );

      fireEvent.load(image);
      await vi.advanceTimersByTimeAsync(1);

      expect(avatar).toHaveAttribute('data-status', NgpAvatarStatus.Loaded);
      expect(fallback).not.toBeVisible();
    });

    it('should handle real-world avatar component pattern', async () => {
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

      vi.useFakeTimers();
      const container = await render(AvatarComponent);
      const avatar = screen.getByTestId('avatar');
      const image = screen.getByTestId('avatar-image') as HTMLImageElement;
      const fallback = screen.getByTestId('avatar-fallback');

      expect(image).toHaveAttribute('src', 'https://example.com/user-avatar.jpg');
      expect(image).toHaveAttribute('alt', 'John Doe Avatar');
      expect(fallback).toHaveTextContent('JD');
      expect(avatar).toHaveAttribute('data-status', NgpAvatarStatus.Loaded);
      expect(fallback).not.toBeVisible();

      await container.rerender({
        componentProperties: {
          imageUrl: 'https://example.com/new-avatar.jpg',
          initials: 'XY',
        },
      });

      expect(image).toHaveAttribute('src', 'https://example.com/new-avatar.jpg');
      expect(fallback).toHaveTextContent('XY');
    });
  });
});
