import { render, fireEvent } from '@testing-library/angular';
import { NgpFileUpload } from './file-upload';

describe('NgpFileUpload', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpFileUpload data-testid="upload">Upload</div>`, {
      imports: [NgpFileUpload],
    });
    expect(container.getByTestId('upload')).toBeTruthy();
  });

  it('should set data-disabled when disabled', async () => {
    const container = await render(
      `<div ngpFileUpload ngpFileUploadDisabled data-testid="upload">Upload</div>`,
      { imports: [NgpFileUpload] },
    );
    expect(container.getByTestId('upload')).toHaveAttribute('data-disabled');
  });

  it('should not have data-disabled when not disabled', async () => {
    const container = await render(`<div ngpFileUpload data-testid="upload">Upload</div>`, {
      imports: [NgpFileUpload],
    });
    expect(container.getByTestId('upload')).not.toHaveAttribute('data-disabled');
  });

  it('should not have data-dragover initially', async () => {
    const container = await render(`<div ngpFileUpload data-testid="upload">Upload</div>`, {
      imports: [NgpFileUpload],
    });
    expect(container.getByTestId('upload')).not.toHaveAttribute('data-dragover');
  });

  it('should set data-dragover when files are dragged over', async () => {
    const container = await render(`<div ngpFileUpload data-testid="upload">Upload</div>`, {
      imports: [NgpFileUpload],
    });
    const upload = container.getByTestId('upload');

    fireEvent.dragEnter(upload, {
      dataTransfer: { files: [] },
    });

    expect(upload).toHaveAttribute('data-dragover');
  });

  it('should remove data-dragover when drag leaves', async () => {
    const container = await render(`<div ngpFileUpload data-testid="upload">Upload</div>`, {
      imports: [NgpFileUpload],
    });
    const upload = container.getByTestId('upload');

    fireEvent.dragEnter(upload, {
      dataTransfer: { files: [] },
    });
    expect(upload).toHaveAttribute('data-dragover');

    fireEvent.dragLeave(upload, {
      relatedTarget: document.body,
    });
    expect(upload).not.toHaveAttribute('data-dragover');
  });

  it('should not react to drag events when disabled', async () => {
    const container = await render(
      `<div ngpFileUpload ngpFileUploadDisabled data-testid="upload">Upload</div>`,
      { imports: [NgpFileUpload] },
    );
    const upload = container.getByTestId('upload');

    fireEvent.dragEnter(upload, {
      dataTransfer: { files: [] },
    });

    expect(upload).not.toHaveAttribute('data-dragover');
  });

  it('should not react to drag events when dragAndDrop is disabled', async () => {
    const container = await render(
      `<div ngpFileUpload [ngpFileUploadDragDrop]="false" data-testid="upload">Upload</div>`,
      { imports: [NgpFileUpload] },
    );
    const upload = container.getByTestId('upload');

    fireEvent.dragEnter(upload, {
      dataTransfer: { files: [] },
    });

    expect(upload).not.toHaveAttribute('data-dragover');
  });

  it('should emit dragOver events', async () => {
    const dragOver = jest.fn();
    const container = await render(
      `<div ngpFileUpload (ngpFileUploadDragOver)="dragOver($event)" data-testid="upload">Upload</div>`,
      { imports: [NgpFileUpload], componentProperties: { dragOver } },
    );
    const upload = container.getByTestId('upload');

    fireEvent.dragEnter(upload, {
      dataTransfer: { files: [] },
    });

    expect(dragOver).toHaveBeenCalledWith(true);

    fireEvent.dragLeave(upload, {
      relatedTarget: document.body,
    });

    expect(dragOver).toHaveBeenCalledWith(false);
  });

  it('should remove data-dragover on drop', async () => {
    const container = await render(`<div ngpFileUpload data-testid="upload">Upload</div>`, {
      imports: [NgpFileUpload],
    });
    const upload = container.getByTestId('upload');

    fireEvent.dragEnter(upload, {
      dataTransfer: { files: [] },
    });
    expect(upload).toHaveAttribute('data-dragover');

    fireEvent.drop(upload, {
      dataTransfer: { files: createFileList([]) },
    });
    expect(upload).not.toHaveAttribute('data-dragover');
  });
});

function createFileList(files: File[]): FileList {
  const fileList = {
    length: files.length,
    item: (i: number) => files[i],
    [Symbol.iterator]: function* () {
      for (const file of files) yield file;
    },
  } as unknown as FileList;
  files.forEach((file, i) => {
    (fileList as any)[i] = file;
  });
  return fileList;
}
