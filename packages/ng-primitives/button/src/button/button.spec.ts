import { FocusMonitor } from '@angular/cdk/a11y';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { fireEvent, render } from '@testing-library/angular';
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
    expect(button).toHaveAttribute('data-focus-visible', '');
  });

  it('should remove the data-focus attribute when not focused', async () => {
    const container = await render(`<button ngpButton></button>`, {
      imports: [NgpButton],
    });

    const focusMonitor = TestBed.inject(FocusMonitor);

    const button = container.getByRole('button');
    focusMonitor.focusVia(button, 'keyboard');
    expect(button).toHaveAttribute('data-focus-visible', '');
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
});
