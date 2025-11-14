import { Component } from '@angular/core';
import { fireEvent, render } from '@testing-library/angular';
import { NgpFileDropzone } from './file-dropzone';

describe('NgpFileDropzone', () => {
  it('should create a basic file dropzone', async () => {
    const { getByTestId } = await render(
      `<div ngpFileDropzone data-testid="dropzone">Drop files here</div>`,
      {
        imports: [NgpFileDropzone],
      },
    );

    expect(getByTestId('dropzone')).toBeInTheDocument();
  });

  it('should set data-disabled attribute when disabled', async () => {
    const { getByTestId } = await render(
      `<div ngpFileDropzone [ngpFileDropzoneDisabled]="true" data-testid="dropzone">Drop files here</div>`,
      {
        imports: [NgpFileDropzone],
      },
    );

    expect(getByTestId('dropzone')).toHaveAttribute('data-disabled', '');
  });

  it('should not set data-disabled attribute when not disabled', async () => {
    const { getByTestId } = await render(
      `<div ngpFileDropzone data-testid="dropzone">Drop files here</div>`,
      {
        imports: [NgpFileDropzone],
      },
    );

    expect(getByTestId('dropzone')).not.toHaveAttribute('data-disabled');
  });

  it('should set data-dragover attribute when dragging files over', async () => {
    const { getByTestId } = await render(
      `<div ngpFileDropzone data-testid="dropzone">Drop files here</div>`,
      {
        imports: [NgpFileDropzone],
      },
    );

    const element = getByTestId('dropzone');

    fireEvent.dragEnter(element);
    expect(element).toHaveAttribute('data-dragover', '');
  });

  it('should remove data-dragover attribute when dragging files away', async () => {
    const { getByTestId } = await render(
      `<div ngpFileDropzone data-testid="dropzone">Drop files here</div>`,
      {
        imports: [NgpFileDropzone],
      },
    );

    const element = getByTestId('dropzone');

    fireEvent.dragEnter(element);
    expect(element).toHaveAttribute('data-dragover', '');

    fireEvent.dragLeave(element);
    expect(element).not.toHaveAttribute('data-dragover');
  });

  it('should emit rejected event when dropped files do not match file types', async () => {
    const onRejected = jest.fn();

    @Component({
      template: `
        <div
          [ngpFileDropzoneFileTypes]="['image/*']"
          (ngpFileDropzoneRejected)="onRejected()"
          ngpFileDropzone
          data-testid="dropzone"
        >
          Drop files here
        </div>
      `,
      imports: [NgpFileDropzone],
    })
    class TestComponent {
      onRejected = onRejected;
    }

    const { getByTestId } = await render(TestComponent);

    const element = getByTestId('dropzone');

    // Create a text file (should be rejected for image/* type)
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const files = [file];

    const mockFileList = Object.assign(files, {
      item: (index: number) => files[index],
    }) as unknown as FileList;

    const dataTransfer = {
      files: mockFileList,
    };

    fireEvent.drop(element, { dataTransfer });
    expect(onRejected).toHaveBeenCalled();
  });

  it('should emit dragOver event when dragging over', async () => {
    const onDragOver = jest.fn();

    @Component({
      template: `
        <div (ngpFileDropzoneDragOver)="onDragOver($event)" ngpFileDropzone data-testid="dropzone">
          Drop files here
        </div>
      `,
      imports: [NgpFileDropzone],
    })
    class TestComponent {
      onDragOver = onDragOver;
    }

    const { getByTestId } = await render(TestComponent);

    const element = getByTestId('dropzone');

    fireEvent.dragEnter(element);
    expect(onDragOver).toHaveBeenCalledWith(true);

    fireEvent.dragLeave(element);
    expect(onDragOver).toHaveBeenCalledWith(false);
  });

  it('should accept file types as string array', async () => {
    const { getByTestId } = await render(
      `<div ngpFileDropzone [ngpFileDropzoneFileTypes]="['image/jpeg', 'image/png']" data-testid="dropzone">Drop files here</div>`,
      {
        imports: [NgpFileDropzone],
      },
    );

    expect(getByTestId('dropzone')).toBeInTheDocument();
  });

  it('should accept file types as comma-separated string', async () => {
    const { getByTestId } = await render(
      `<div ngpFileDropzone ngpFileDropzoneFileTypes="image/jpeg,image/png" data-testid="dropzone">Drop files here</div>`,
      {
        imports: [NgpFileDropzone],
      },
    );

    expect(getByTestId('dropzone')).toBeInTheDocument();
  });

  it('should support multiple file selection', async () => {
    const { getByTestId } = await render(
      `<div ngpFileDropzone [ngpFileDropzoneMultiple]="true" data-testid="dropzone">Drop files here</div>`,
      {
        imports: [NgpFileDropzone],
      },
    );

    expect(getByTestId('dropzone')).toBeInTheDocument();
  });

  it('should support directory selection', async () => {
    const { getByTestId } = await render(
      `<div ngpFileDropzone [ngpFileDropzoneDirectory]="true" data-testid="dropzone">Drop files here</div>`,
      {
        imports: [NgpFileDropzone],
      },
    );

    expect(getByTestId('dropzone')).toBeInTheDocument();
  });

  it('should not respond to drag events when disabled', async () => {
    const { getByTestId } = await render(
      `<div ngpFileDropzone [ngpFileDropzoneDisabled]="true" data-testid="dropzone">Drop files here</div>`,
      {
        imports: [NgpFileDropzone],
      },
    );

    const element = getByTestId('dropzone');

    fireEvent.dragEnter(element);
    expect(element).not.toHaveAttribute('data-dragover');

    fireEvent.dragOver(element);
    expect(element).not.toHaveAttribute('data-dragover');
  });

  it('should not accept dropped files when disabled', async () => {
    const onSelected = jest.fn();

    @Component({
      template: `
        <div
          [ngpFileDropzoneDisabled]="true"
          (ngpFileDropzoneSelected)="onSelected($event)"
          ngpFileDropzone
          data-testid="dropzone"
        >
          Drop files here
        </div>
      `,
      imports: [NgpFileDropzone],
    })
    class TestComponent {
      onSelected = onSelected;
    }

    const { getByTestId } = await render(TestComponent, {
      imports: [NgpFileDropzone],
    });

    const element = getByTestId('dropzone');

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const files = [file];

    const mockFileList = Object.assign(files, {
      item: (index: number) => files[index],
    }) as unknown as FileList;

    const dataTransfer = {
      files: mockFileList,
    };

    fireEvent.drop(element, { dataTransfer });
    expect(onSelected).not.toHaveBeenCalled();
  });

  it('should have hover interaction when not disabled', async () => {
    const { getByTestId } = await render(
      `<div ngpFileDropzone data-testid="dropzone">Drop files here</div>`,
      {
        imports: [NgpFileDropzone],
      },
    );

    const element = getByTestId('dropzone');

    fireEvent.mouseEnter(element);
    expect(element).toHaveAttribute('data-hover', '');

    fireEvent.mouseLeave(element);
    expect(element).not.toHaveAttribute('data-hover');
  });

  it('should not have hover interaction when disabled', async () => {
    const { getByTestId } = await render(
      `<div ngpFileDropzone [ngpFileDropzoneDisabled]="true" data-testid="dropzone">Drop files here</div>`,
      {
        imports: [NgpFileDropzone],
      },
    );

    const element = getByTestId('dropzone');

    fireEvent.mouseEnter(element);
    expect(element).not.toHaveAttribute('data-hover');
  });

  it('should update disabled state dynamically', async () => {
    const { getByTestId, rerender } = await render(
      `<div ngpFileDropzone [ngpFileDropzoneDisabled]="isDisabled" data-testid="dropzone">Drop files here</div>`,
      {
        imports: [NgpFileDropzone],
        componentProperties: { isDisabled: false },
      },
    );

    const element = getByTestId('dropzone');
    expect(element).not.toHaveAttribute('data-disabled');

    await rerender({ componentProperties: { isDisabled: true } });
    expect(element).toHaveAttribute('data-disabled', '');
  });

  it('should prevent dragenter and dragover events', async () => {
    const { getByTestId } = await render(
      `<div ngpFileDropzone data-testid="dropzone">Drop files here</div>`,
      {
        imports: [NgpFileDropzone],
      },
    );

    const element = getByTestId('dropzone');

    const dragEnterEvent = new Event('dragenter', { bubbles: true, cancelable: true });
    const dragOverEvent = new Event('dragover', { bubbles: true, cancelable: true });

    element.dispatchEvent(dragEnterEvent);
    element.dispatchEvent(dragOverEvent);

    expect(dragEnterEvent.defaultPrevented).toBe(true);
    expect(dragOverEvent.defaultPrevented).toBe(true);
  });

  it('should handle dragLeave only when dragging over and not disabled', async () => {
    const onDragOver = jest.fn();

    @Component({
      template: `
        <div (ngpFileDropzoneDragOver)="onDragOver($event)" ngpFileDropzone data-testid="dropzone">
          Drop files here
        </div>
      `,
      imports: [NgpFileDropzone],
    })
    class TestComponent {
      onDragOver = onDragOver;
    }

    const { getByTestId } = await render(TestComponent);

    const element = getByTestId('dropzone');

    // First enter to set dragover state
    fireEvent.dragEnter(element);
    expect(onDragOver).toHaveBeenCalledWith(true);

    // Clear mock to test dragLeave
    onDragOver.mockClear();

    // Now leave should trigger
    fireEvent.dragLeave(element);
    expect(onDragOver).toHaveBeenCalledWith(false);
  });
});
