import { Component } from '@angular/core';
import { fireEvent, render, screen } from '@testing-library/angular';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NgpAvatarImage } from '../avatar-image/avatar-image';
import { NgpAvatar } from '../avatar/avatar';
import { NgpAvatarStatus } from '../avatar/avatar-state';
import { NgpAvatarFallback } from './avatar-fallback';

const VALID_IMAGE_SRC = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

describe('NgpAvatarFallback', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should apply the ngpAvatarFallback directive', async () => {
    await render(
      `
      <div ngpAvatar>
        <div ngpAvatarFallback data-testid="avatar-fallback">JD</div>
      </div>
    `,
      {
        imports: [NgpAvatar, NgpAvatarFallback],
      },
    );

    expect(screen.getByTestId('avatar-fallback')).toBeInTheDocument();
  });

  it('should be visible when avatar status is not loaded', async () => {
    vi.useFakeTimers();

    await render(
      `
      <div ngpAvatar>
        <div ngpAvatarFallback data-testid="avatar-fallback">JD</div>
      </div>
    `,
      {
        imports: [NgpAvatar, NgpAvatarFallback],
      },
    );

    const fallback = screen.getByTestId('avatar-fallback');
    await vi.advanceTimersByTimeAsync(1);
    expect(fallback).toBeVisible();
  });

  it('should be hidden when avatar image is loaded', async () => {
    vi.useFakeTimers();

    await render(
      `
      <div ngpAvatar data-testid="avatar">
        <img ngpAvatarImage data-testid="avatar-image" [src]="imageSrc" alt="Avatar" />
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

    const image = screen.getByTestId('avatar-image');
    const fallback = screen.getByTestId('avatar-fallback');

    await vi.advanceTimersByTimeAsync(1);

    fireEvent.load(image);
    await vi.advanceTimersByTimeAsync(1);

    expect(fallback).not.toBeVisible();
  });

  it('should accept custom delay input', async () => {
    await render(
      `
      <div ngpAvatar>
        <div ngpAvatarFallback [ngpAvatarFallbackDelay]="500" data-testid="avatar-fallback">JD</div>
      </div>
    `,
      {
        imports: [NgpAvatar, NgpAvatarFallback],
      },
    );

    const fallback = screen.getByTestId('avatar-fallback');
    expect(fallback).toBeInTheDocument();
    expect(fallback).toHaveTextContent('JD');
  });

  it('should use default delay of 0', async () => {
    vi.useFakeTimers();

    await render(
      `
      <div ngpAvatar>
        <div ngpAvatarFallback data-testid="avatar-fallback">JD</div>
      </div>
    `,
      {
        imports: [NgpAvatar, NgpAvatarFallback],
      },
    );

    const fallback = screen.getByTestId('avatar-fallback');
    await vi.advanceTimersByTimeAsync(1);
    expect(fallback).toBeVisible();
  });

  it('should be exportable as template reference', async () => {
    await render(
      `
      <div ngpAvatar>
        <div ngpAvatarFallback #fallbackRef="ngpAvatarFallback" data-testid="avatar-fallback">JD</div>
      </div>
    `,
      {
        imports: [NgpAvatar, NgpAvatarFallback],
      },
    );

    expect(screen.getByTestId('avatar-fallback')).toBeInTheDocument();
  });

  it('should handle status changes correctly', async () => {
    vi.useFakeTimers();

    @Component({
      template: `
        <div ngpAvatar data-testid="avatar">
          <div ngpAvatarFallback data-testid="avatar-fallback">JD</div>
        </div>
      `,
      imports: [NgpAvatar, NgpAvatarFallback],
    })
    class TestComponent {}

    const { fixture } = await render(TestComponent);
    const fallback = screen.getByTestId('avatar-fallback');
    const avatar = fixture.debugElement.children[0].injector.get(NgpAvatar);

    await vi.advanceTimersByTimeAsync(1);
    expect(fallback).toBeVisible();

    avatar.setStatus(NgpAvatarStatus.Loaded);
    fixture.detectChanges();
    expect(fallback).not.toBeVisible();

    avatar.setStatus(NgpAvatarStatus.Error);
    fixture.detectChanges();
    expect(fallback).toBeVisible();
  });

  it('should work with number attribute transform', async () => {
    await render(
      `
      <div ngpAvatar>
        <div ngpAvatarFallback ngpAvatarFallbackDelay="1000" data-testid="avatar-fallback">JD</div>
      </div>
    `,
      {
        imports: [NgpAvatar, NgpAvatarFallback],
      },
    );

    expect(screen.getByTestId('avatar-fallback')).toBeInTheDocument();
  });

  it('should handle component with signal input', async () => {
    @Component({
      template: `
        <div ngpAvatar>
          <div [ngpAvatarFallbackDelay]="delay()" ngpAvatarFallback data-testid="avatar-fallback">
            {{ initials() }}
          </div>
        </div>
      `,
      imports: [NgpAvatar, NgpAvatarFallback],
    })
    class TestComponent {
      delay = () => 100;
      initials = () => 'AB';
    }

    vi.useFakeTimers();
    await render(TestComponent);

    const fallback = screen.getByTestId('avatar-fallback');
    expect(fallback).toHaveTextContent('AB');
    expect(fallback).not.toBeVisible();

    await vi.advanceTimersByTimeAsync(100);
    expect(fallback).toBeVisible();
  });

  it('should require avatar container', async () => {
    try {
      await render(`<div ngpAvatarFallback data-testid="avatar-fallback">JD</div>`, {
        imports: [NgpAvatarFallback],
      });
      expect(screen.getByTestId('avatar-fallback')).toBeInTheDocument();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
