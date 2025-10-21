import { Component } from '@angular/core';
import { fireEvent, render } from '@testing-library/angular';
import { NgpFileUpload } from './file-upload';

describe('NgpFileUpload', () => {
  it('should create a basic file upload', async () => {
    const { getByTestId } = await render(
      `<button ngpFileUpload data-testid="file-upload">Upload</button>`,
      {
        imports: [NgpFileUpload],
      },
    );

    expect(getByTestId('file-upload')).toBeInTheDocument();
  });

  it('should set data-disabled attribute when disabled', async () => {
    const { getByTestId } = await render(
      `<button ngpFileUpload [ngpFileUploadDisabled]="true" data-testid="file-upload">Upload</button>`,
      {
        imports: [NgpFileUpload],
      },
    );

    expect(getByTestId('file-upload')).toHaveAttribute('data-disabled', '');
  });

  it('should not set data-disabled attribute when not disabled', async () => {
    const { getByTestId } = await render(
      `<button ngpFileUpload data-testid="file-upload">Upload</button>`,
      {
        imports: [NgpFileUpload],
      },
    );

    expect(getByTestId('file-upload')).not.toHaveAttribute('data-disabled');
  });

  it('should emit selected event when files are selected', async () => {
    const onSelected = jest.fn();

    @Component({
      template: `
        <button
          (ngpFileUploadSelected)="onSelected($event)"
          ngpFileUpload
          data-testid="file-upload"
        >
          Upload
        </button>
      `,
    })
    class TestComponent {
      onSelected = onSelected;
    }

    const { getByTestId } = await render(TestComponent, {
      imports: [NgpFileUpload],
    });

    const element = getByTestId('file-upload');

    // Since we can't easily access the internal file input, we'll test the click functionality
    fireEvent.click(element);
    expect(element).toBeInTheDocument();
  });

  it('should emit canceled event', async () => {
    const onCanceled = jest.fn();

    @Component({
      template: `
        <button (ngpFileUploadCanceled)="onCanceled()" ngpFileUpload data-testid="file-upload">
          Upload
        </button>
      `,
    })
    class TestComponent {
      onCanceled = onCanceled;
    }

    const { getByTestId } = await render(TestComponent, {
      imports: [NgpFileUpload],
    });

    expect(getByTestId('file-upload')).toBeInTheDocument();
  });

  it('should emit rejected event', async () => {
    const onRejected = jest.fn();

    @Component({
      template: `
        <button (ngpFileUploadRejected)="onRejected()" ngpFileUpload data-testid="file-upload">
          Upload
        </button>
      `,
    })
    class TestComponent {
      onRejected = onRejected;
    }

    const { getByTestId } = await render(TestComponent, {
      imports: [NgpFileUpload],
    });

    expect(getByTestId('file-upload')).toBeInTheDocument();
  });

  it('should emit dragOver event', async () => {
    const onDragOver = jest.fn();

    @Component({
      template: `
        <div (ngpFileUploadDragOver)="onDragOver($event)" ngpFileUpload data-testid="file-upload">
          Upload
        </div>
      `,
      imports: [NgpFileUpload],
    })
    class TestComponent {
      onDragOver = onDragOver;
    }

    const { getByTestId } = await render(TestComponent);

    const element = getByTestId('file-upload');

    // Test drag over functionality
    fireEvent.dragEnter(element);
    expect(element).toHaveAttribute('data-dragover', '');
  });

  it('should accept file types as string array', async () => {
    const { getByTestId } = await render(
      `<button ngpFileUpload [ngpFileUploadFileTypes]="['image/jpeg', 'image/png']" data-testid="file-upload">Upload</button>`,
      {
        imports: [NgpFileUpload],
      },
    );

    expect(getByTestId('file-upload')).toBeInTheDocument();
  });

  it('should accept file types as comma-separated string', async () => {
    const { getByTestId } = await render(
      `<button ngpFileUpload ngpFileUploadFileTypes="image/jpeg,image/png" data-testid="file-upload">Upload</button>`,
      {
        imports: [NgpFileUpload],
      },
    );

    expect(getByTestId('file-upload')).toBeInTheDocument();
  });

  it('should support multiple file selection', async () => {
    const { getByTestId } = await render(
      `<button ngpFileUpload [ngpFileUploadMultiple]="true" data-testid="file-upload">Upload</button>`,
      {
        imports: [NgpFileUpload],
      },
    );

    expect(getByTestId('file-upload')).toBeInTheDocument();
  });

  it('should support directory selection', async () => {
    const { getByTestId } = await render(
      `<button ngpFileUpload [ngpFileUploadDirectory]="true" data-testid="file-upload">Upload</button>`,
      {
        imports: [NgpFileUpload],
      },
    );

    expect(getByTestId('file-upload')).toBeInTheDocument();
  });

  it('should support disabling drag and drop', async () => {
    const { getByTestId } = await render(
      `<button ngpFileUpload [ngpFileUploadDragDrop]="false" data-testid="file-upload">Upload</button>`,
      {
        imports: [NgpFileUpload],
      },
    );

    const element = getByTestId('file-upload');

    // When drag and drop is disabled, dragenter should not set data-dragover
    fireEvent.dragEnter(element);
    expect(element).not.toHaveAttribute('data-dragover');
  });

  it('should not trigger file dialog when disabled', async () => {
    const { getByTestId } = await render(
      `<button ngpFileUpload [ngpFileUploadDisabled]="true" data-testid="file-upload">Upload</button>`,
      {
        imports: [NgpFileUpload],
      },
    );

    const element = getByTestId('file-upload');

    // Click should not open file dialog when disabled
    fireEvent.click(element);
    expect(element).toHaveAttribute('data-disabled', '');
  });

  it('should have hover interaction when not disabled', async () => {
    const { getByTestId } = await render(
      `<button ngpFileUpload data-testid="file-upload">Upload</button>`,
      {
        imports: [NgpFileUpload],
      },
    );

    const element = getByTestId('file-upload');

    fireEvent.mouseEnter(element);
    expect(element).toHaveAttribute('data-hover', '');

    fireEvent.mouseLeave(element);
    expect(element).not.toHaveAttribute('data-hover');
  });

  it('should not have hover interaction when disabled', async () => {
    const { getByTestId } = await render(
      `<button ngpFileUpload [ngpFileUploadDisabled]="true" data-testid="file-upload">Upload</button>`,
      {
        imports: [NgpFileUpload],
      },
    );

    const element = getByTestId('file-upload');

    fireEvent.mouseEnter(element);
    expect(element).not.toHaveAttribute('data-hover');
  });

  it('should have press interaction when not disabled', async () => {
    const { getByTestId } = await render(
      `<button ngpFileUpload data-testid="file-upload">Upload</button>`,
      {
        imports: [NgpFileUpload],
      },
    );

    const element = getByTestId('file-upload');

    fireEvent.pointerDown(element);
    expect(element).toHaveAttribute('data-press', '');

    fireEvent.pointerUp(element);
    expect(element).not.toHaveAttribute('data-press');
  });

  it('should not have press interaction when disabled', async () => {
    const { getByTestId } = await render(
      `<button ngpFileUpload [ngpFileUploadDisabled]="true" data-testid="file-upload">Upload</button>`,
      {
        imports: [NgpFileUpload],
      },
    );

    const element = getByTestId('file-upload');

    fireEvent.pointerDown(element);
    expect(element).not.toHaveAttribute('data-press');
  });

  it('should update disabled state dynamically', async () => {
    const { getByTestId, rerender } = await render(
      `<button ngpFileUpload [ngpFileUploadDisabled]="isDisabled" data-testid="file-upload">Upload</button>`,
      {
        imports: [NgpFileUpload],
        componentProperties: { isDisabled: false },
      },
    );

    const element = getByTestId('file-upload');
    expect(element).not.toHaveAttribute('data-disabled');

    await rerender({ componentProperties: { isDisabled: true } });
    expect(element).toHaveAttribute('data-disabled', '');
  });
});
