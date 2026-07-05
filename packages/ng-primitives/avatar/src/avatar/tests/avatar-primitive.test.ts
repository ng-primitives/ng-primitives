import { By } from '@angular/platform-browser';
import { render, screen } from '@testing-library/angular';
import { NgpAvatar, NgpAvatarStatus } from 'ng-primitives/avatar';
import { describe, expect, it } from 'vitest';

describe('NgpAvatar', () => {
  describe('roles & attributes', () => {
    it('should apply the ngpAvatar directive', async () => {
      await render(`<div ngpAvatar data-testid="avatar"></div>`, { imports: [NgpAvatar] });
      expect(screen.getByTestId('avatar')).toBeInTheDocument();
    });

    it('should initially have idle status', async () => {
      await render(`<div ngpAvatar data-testid="avatar"></div>`, { imports: [NgpAvatar] });
      expect(screen.getByTestId('avatar')).toHaveAttribute('data-status', NgpAvatarStatus.Idle);
    });

    it('should be exportable as a template reference', async () => {
      await render(`<div #avatarRef="ngpAvatar" ngpAvatar data-testid="avatar"></div>`, {
        imports: [NgpAvatar],
      });
      expect(screen.getByTestId('avatar')).toBeInTheDocument();
    });

    it('should render projected children', async () => {
      await render(`<div ngpAvatar><div data-testid="child"></div></div>`, {
        imports: [NgpAvatar],
      });
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });
  });

  describe('status', () => {
    it('should reflect status changes to the data-status attribute', async () => {
      const { fixture } = await render(`<div ngpAvatar data-testid="avatar"></div>`, {
        imports: [NgpAvatar],
      });
      const avatar = screen.getByTestId('avatar');
      const directive = fixture.debugElement.query(By.directive(NgpAvatar)).injector.get(NgpAvatar);

      expect(avatar).toHaveAttribute('data-status', NgpAvatarStatus.Idle);

      directive.setStatus(NgpAvatarStatus.Loading);
      await fixture.whenStable();
      expect(avatar).toHaveAttribute('data-status', NgpAvatarStatus.Loading);

      directive.setStatus(NgpAvatarStatus.Loaded);
      await fixture.whenStable();
      expect(avatar).toHaveAttribute('data-status', NgpAvatarStatus.Loaded);

      directive.setStatus(NgpAvatarStatus.Error);
      await fixture.whenStable();
      expect(avatar).toHaveAttribute('data-status', NgpAvatarStatus.Error);
    });
  });
});
