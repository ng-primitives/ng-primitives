import { FocusMonitor } from '@angular/cdk/a11y';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { fireEvent, render } from '@testing-library/angular';
import { provideButtonConfig } from '../config/button-config';
import { NgpButton } from './button';

describe('NgpButton', () => {
  it('should set the disabled attribute when disabled', async () => {
    const container = await render(`<button ngpButton [disabled]="true"></button>`, {
      imports: [NgpButton],
    });

    expect(container.getByRole('button')).toHaveAttribute('disabled');
  });

  it('should not set the disabled attribute when not disabled', async () => {
    const container = await render(`<button ngpButton></button>`, {
      imports: [NgpButton],
    });

    expect(container.getByRole('button')).not.toHaveAttribute('disabled');
  });

  it('should not set the disabled attribute when not a button', async () => {
    const container = await render(`<a ngpButton [disabled]="true"></a>`, {
      imports: [NgpButton],
    });
    const button = container.debugElement.queryAll(By.css('a'));
    expect(button.length).toBe(1);
    expect(button[0].nativeElement).not.toHaveAttribute('disabled');
  });

  it('should set the data-disabled attribute when disabled', async () => {
    const container = await render(`<button ngpButton [disabled]="true"></button>`, {
      imports: [NgpButton],
    });

    expect(container.getByRole('button')).toHaveAttribute('data-disabled', '');
  });

  it('should not set the data-disabled attribute when not disabled', async () => {
    const container = await render(`<button ngpButton></button>`, {
      imports: [NgpButton],
    });

    expect(container.getByRole('button')).not.toHaveAttribute('data-disabled');
  });

  it('should update the data-disabled attribute when disabled changes', async () => {
    const { getByRole, rerender } = await render(
      `<button ngpButton [disabled]="isDisabled"></button>`,
      {
        imports: [NgpButton],
        componentProperties: { isDisabled: false },
      },
    );

    const button = getByRole('button');
    expect(button).not.toHaveAttribute('data-disabled');
    expect(button).not.toHaveAttribute('disabled');

    await rerender({ componentProperties: { isDisabled: true } });
    expect(button).toHaveAttribute('data-disabled');
    expect(button).toHaveAttribute('disabled');
  });

  it('should add the data-hover attribute when hovered', async () => {
    const container = await render(`<button ngpButton></button>`, {
      imports: [NgpButton],
    });

    const button = container.getByRole('button');
    fireEvent.mouseEnter(button);
    expect(button).toHaveAttribute('data-hover', '');
  });

  it('should remove the data-hover attribute when not hovered', async () => {
    const container = await render(`<button ngpButton></button>`, {
      imports: [NgpButton],
    });

    const button = container.getByRole('button');
    fireEvent.mouseEnter(button);
    expect(button).toHaveAttribute('data-hover', '');
    fireEvent.mouseLeave(button);
    expect(button).not.toHaveAttribute('data-hover');
  });

  it('should add the data-focus attribute when focused', async () => {
    const container = await render(`<button ngpButton></button>`, {
      imports: [NgpButton],
    });

    const focusMonitor = TestBed.inject(FocusMonitor);

    const button = container.getByRole('button');
    focusMonitor.focusVia(button, 'keyboard');
    expect(button).toHaveAttribute('data-focus-visible');
  });

  it('should remove the data-focus attribute when not focused', async () => {
    const container = await render(`<button ngpButton></button>`, {
      imports: [NgpButton],
    });

    const focusMonitor = TestBed.inject(FocusMonitor);

    const button = container.getByRole('button');
    focusMonitor.focusVia(button, 'keyboard');
    expect(button).toHaveAttribute('data-focus-visible');
    fireEvent.blur(button);
    expect(button).not.toHaveAttribute('data-focus-visible');
  });

  it('should add the data-press attribute when pressed', async () => {
    const container = await render(`<button ngpButton></button>`, {
      imports: [NgpButton],
    });

    const button = container.getByRole('button');
    fireEvent.pointerDown(button);
    expect(button).toHaveAttribute('data-press', '');
  });

  it('should remove the data-press attribute when not pressed', async () => {
    const container = await render(`<button ngpButton></button>`, {
      imports: [NgpButton],
    });

    const button = container.getByRole('button');
    fireEvent.pointerDown(button);
    expect(button).toHaveAttribute('data-press', '');
    fireEvent.pointerUp(button);
    expect(button).not.toHaveAttribute('data-press');
  });

  it('should not add the data-press attribute when disabled', async () => {
    const container = await render(`<button ngpButton [disabled]="true"></button>`, {
      imports: [NgpButton],
    });

    const button = container.getByRole('button');
    fireEvent.pointerDown(button);
    expect(button).not.toHaveAttribute('data-press');
  });

  it('should not add the data-focus-visible attribute when disabled', async () => {
    const container = await render(`<button ngpButton [disabled]="true"></button>`, {
      imports: [NgpButton],
    });

    const focusMonitor = TestBed.inject(FocusMonitor);

    const button = container.getByRole('button');
    focusMonitor.focusVia(button, 'keyboard');
    expect(button).not.toHaveAttribute('data-focus-visible');
  });

  it('should not add the data-hover attribute when disabled', async () => {
    const container = await render(`<button ngpButton [disabled]="true"></button>`, {
      imports: [NgpButton],
    });

    const button = container.getByRole('button');
    fireEvent.mouseEnter(button);
    expect(button).not.toHaveAttribute('data-hover');
  });

  describe('NgpButtonConfig', () => {
    describe('autoSetRole', () => {
      it('should default to not set the role attribute', async () => {
        const container = await render(`<div ngpButton></div>`, {
          imports: [NgpButton],
        });

        const button = container.debugElement.queryAll(By.css('div'));
        expect(button.length).toBe(1);
        expect(button[0].nativeElement).not.toHaveAttribute('role');
      });

      it('should set the role attribute to non-native button to button if autoSetRole is true', async () => {
        const container = await render(`<div ngpButton></div>`, {
          imports: [NgpButton],
          providers: [provideButtonConfig({ autoSetRole: true })],
        });

        expect(container.getByRole('button')).toHaveAttribute('role', 'button');
      });

      it('should not set the role attribute to button if autoSetRole is true and the element is a native button', async () => {
        const container = await render(`<button ngpButton></button>`, {
          imports: [NgpButton],
          providers: [provideButtonConfig({ autoSetRole: true })],
        });

        expect(container.getByRole('button')).not.toHaveAttribute('role', 'button');
      });

      it('should keep the role attribute if it is already set', async () => {
        const container = await render(`<button role="menuitem" ngpButton></button>`, {
          imports: [NgpButton],
          providers: [provideButtonConfig({ autoSetRole: true })],
        });

        const button = container.debugElement.queryAll(By.css('button'));
        expect(button.length).toBe(1);
        expect(button[0].nativeElement).toHaveAttribute('role', 'menuitem');
      });

      it('should keep the role attribute if it is already set empty string', async () => {
        const container = await render(`<button role ngpButton></button>`, {
          imports: [NgpButton],
          providers: [provideButtonConfig({ autoSetRole: true })],
        });

        const button = container.debugElement.queryAll(By.css('button'));
        expect(button.length).toBe(1);
        expect(button[0].nativeElement).toHaveAttribute('role', '');
      });

      it('should not set the role attribute if is valid link', async () => {
        const container = await render(`<a href="/" ngpButton></a>`, {
          imports: [NgpButton],
          providers: [provideButtonConfig({ autoSetRole: true })],
        });

        const button = container.debugElement.queryAll(By.css('a'));
        expect(button.length).toBe(1);
        expect(button[0].nativeElement).not.toHaveAttribute('role');
      });

      it('should set the role attribute if is not valid link', async () => {
        const container = await render(`<a ngpButton></a>`, {
          imports: [NgpButton],
          providers: [provideButtonConfig({ autoSetRole: true })],
        });

        const button = container.debugElement.queryAll(By.css('a'));
        expect(button.length).toBe(1);
        expect(button[0].nativeElement).toHaveAttribute('role', 'button');
      });
    });

    describe('autoSetType', () => {
      it('should default to not set the type attribute', async () => {
        const container = await render(`<button ngpButton></button>`, {
          imports: [NgpButton],
        });

        expect(container.getByRole('button')).not.toHaveAttribute('type');
      });

      it('should set the type attribute to button if native button and autoSetType is true', async () => {
        const container = await render(`<button ngpButton></button>`, {
          imports: [NgpButton],
          providers: [provideButtonConfig({ autoSetType: true })],
        });

        expect(container.getByRole('button')).toHaveAttribute('type', 'button');
      });

      it('should not set the type attribute if not native button and autoSetType is true', async () => {
        const container = await render(`<div ngpButton></div>`, {
          imports: [NgpButton],
          providers: [provideButtonConfig({ autoSetType: true })],
        });

        const button = container.debugElement.queryAll(By.css('div'));
        expect(button.length).toBe(1);
        expect(button[0].nativeElement).not.toHaveAttribute('type');
      });

      it('should keep the type attribute if it is already set', async () => {
        const container = await render(`<button type="submit" ngpButton></button>`, {
          imports: [NgpButton],
          providers: [provideButtonConfig({ autoSetType: true })],
        });

        expect(container.getByRole('button')).toHaveAttribute('type', 'submit');
      });
    });
  });
});
