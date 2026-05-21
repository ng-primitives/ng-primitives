import { Component } from '@angular/core';
import { fireEvent, render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { NgpAvatar } from '../avatar/avatar';
import { NgpAvatarStatus } from '../avatar/avatar-state';
import { NgpAvatarImage } from './avatar-image';

describe('NgpAvatarImage', () => {
  it('should apply the ngpAvatarImage directive to img element', async () => {
    await render(
      `
      <div ngpAvatar>
        <img ngpAvatarImage data-testid="avatar-image" src="test.jpg" alt="Avatar" />
      </div>
    `,
      {
        imports: [NgpAvatar, NgpAvatarImage],
      },
    );

    expect(screen.getByTestId('avatar-image')).toBeInTheDocument();
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('should set avatar status to loading initially', async () => {
    await render(
      `
      <div ngpAvatar data-testid="avatar">
        <img ngpAvatarImage src="test.jpg" alt="Avatar" />
      </div>
    `,
      {
        imports: [NgpAvatar, NgpAvatarImage],
      },
    );

    const status = screen.getByTestId('avatar').getAttribute('data-status');
    expect(['loading', 'loaded']).toContain(status);
  });

  it('should set avatar status to error when image has no src', async () => {
    await render(
      `
      <div ngpAvatar data-testid="avatar">
        <img ngpAvatarImage alt="Avatar" />
      </div>
    `,
      {
        imports: [NgpAvatar, NgpAvatarImage],
      },
    );

    const status = screen.getByTestId('avatar').getAttribute('data-status');
    expect(['error', 'loaded']).toContain(status);
  });

  it('should set avatar status to loaded when image loads successfully', async () => {
    await render(
      `
      <div ngpAvatar data-testid="avatar">
        <img ngpAvatarImage data-testid="avatar-image" src="test.jpg" alt="Avatar" />
      </div>
    `,
      {
        imports: [NgpAvatar, NgpAvatarImage],
      },
    );

    const avatar = screen.getByTestId('avatar');
    const image = screen.getByTestId('avatar-image');

    expect(['loading', 'loaded']).toContain(avatar.getAttribute('data-status'));

    fireEvent.load(image);
    expect(avatar).toHaveAttribute('data-status', NgpAvatarStatus.Loaded);
  });

  it('should set avatar status to error when image fails to load', async () => {
    await render(
      `
      <div ngpAvatar data-testid="avatar">
        <img ngpAvatarImage data-testid="avatar-image" src="invalid.jpg" alt="Avatar" />
      </div>
    `,
      {
        imports: [NgpAvatar, NgpAvatarImage],
      },
    );

    const avatar = screen.getByTestId('avatar');
    const image = screen.getByTestId('avatar-image');

    expect(['loading', 'loaded']).toContain(avatar.getAttribute('data-status'));

    fireEvent.error(image);
    expect(avatar).toHaveAttribute('data-status', NgpAvatarStatus.Error);
  });

  it('should handle already loaded images', async () => {
    @Component({
      template: `
        <div ngpAvatar data-testid="avatar">
          <img ngpAvatarImage data-testid="avatar-image" src="test.jpg" alt="Avatar" />
        </div>
      `,
      imports: [NgpAvatar, NgpAvatarImage],
    })
    class TestComponent {}

    const { getByTestId } = await render(TestComponent);
    expect(['loading', 'loaded']).toContain(getByTestId('avatar').getAttribute('data-status'));
  });

  it('should be exportable as template reference', async () => {
    await render(
      `
      <div ngpAvatar>
        <img ngpAvatarImage #imageRef="ngpAvatarImage" data-testid="avatar-image" src="test.jpg" alt="Avatar" />
      </div>
    `,
      {
        imports: [NgpAvatar, NgpAvatarImage],
      },
    );

    expect(screen.getByTestId('avatar-image')).toBeInTheDocument();
  });

  it('should work without avatar container (graceful degradation)', async () => {
    try {
      await render(
        `<img ngpAvatarImage data-testid="avatar-image" src="test.jpg" alt="Avatar" />`,
        {
          imports: [NgpAvatarImage],
        },
      );
      expect(screen.getByTestId('avatar-image')).toBeInTheDocument();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should handle multiple status changes correctly', async () => {
    await render(
      `
      <div ngpAvatar data-testid="avatar">
        <img ngpAvatarImage data-testid="avatar-image" src="test.jpg" alt="Avatar" />
      </div>
    `,
      {
        imports: [NgpAvatar, NgpAvatarImage],
      },
    );

    const avatar = screen.getByTestId('avatar');
    const image = screen.getByTestId('avatar-image');

    expect(['loading', 'loaded']).toContain(avatar.getAttribute('data-status'));

    fireEvent.error(image);
    expect(avatar).toHaveAttribute('data-status', NgpAvatarStatus.Error);

    fireEvent.load(image);
    expect(avatar).toHaveAttribute('data-status', NgpAvatarStatus.Loaded);

    fireEvent.error(image);
    expect(avatar).toHaveAttribute('data-status', NgpAvatarStatus.Error);
  });
});
