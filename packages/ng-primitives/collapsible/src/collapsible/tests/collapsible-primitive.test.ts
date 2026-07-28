import { fireEvent, render, waitFor } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import {
  NgpCollapsible,
  NgpCollapsibleContent,
  NgpCollapsibleTrigger,
} from 'ng-primitives/collapsible';
import { describe, expect, it, vi } from 'vitest';

const imports = [NgpCollapsible, NgpCollapsibleTrigger, NgpCollapsibleContent];

// Note: `ngpCollapsibleOpen` is intentionally NOT bound here. Binding it - even
// to `undefined` - runs the `booleanAttribute` transform which coerces to
// `false`, forcing controlled mode. Uncontrolled usage means omitting the
// attribute; controlled tests bind it explicitly with their own template.
function renderTemplate(componentProperties?: { [alias: string]: unknown }) {
  return render(
    `
    <div data-testid="root"
         ngpCollapsible
         [ngpCollapsibleDefaultOpen]="defaultOpen"
         [ngpCollapsibleDisabled]="disabled"
         [ngpCollapsibleOrientation]="orientation"
         (ngpCollapsibleOpenChange)="openChange($event)">
      <button data-testid="trigger" ngpCollapsibleTrigger>Toggle</button>
      <div data-testid="content" ngpCollapsibleContent>Content</div>
    </div>
    `,
    {
      imports,
      componentProperties: {
        defaultOpen: false,
        disabled: false,
        orientation: 'vertical',
        openChange: vi.fn(),
        ...componentProperties,
      },
    },
  );
}

describe('NgpCollapsible', () => {
  it('should be closed by default', async () => {
    const fixture = await renderTemplate();
    expect(fixture.getByTestId('root')).not.toHaveAttribute('data-open');
    expect(fixture.getByTestId('root')).toHaveAttribute('data-closed');
    expect(fixture.getByTestId('trigger')).toHaveAttribute('aria-expanded', 'false');
  });

  it('should be open when defaultOpen is set (uncontrolled)', async () => {
    const fixture = await renderTemplate({ defaultOpen: true });
    expect(fixture.getByTestId('root')).toHaveAttribute('data-open');
    expect(fixture.getByTestId('trigger')).toHaveAttribute('aria-expanded', 'true');
  });

  it('should stay uncontrolled when the open binding is explicitly undefined', async () => {
    const fixture = await render(
      `<div data-testid="root" ngpCollapsible [ngpCollapsibleOpen]="open" ngpCollapsibleDefaultOpen>
        <button data-testid="trigger" ngpCollapsibleTrigger>Toggle</button>
        <div ngpCollapsibleContent>Content</div>
      </div>`,
      { imports, componentProperties: { open: undefined } },
    );
    // an explicit `undefined` must not coerce to `false` — it stays uncontrolled at the default
    expect(fixture.getByTestId('root')).toHaveAttribute('data-open');

    fireEvent.click(fixture.getByTestId('trigger'));
    expect(fixture.getByTestId('root')).not.toHaveAttribute('data-open');
  });

  describe('trigger', () => {
    it('should set type="button" on a button host', async () => {
      const fixture = await renderTemplate();
      expect(fixture.getByTestId('trigger')).toHaveAttribute('type', 'button');
    });

    it('should not set type on a non-button host', async () => {
      const fixture = await render(
        `<div ngpCollapsible>
          <div data-testid="trigger" ngpCollapsibleTrigger>Toggle</div>
          <div ngpCollapsibleContent>Content</div>
        </div>`,
        { imports },
      );
      expect(fixture.getByTestId('trigger')).not.toHaveAttribute('type');
    });

    it('should set aria-controls to the content id', async () => {
      const fixture = await renderTemplate();
      expect(fixture.getByTestId('trigger').getAttribute('aria-controls')).toBe(
        fixture.getByTestId('content').getAttribute('id'),
      );
    });

    it('should reflect open state via aria-expanded', async () => {
      const fixture = await renderTemplate({ defaultOpen: true });
      expect(fixture.getByTestId('trigger')).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('toggling', () => {
    it('should open and close on click (uncontrolled)', async () => {
      const openChange = vi.fn();
      const fixture = await renderTemplate({ openChange });
      const trigger = fixture.getByTestId('trigger');

      fireEvent.click(trigger);
      expect(fixture.getByTestId('root')).toHaveAttribute('data-open');
      expect(openChange).toHaveBeenCalledWith(true);

      fireEvent.click(trigger);
      expect(fixture.getByTestId('root')).not.toHaveAttribute('data-open');
      expect(openChange).toHaveBeenLastCalledWith(false);
    });

    it('should toggle when Enter is pressed on the focused trigger', async () => {
      const openChange = vi.fn();
      const fixture = await renderTemplate({ openChange });

      fixture.getByTestId('trigger').focus();
      await userEvent.keyboard('{Enter}');

      expect(fixture.getByTestId('root')).toHaveAttribute('data-open');
      expect(openChange).toHaveBeenCalledWith(true);
    });

    it('should toggle when Space is pressed on the focused trigger', async () => {
      const openChange = vi.fn();
      const fixture = await renderTemplate({ openChange });

      fixture.getByTestId('trigger').focus();
      await userEvent.keyboard(' ');

      expect(fixture.getByTestId('root')).toHaveAttribute('data-open');
      expect(openChange).toHaveBeenCalledWith(true);
    });
  });

  describe('disabled', () => {
    it('should not toggle on click when disabled', async () => {
      const openChange = vi.fn();
      const fixture = await renderTemplate({ disabled: true, openChange });

      fireEvent.click(fixture.getByTestId('trigger'));

      expect(fixture.getByTestId('root')).not.toHaveAttribute('data-open');
      expect(openChange).not.toHaveBeenCalled();
    });

    it('should set data-disabled on the root, trigger and content', async () => {
      const fixture = await renderTemplate({ disabled: true });
      expect(fixture.getByTestId('root')).toHaveAttribute('data-disabled');
      expect(fixture.getByTestId('trigger')).toHaveAttribute('data-disabled');
      expect(fixture.getByTestId('content')).toHaveAttribute('data-disabled');
    });
  });

  describe('controlled', () => {
    it('should not change on click when open is controlled', async () => {
      const openChange = vi.fn();
      const fixture = await render(
        `<div data-testid="root" ngpCollapsible [ngpCollapsibleOpen]="open"
              (ngpCollapsibleOpenChange)="openChange($event)">
          <button data-testid="trigger" ngpCollapsibleTrigger>Toggle</button>
          <div ngpCollapsibleContent>Content</div>
        </div>`,
        { imports, componentProperties: { open: false, openChange } },
      );

      fireEvent.click(fixture.getByTestId('trigger'));

      // Controlled: the state does not change until the parent updates `open`,
      // but the change is still reported.
      expect(fixture.getByTestId('root')).not.toHaveAttribute('data-open');
      expect(openChange).toHaveBeenCalledWith(true);
    });

    it('should round-trip a two-way [(ngpCollapsibleOpen)] binding', async () => {
      const fixture = await render(
        `<div data-testid="root" ngpCollapsible [(ngpCollapsibleOpen)]="open">
          <button data-testid="trigger" ngpCollapsibleTrigger>Toggle</button>
          <div ngpCollapsibleContent>Content</div>
        </div>`,
        { imports, componentProperties: { open: false } },
      );
      const trigger = fixture.getByTestId('trigger');

      fireEvent.click(trigger);
      fixture.detectChanges();
      expect(fixture.fixture.componentInstance.open).toBe(true);
      expect(fixture.getByTestId('root')).toHaveAttribute('data-open');

      fireEvent.click(trigger);
      fixture.detectChanges();
      expect(fixture.fixture.componentInstance.open).toBe(false);
      expect(fixture.getByTestId('root')).not.toHaveAttribute('data-open');
    });
  });

  describe('data attributes', () => {
    it('should set data-open / data-closed on all parts', async () => {
      const fixture = await renderTemplate({ defaultOpen: true });
      for (const id of ['root', 'trigger', 'content']) {
        expect(fixture.getByTestId(id)).toHaveAttribute('data-open');
        expect(fixture.getByTestId(id)).not.toHaveAttribute('data-closed');
      }
    });

    it('should reflect orientation on all parts', async () => {
      const fixture = await renderTemplate({ orientation: 'horizontal' });
      for (const id of ['root', 'trigger', 'content']) {
        expect(fixture.getByTestId(id)).toHaveAttribute('data-orientation', 'horizontal');
      }
    });
  });

  describe('content role', () => {
    it('should not put a role on the content (standalone disclosure)', async () => {
      const fixture = await renderTemplate();
      expect(fixture.getByTestId('content')).not.toHaveAttribute('role');
      expect(fixture.getByTestId('content')).not.toHaveAttribute('aria-labelledby');
    });
  });

  describe('find-in-page (hidden until-found + beforematch)', () => {
    it('should mark collapsed content as hidden="until-found"', async () => {
      const fixture = await render(
        `
        <style>[ngpCollapsibleContent]:not([data-open]) { height: 0; padding: 0; border: 0; overflow: hidden; }</style>
        <div ngpCollapsible>
          <button ngpCollapsibleTrigger>Toggle</button>
          <div data-testid="content" ngpCollapsibleContent>Content</div>
        </div>
        `,
        { imports },
      );

      await waitFor(() =>
        expect(fixture.getByTestId('content')).toHaveAttribute('hidden', 'until-found'),
      );
    });

    it('should open on beforematch', async () => {
      const openChange = vi.fn();
      const fixture = await renderTemplate({ openChange });

      fixture.getByTestId('content').dispatchEvent(new Event('beforematch'));
      fixture.detectChanges();

      expect(fixture.getByTestId('root')).toHaveAttribute('data-open');
      expect(openChange).toHaveBeenCalledWith(true);
    });

    it('should not open on beforematch when disabled', async () => {
      const openChange = vi.fn();
      const fixture = await renderTemplate({ disabled: true, openChange });

      fixture.getByTestId('content').dispatchEvent(new Event('beforematch'));
      fixture.detectChanges();

      expect(fixture.getByTestId('root')).not.toHaveAttribute('data-open');
      expect(openChange).not.toHaveBeenCalled();
    });
  });

  describe('content dimension CSS variables', () => {
    it('should set --ngp-collapsible-content-height when open', async () => {
      const fixture = await renderTemplate({ defaultOpen: true });
      const content = fixture.getByTestId('content');

      await waitFor(() => {
        expect(content.style.getPropertyValue('--ngp-collapsible-content-height')).not.toBe('');
        expect(content.style.getPropertyValue('--ngp-collapsible-content-height')).not.toBe('0px');
      });
    });

    it('should set --ngp-collapsible-content-width when open', async () => {
      const fixture = await renderTemplate({ defaultOpen: true, orientation: 'horizontal' });
      const content = fixture.getByTestId('content');

      await waitFor(() => {
        expect(content.style.getPropertyValue('--ngp-collapsible-content-width')).not.toBe('');
        expect(content.style.getPropertyValue('--ngp-collapsible-content-width')).not.toBe('0px');
      });
    });

    it('should not set the height variable when closed', async () => {
      const fixture = await renderTemplate();
      expect(
        fixture.getByTestId('content').style.getPropertyValue('--ngp-collapsible-content-height'),
      ).toBe('');
    });
  });

  describe('data-enter and data-exit attributes', () => {
    it('should not set data-enter or data-exit on initial render', async () => {
      const fixture = await renderTemplate({ defaultOpen: true });
      const content = fixture.getByTestId('content');
      expect(content).not.toHaveAttribute('data-enter');
      expect(content).not.toHaveAttribute('data-exit');
    });

    it('should set data-enter when it opens via user interaction', async () => {
      const fixture = await renderTemplate();
      const content = fixture.getByTestId('content');

      fireEvent.click(fixture.getByTestId('trigger'));
      fixture.detectChanges();
      fixture.detectChanges();

      await waitFor(() => expect(content).toHaveAttribute('data-enter'));
      expect(content).not.toHaveAttribute('data-exit');
    });

    it('should set data-exit when it closes via user interaction', async () => {
      const fixture = await renderTemplate({ defaultOpen: true });
      const content = fixture.getByTestId('content');

      fireEvent.click(fixture.getByTestId('trigger'));
      fixture.detectChanges();
      fixture.detectChanges();

      await waitFor(() => expect(content).toHaveAttribute('data-exit'));
      expect(content).not.toHaveAttribute('data-enter');
    });
  });
});
