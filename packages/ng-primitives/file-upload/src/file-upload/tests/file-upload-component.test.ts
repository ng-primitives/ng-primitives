import { fireEvent, render } from '@testing-library/angular';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FileUpload } from './file-upload.fixture';

describe('FileUpload (reusable component) — standalone', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders and has no drag state initially', async () => {
    const { getByTestId } = await render(`<app-file-upload data-testid="upload" />`, {
      imports: [FileUpload],
    });

    const upload = getByTestId('upload');
    expect(upload).toBeTruthy();
    expect(upload).not.toHaveAttribute('data-dragover');
    expect(upload).not.toHaveAttribute('data-disabled');
  });

  it('sets data-dragover while a file is dragged over and clears it on drop', async () => {
    const { getByTestId } = await render(`<app-file-upload data-testid="upload" />`, {
      imports: [FileUpload],
    });
    const upload = getByTestId('upload');

    dispatchDragEvent(upload, 'dragenter');
    expect(upload).toHaveAttribute('data-dragover', '');

    dispatchDragEvent(upload, 'drop', {
      dataTransfer: createDataTransfer(createFileList([createFile('a.png', 'image/png')])),
    });
    expect(upload).not.toHaveAttribute('data-dragover');
  });

  it('emits selected when a file is dropped', async () => {
    const selected = vi.fn();
    const { getByTestId } = await render(
      `<app-file-upload (selected)="selected($event)" data-testid="upload" />`,
      { imports: [FileUpload], componentProperties: { selected } },
    );

    dispatchDragEvent(getByTestId('upload'), 'drop', {
      dataTransfer: createDataTransfer(createFileList([createFile('a.png', 'image/png')])),
    });

    expect(selected).toHaveBeenCalledTimes(1);
    expect(selected.mock.calls[0][0]).toHaveLength(1);
  });

  it('opens the file dialog when clicked', async () => {
    const clickSpy = vi
      .spyOn(HTMLInputElement.prototype, 'click')
      .mockImplementation(() => undefined);

    const { getByTestId } = await render(`<app-file-upload data-testid="upload" />`, {
      imports: [FileUpload],
    });

    getByTestId('upload').click();

    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('exposes data-disabled and ignores interaction when disabled', async () => {
    const selected = vi.fn();
    const clickSpy = vi
      .spyOn(HTMLInputElement.prototype, 'click')
      .mockImplementation(() => undefined);

    const { getByTestId } = await render(
      `<app-file-upload disabled="true" (selected)="selected($event)" data-testid="upload" />`,
      { imports: [FileUpload], componentProperties: { selected } },
    );
    const upload = getByTestId('upload');

    expect(upload).toHaveAttribute('data-disabled', '');

    dispatchDragEvent(upload, 'dragenter');
    expect(upload).not.toHaveAttribute('data-dragover');

    upload.click();
    expect(clickSpy).not.toHaveBeenCalled();

    dispatchDragEvent(upload, 'drop', {
      dataTransfer: createDataTransfer(createFileList([createFile('a.png', 'image/png')])),
    });
    expect(selected).not.toHaveBeenCalled();
  });
});

function createFile(name: string, type: string): File {
  return new File(['dummy content'], name, { type });
}

function dispatchDragEvent(
  element: Element,
  type: string,
  options: { dataTransfer?: DataTransfer; relatedTarget?: EventTarget | null } = {},
) {
  const event = new DragEvent(type, {
    bubbles: true,
    cancelable: true,
    relatedTarget: options.relatedTarget ?? null,
  });

  Object.defineProperty(event, 'dataTransfer', {
    configurable: true,
    value: options.dataTransfer ?? createDataTransfer(),
  });

  fireEvent(element, event);
}

function createDataTransfer(files = createFileList([])): DataTransfer {
  const dataTransfer = new DataTransfer();
  Object.defineProperty(dataTransfer, 'files', {
    configurable: true,
    value: files,
  });
  return dataTransfer;
}

function createFileList(files: File[]): FileList {
  const fileList = {
    length: files.length,
    item: (i: number) => files[i],
    [Symbol.iterator]: function* () {
      for (const file of files) {
        yield file;
      }
    },
  } as unknown as FileList;

  files.forEach((file, i) => {
    (fileList as FileList & Record<number, File>)[i] = file;
  });

  return fileList;
}
