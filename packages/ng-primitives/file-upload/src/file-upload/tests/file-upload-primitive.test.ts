import { fireEvent, render } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NgpFilePasteTarget } from '../../file-dropzone/file-drop-filter';
import { NgpFileDropzone } from '../../file-dropzone/file-dropzone';
import { NgpFileUpload } from '../file-upload';

describe('NgpFileUpload', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('roles & attributes', () => {
    it('should initialise correctly', async () => {
      const { getByTestId } = await render(`<div ngpFileUpload data-testid="upload">Upload</div>`, {
        imports: [NgpFileUpload],
      });
      expect(getByTestId('upload')).toBeTruthy();
    });

    it('should set data-disabled when disabled', async () => {
      const { getByTestId } = await render(
        `<div ngpFileUpload ngpFileUploadDisabled data-testid="upload">Upload</div>`,
        { imports: [NgpFileUpload] },
      );
      expect(getByTestId('upload')).toHaveAttribute('data-disabled', '');
    });

    it('should not have data-disabled when not disabled', async () => {
      const { getByTestId } = await render(`<div ngpFileUpload data-testid="upload">Upload</div>`, {
        imports: [NgpFileUpload],
      });
      expect(getByTestId('upload')).not.toHaveAttribute('data-disabled');
    });

    it('should not have data-dragover initially', async () => {
      const { getByTestId } = await render(`<div ngpFileUpload data-testid="upload">Upload</div>`, {
        imports: [NgpFileUpload],
      });
      expect(getByTestId('upload')).not.toHaveAttribute('data-dragover');
    });
  });

  describe('file selection via input', () => {
    it('should open the native file dialog when the trigger is clicked', async () => {
      const clickSpy = vi
        .spyOn(HTMLInputElement.prototype, 'click')
        .mockImplementation(() => undefined);

      const { getByTestId } = await render(`<div ngpFileUpload data-testid="upload">Upload</div>`, {
        imports: [NgpFileUpload],
      });

      getByTestId('upload').click();

      expect(clickSpy).toHaveBeenCalledTimes(1);
    });

    it('should apply the accept and multiple attributes to the file input', async () => {
      const clickSpy = vi
        .spyOn(HTMLInputElement.prototype, 'click')
        .mockImplementation(() => undefined);

      const { getByTestId } = await render(
        `<div ngpFileUpload ngpFileUploadFileTypes="image/png,.jpg" ngpFileUploadMultiple data-testid="upload">Upload</div>`,
        { imports: [NgpFileUpload] },
      );

      getByTestId('upload').click();

      const input = clickSpy.mock.instances[0] as unknown as HTMLInputElement;
      expect(input.type).toBe('file');
      expect(input.accept).toBe('image/png,.jpg');
      expect(input.multiple).toBe(true);
    });

    it('should emit selected when files are chosen through the input', async () => {
      const clickSpy = vi
        .spyOn(HTMLInputElement.prototype, 'click')
        .mockImplementation(() => undefined);
      const selected = vi.fn();

      const { getByTestId } = await render(
        `<div ngpFileUpload (ngpFileUploadSelected)="selected($event)" data-testid="upload">Upload</div>`,
        { imports: [NgpFileUpload], componentProperties: { selected } },
      );

      getByTestId('upload').click();

      const input = clickSpy.mock.instances[0] as unknown as HTMLInputElement;
      const files = createFileList([createFile('photo.png', 'image/png')]);
      Object.defineProperty(input, 'files', { configurable: true, value: files });
      fireEvent.change(input);

      expect(selected).toHaveBeenCalledTimes(1);
      expect(selected).toHaveBeenCalledWith(files);
    });

    it('should open the file dialog when the trigger button is activated via the keyboard', async () => {
      const clickSpy = vi
        .spyOn(HTMLInputElement.prototype, 'click')
        .mockImplementation(() => undefined);

      const { getByRole } = await render(`<button ngpFileUpload>Upload</button>`, {
        imports: [NgpFileUpload],
      });

      const button = getByRole('button');
      button.focus();
      await userEvent.keyboard('{Enter}');

      expect(clickSpy).toHaveBeenCalled();
    });
  });

  describe('drag/drop', () => {
    it('should set data-dragover when files are dragged over', async () => {
      const { getByTestId } = await render(`<div ngpFileUpload data-testid="upload">Upload</div>`, {
        imports: [NgpFileUpload],
      });
      const upload = getByTestId('upload');

      dispatchDragEvent(upload, 'dragenter');

      expect(upload).toHaveAttribute('data-dragover', '');
    });

    it('should keep data-dragover while dragging over', async () => {
      const { getByTestId } = await render(`<div ngpFileUpload data-testid="upload">Upload</div>`, {
        imports: [NgpFileUpload],
      });
      const upload = getByTestId('upload');

      dispatchDragEvent(upload, 'dragenter');
      dispatchDragEvent(upload, 'dragover');

      expect(upload).toHaveAttribute('data-dragover', '');
    });

    it('should remove data-dragover when drag leaves', async () => {
      const { getByTestId } = await render(`<div ngpFileUpload data-testid="upload">Upload</div>`, {
        imports: [NgpFileUpload],
      });
      const upload = getByTestId('upload');

      dispatchDragEvent(upload, 'dragenter');
      expect(upload).toHaveAttribute('data-dragover', '');

      dispatchDragEvent(upload, 'dragleave', { relatedTarget: document.body });
      expect(upload).not.toHaveAttribute('data-dragover');
    });

    it('should remove data-dragover on drop', async () => {
      const { getByTestId } = await render(`<div ngpFileUpload data-testid="upload">Upload</div>`, {
        imports: [NgpFileUpload],
      });
      const upload = getByTestId('upload');

      dispatchDragEvent(upload, 'dragenter');
      expect(upload).toHaveAttribute('data-dragover', '');

      dispatchDragEvent(upload, 'drop', {
        dataTransfer: createDataTransfer(createFileList([])),
      });
      expect(upload).not.toHaveAttribute('data-dragover');
    });

    it('should emit selected with the dropped files', async () => {
      const selected = vi.fn();
      const { getByTestId } = await render(
        `<div ngpFileUpload (ngpFileUploadSelected)="selected($event)" data-testid="upload">Upload</div>`,
        { imports: [NgpFileUpload], componentProperties: { selected } },
      );
      const upload = getByTestId('upload');

      dispatchDragEvent(upload, 'drop', {
        dataTransfer: createDataTransfer(createFileList([createFile('a.png', 'image/png')])),
      });

      expect(selected).toHaveBeenCalledTimes(1);
      expect(selected.mock.calls[0][0]).toHaveLength(1);
    });

    it('should emit dragOver events', async () => {
      const dragOver = vi.fn();
      const { getByTestId } = await render(
        `<div ngpFileUpload (ngpFileUploadDragOver)="dragOver($event)" data-testid="upload">Upload</div>`,
        { imports: [NgpFileUpload], componentProperties: { dragOver } },
      );
      const upload = getByTestId('upload');

      dispatchDragEvent(upload, 'dragenter');
      expect(dragOver).toHaveBeenCalledWith(true);

      dispatchDragEvent(upload, 'dragleave', { relatedTarget: document.body });
      expect(dragOver).toHaveBeenCalledWith(false);
    });

    it('should not react to drag events when dragAndDrop is disabled', async () => {
      const { getByTestId } = await render(
        `<div ngpFileUpload [ngpFileUploadDragDrop]="false" data-testid="upload">Upload</div>`,
        { imports: [NgpFileUpload] },
      );
      const upload = getByTestId('upload');

      dispatchDragEvent(upload, 'dragenter');

      expect(upload).not.toHaveAttribute('data-dragover');
    });
  });

  describe('multiple/accept filtering', () => {
    it('should keep only the first dropped file when multiple is false', async () => {
      const selected = vi.fn();
      const { getByTestId } = await render(
        `<div ngpFileUpload (ngpFileUploadSelected)="selected($event)" data-testid="upload">Upload</div>`,
        { imports: [NgpFileUpload], componentProperties: { selected } },
      );

      dispatchDragEvent(getByTestId('upload'), 'drop', {
        dataTransfer: createDataTransfer(
          createFileList([createFile('a.png', 'image/png'), createFile('b.png', 'image/png')]),
        ),
      });

      expect(selected).toHaveBeenCalledTimes(1);
      expect(selected.mock.calls[0][0]).toHaveLength(1);
    });

    it('should keep every dropped file when multiple is true', async () => {
      const selected = vi.fn();
      const { getByTestId } = await render(
        `<div ngpFileUpload ngpFileUploadMultiple (ngpFileUploadSelected)="selected($event)" data-testid="upload">Upload</div>`,
        { imports: [NgpFileUpload], componentProperties: { selected } },
      );

      dispatchDragEvent(getByTestId('upload'), 'drop', {
        dataTransfer: createDataTransfer(
          createFileList([createFile('a.png', 'image/png'), createFile('b.png', 'image/png')]),
        ),
      });

      expect(selected).toHaveBeenCalledTimes(1);
      expect(selected.mock.calls[0][0]).toHaveLength(2);
    });

    it('should reject a dropped file that does not match the accepted file types', async () => {
      const selected = vi.fn();
      const rejected = vi.fn();
      const { getByTestId } = await render(
        `<div
          ngpFileUpload
          ngpFileUploadFileTypes=".png"
          (ngpFileUploadSelected)="selected($event)"
          (ngpFileUploadRejected)="rejected()"
          data-testid="upload"
        >Upload</div>`,
        { imports: [NgpFileUpload], componentProperties: { selected, rejected } },
      );

      dispatchDragEvent(getByTestId('upload'), 'drop', {
        dataTransfer: createDataTransfer(createFileList([createFile('a.jpg', 'image/jpeg')])),
      });

      expect(rejected).toHaveBeenCalledTimes(1);
      expect(selected).not.toHaveBeenCalled();
    });

    it('should select a dropped file that matches the accepted file types', async () => {
      const selected = vi.fn();
      const rejected = vi.fn();
      const { getByTestId } = await render(
        `<div
          ngpFileUpload
          ngpFileUploadFileTypes=".png"
          (ngpFileUploadSelected)="selected($event)"
          (ngpFileUploadRejected)="rejected()"
          data-testid="upload"
        >Upload</div>`,
        { imports: [NgpFileUpload], componentProperties: { selected, rejected } },
      );

      dispatchDragEvent(getByTestId('upload'), 'drop', {
        dataTransfer: createDataTransfer(createFileList([createFile('a.png', 'image/png')])),
      });

      expect(selected).toHaveBeenCalledTimes(1);
      expect(rejected).not.toHaveBeenCalled();
    });
  });

  describe('size limiting', () => {
    it('should reject dropped files over the max file size and report why', async () => {
      const selected = vi.fn();
      const rejected = vi.fn();
      const rejectedFiles = vi.fn();
      const { getByTestId } = await render(
        `<div
          ngpFileUpload
          ngpFileUploadMultiple
          ngpFileUploadMaxFileSize="10"
          (ngpFileUploadSelected)="selected($event)"
          (ngpFileUploadRejected)="rejected()"
          (ngpFileUploadRejectedFiles)="rejectedFiles($event)"
          data-testid="upload"
        >Upload</div>`,
        { imports: [NgpFileUpload], componentProperties: { selected, rejected, rejectedFiles } },
      );
      const small = createFile('a.png', 'image/png', 5);
      const big = createFile('b.png', 'image/png', 50);

      dispatchDragEvent(getByTestId('upload'), 'drop', {
        dataTransfer: createDataTransfer(createFileList([small, big])),
      });

      expect(Array.from(selected.mock.calls[0][0] as FileList)).toEqual([small]);
      expect(rejectedFiles).toHaveBeenCalledWith([{ file: big, reasons: ['size'] }]);
      // `rejected` keeps its original meaning: nothing at all was accepted
      expect(rejected).not.toHaveBeenCalled();
    });
  });

  describe('file dialog validation', () => {
    it('should reject dialog files that bypassed the accept hint', async () => {
      const clickSpy = vi
        .spyOn(HTMLInputElement.prototype, 'click')
        .mockImplementation(() => undefined);
      const selected = vi.fn();
      const rejected = vi.fn();
      const rejectedFiles = vi.fn();

      const { getByTestId } = await render(
        `<div
          ngpFileUpload
          ngpFileUploadFileTypes=".png"
          (ngpFileUploadSelected)="selected($event)"
          (ngpFileUploadRejected)="rejected()"
          (ngpFileUploadRejectedFiles)="rejectedFiles($event)"
          data-testid="upload"
        >Upload</div>`,
        { imports: [NgpFileUpload], componentProperties: { selected, rejected, rejectedFiles } },
      );

      getByTestId('upload').click();

      const input = clickSpy.mock.instances[0] as unknown as HTMLInputElement;
      const file = createFile('a.exe', '');
      Object.defineProperty(input, 'files', {
        configurable: true,
        value: createFileList([file]),
      });
      fireEvent.change(input);

      expect(selected).not.toHaveBeenCalled();
      expect(rejected).toHaveBeenCalledTimes(1);
      expect(rejectedFiles).toHaveBeenCalledWith([{ file, reasons: ['type'] }]);
    });

    it('should clear the accept hint when the file types are removed', async () => {
      const clickSpy = vi
        .spyOn(HTMLInputElement.prototype, 'click')
        .mockImplementation(() => undefined);

      const { getByTestId, rerender } = await render(
        `<div ngpFileUpload [ngpFileUploadFileTypes]="types" data-testid="upload">Upload</div>`,
        {
          imports: [NgpFileUpload],
          componentProperties: { types: ['.png'] as string[] | undefined },
        },
      );

      getByTestId('upload').click();
      const input = clickSpy.mock.instances[0] as unknown as HTMLInputElement;
      expect(input.accept).toBe('.png');

      await rerender({ componentProperties: { types: undefined }, partialUpdate: true });
      getByTestId('upload').click();
      expect(input.accept).toBe('');
    });
  });

  describe('paste', () => {
    it('should ignore pasted files by default', async () => {
      const selected = vi.fn();
      const { getByRole } = await render(
        `<button ngpFileUpload (ngpFileUploadSelected)="selected($event)">Upload</button>`,
        { imports: [NgpFileUpload], componentProperties: { selected } },
      );

      const event = dispatchPasteEvent(getByRole('button'), [createFile('a.png', 'image/png')]);

      expect(selected).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(false);
    });

    it('should select files pasted on the host', async () => {
      const selected = vi.fn();
      const { getByRole } = await render(
        `<button ngpFileUpload ngpFileUploadPaste (ngpFileUploadSelected)="selected($event)">Upload</button>`,
        { imports: [NgpFileUpload], componentProperties: { selected } },
      );

      const event = dispatchPasteEvent(getByRole('button'), [createFile('a.png', 'image/png')]);

      expect(selected).toHaveBeenCalledTimes(1);
      expect(event.defaultPrevented).toBe(true);
    });

    it('should not claim a paste without files', async () => {
      const selected = vi.fn();
      const { getByRole } = await render(
        `<button ngpFileUpload ngpFileUploadPaste (ngpFileUploadSelected)="selected($event)">Upload</button>`,
        { imports: [NgpFileUpload], componentProperties: { selected } },
      );

      const event = dispatchPasteEvent(getByRole('button'), []);

      expect(selected).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(false);
    });

    it('should not select pasted files when disabled', async () => {
      const selected = vi.fn();
      const { getByRole } = await render(
        `<button ngpFileUpload ngpFileUploadPaste ngpFileUploadDisabled (ngpFileUploadSelected)="selected($event)">Upload</button>`,
        { imports: [NgpFileUpload], componentProperties: { selected } },
      );

      dispatchPasteEvent(getByRole('button'), [createFile('a.png', 'image/png')]);

      expect(selected).not.toHaveBeenCalled();
    });

    it('should not add a tabindex to an element that is already focusable', async () => {
      const { getByRole } = await render(
        `<button ngpFileUpload ngpFileUploadPaste>Upload</button>`,
        { imports: [NgpFileUpload] },
      );

      expect(getByRole('button')).not.toHaveAttribute('tabindex');
    });
  });

  describe('disabled', () => {
    it('should not react to drag events when disabled', async () => {
      const { getByTestId } = await render(
        `<div ngpFileUpload ngpFileUploadDisabled data-testid="upload">Upload</div>`,
        { imports: [NgpFileUpload] },
      );
      const upload = getByTestId('upload');

      dispatchDragEvent(upload, 'dragenter');

      expect(upload).not.toHaveAttribute('data-dragover');
    });

    it('should not select dropped files when disabled', async () => {
      const selected = vi.fn();
      const { getByTestId } = await render(
        `<div ngpFileUpload ngpFileUploadDisabled (ngpFileUploadSelected)="selected($event)" data-testid="upload">Upload</div>`,
        { imports: [NgpFileUpload], componentProperties: { selected } },
      );

      dispatchDragEvent(getByTestId('upload'), 'drop', {
        dataTransfer: createDataTransfer(createFileList([createFile('a.png', 'image/png')])),
      });

      expect(selected).not.toHaveBeenCalled();
    });

    it('should not open the file dialog when disabled and clicked', async () => {
      const clickSpy = vi
        .spyOn(HTMLInputElement.prototype, 'click')
        .mockImplementation(() => undefined);

      const { getByTestId } = await render(
        `<div ngpFileUpload ngpFileUploadDisabled data-testid="upload">Upload</div>`,
        { imports: [NgpFileUpload] },
      );

      getByTestId('upload').click();

      expect(clickSpy).not.toHaveBeenCalled();
    });
  });
});

describe('NgpFileDropzone', () => {
  describe('data-dragover state', () => {
    it('should not have data-dragover initially', async () => {
      const { getByTestId } = await render(
        `<div ngpFileDropzone data-testid="dropzone">Drop</div>`,
        { imports: [NgpFileDropzone] },
      );
      expect(getByTestId('dropzone')).not.toHaveAttribute('data-dragover');
    });

    it('should set data-dragover on dragenter and clear it on dragleave', async () => {
      const { getByTestId } = await render(
        `<div ngpFileDropzone data-testid="dropzone">Drop</div>`,
        { imports: [NgpFileDropzone] },
      );
      const dropzone = getByTestId('dropzone');

      dispatchDragEvent(dropzone, 'dragenter');
      expect(dropzone).toHaveAttribute('data-dragover', '');

      dispatchDragEvent(dropzone, 'dragleave', { relatedTarget: document.body });
      expect(dropzone).not.toHaveAttribute('data-dragover');
    });

    it('should clear data-dragover on drop', async () => {
      const { getByTestId } = await render(
        `<div ngpFileDropzone data-testid="dropzone">Drop</div>`,
        { imports: [NgpFileDropzone] },
      );
      const dropzone = getByTestId('dropzone');

      dispatchDragEvent(dropzone, 'dragenter');
      expect(dropzone).toHaveAttribute('data-dragover', '');

      dispatchDragEvent(dropzone, 'drop', {
        dataTransfer: createDataTransfer(createFileList([createFile('a.png', 'image/png')])),
      });
      expect(dropzone).not.toHaveAttribute('data-dragover');
    });
  });

  describe('selection', () => {
    it('should emit selected with the dropped files', async () => {
      const selected = vi.fn();
      const { getByTestId } = await render(
        `<div ngpFileDropzone (ngpFileDropzoneSelected)="selected($event)" data-testid="dropzone">Drop</div>`,
        { imports: [NgpFileDropzone], componentProperties: { selected } },
      );

      dispatchDragEvent(getByTestId('dropzone'), 'drop', {
        dataTransfer: createDataTransfer(createFileList([createFile('a.png', 'image/png')])),
      });

      expect(selected).toHaveBeenCalledTimes(1);
      expect(selected.mock.calls[0][0]).toHaveLength(1);
    });

    it('should reject files that do not match the accepted types', async () => {
      const selected = vi.fn();
      const rejected = vi.fn();
      const { getByTestId } = await render(
        `<div
          ngpFileDropzone
          ngpFileDropzoneFileTypes=".png"
          (ngpFileDropzoneSelected)="selected($event)"
          (ngpFileDropzoneRejected)="rejected()"
          data-testid="dropzone"
        >Drop</div>`,
        { imports: [NgpFileDropzone], componentProperties: { selected, rejected } },
      );

      dispatchDragEvent(getByTestId('dropzone'), 'drop', {
        dataTransfer: createDataTransfer(createFileList([createFile('a.jpg', 'image/jpeg')])),
      });

      expect(rejected).toHaveBeenCalledTimes(1);
      expect(selected).not.toHaveBeenCalled();
    });

    it('should report every extra dropped file when multiple is false', async () => {
      const rejectedFiles = vi.fn();
      const { getByTestId } = await render(
        `<div ngpFileDropzone (ngpFileDropzoneRejectedFiles)="rejectedFiles($event)" data-testid="dropzone">Drop</div>`,
        { imports: [NgpFileDropzone], componentProperties: { rejectedFiles } },
      );
      const second = createFile('b.png', 'image/png');

      dispatchDragEvent(getByTestId('dropzone'), 'drop', {
        dataTransfer: createDataTransfer(
          createFileList([createFile('a.png', 'image/png'), second]),
        ),
      });

      expect(rejectedFiles).toHaveBeenCalledWith([{ file: second, reasons: ['count'] }]);
    });
  });

  describe('paste', () => {
    it('should make a plain element focusable only while host paste is enabled', async () => {
      const { getByTestId, rerender, fixture } = await render(
        `<div ngpFileDropzone [ngpFileDropzonePaste]="paste" data-testid="dropzone">Drop</div>`,
        {
          imports: [NgpFileDropzone],
          componentProperties: { paste: 'host' as NgpFilePasteTarget },
        },
      );
      const dropzone = getByTestId('dropzone');
      expect(dropzone).toHaveAttribute('tabindex', '0');

      await rerender({ componentProperties: { paste: false }, partialUpdate: true });
      await fixture.whenStable();
      expect(dropzone).not.toHaveAttribute('tabindex');
    });

    it('should keep a tabindex the consumer set', async () => {
      const { getByTestId } = await render(
        `<div ngpFileDropzone ngpFileDropzonePaste tabindex="-1" data-testid="dropzone">Drop</div>`,
        { imports: [NgpFileDropzone] },
      );

      expect(getByTestId('dropzone')).toHaveAttribute('tabindex', '-1');
    });

    it('should only hold a document paste listener while in document mode', async () => {
      const addSpy = vi.spyOn(document, 'addEventListener');
      const removeSpy = vi.spyOn(document, 'removeEventListener');
      const pasteCalls = (spy: typeof addSpy) =>
        spy.mock.calls.filter(([type]) => type === 'paste').length;

      const { rerender, fixture } = await render(
        `@for (i of items; track i) {
          <div ngpFileDropzone [ngpFileDropzonePaste]="paste">Drop</div>
        }`,
        {
          imports: [NgpFileDropzone],
          componentProperties: { items: [1, 2, 3], paste: false as NgpFilePasteTarget },
        },
      );
      expect(pasteCalls(addSpy)).toBe(0);

      await rerender({ componentProperties: { paste: 'document' }, partialUpdate: true });
      await fixture.whenStable();
      expect(pasteCalls(addSpy)).toBe(3);

      await rerender({ componentProperties: { paste: false }, partialUpdate: true });
      await fixture.whenStable();
      expect(pasteCalls(removeSpy)).toBe(3);

      addSpy.mockRestore();
      removeSpy.mockRestore();
    });

    it('should capture files pasted anywhere in document mode', async () => {
      const selected = vi.fn();
      await render(
        `<div ngpFileDropzone ngpFileDropzonePaste="document" (ngpFileDropzoneSelected)="selected($event)">Drop</div>
         <p data-testid="elsewhere">Elsewhere</p>`,
        { imports: [NgpFileDropzone], componentProperties: { selected } },
      );

      dispatchPasteEvent(document.querySelector('[data-testid="elsewhere"]')!, [
        createFile('a.png', 'image/png'),
      ]);

      expect(selected).toHaveBeenCalledTimes(1);
    });

    it('should leave pastes into text fields alone in document mode', async () => {
      const selected = vi.fn();
      const { getByRole } = await render(
        `<div ngpFileDropzone ngpFileDropzonePaste="document" (ngpFileDropzoneSelected)="selected($event)">Drop</div>
         <textarea></textarea>`,
        { imports: [NgpFileDropzone], componentProperties: { selected } },
      );

      const event = dispatchPasteEvent(getByRole('textbox'), [createFile('a.png', 'image/png')]);

      expect(selected).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(false);
    });

    it('should let a focused host-mode instance win over a document-mode one', async () => {
      const hostSelected = vi.fn();
      const documentSelected = vi.fn();
      const { getByTestId } = await render(
        `<div ngpFileDropzone ngpFileDropzonePaste="document" (ngpFileDropzoneSelected)="documentSelected()">Drop</div>
         <div ngpFileDropzone ngpFileDropzonePaste (ngpFileDropzoneSelected)="hostSelected()" data-testid="host">Drop</div>`,
        {
          imports: [NgpFileDropzone],
          componentProperties: { hostSelected, documentSelected },
        },
      );

      dispatchPasteEvent(getByTestId('host'), [createFile('a.png', 'image/png')]);

      expect(hostSelected).toHaveBeenCalledTimes(1);
      expect(documentSelected).not.toHaveBeenCalled();
    });
  });

  describe('disabled', () => {
    it('should set data-disabled when disabled', async () => {
      const { getByTestId } = await render(
        `<div ngpFileDropzone ngpFileDropzoneDisabled data-testid="dropzone">Drop</div>`,
        { imports: [NgpFileDropzone] },
      );
      expect(getByTestId('dropzone')).toHaveAttribute('data-disabled', '');
    });

    it('should not react to drag events when disabled', async () => {
      const { getByTestId } = await render(
        `<div ngpFileDropzone ngpFileDropzoneDisabled data-testid="dropzone">Drop</div>`,
        { imports: [NgpFileDropzone] },
      );
      const dropzone = getByTestId('dropzone');

      dispatchDragEvent(dropzone, 'dragenter');

      expect(dropzone).not.toHaveAttribute('data-dragover');
    });

    it('should not select dropped files when disabled', async () => {
      const selected = vi.fn();
      const { getByTestId } = await render(
        `<div ngpFileDropzone ngpFileDropzoneDisabled (ngpFileDropzoneSelected)="selected($event)" data-testid="dropzone">Drop</div>`,
        { imports: [NgpFileDropzone], componentProperties: { selected } },
      );

      dispatchDragEvent(getByTestId('dropzone'), 'drop', {
        dataTransfer: createDataTransfer(createFileList([createFile('a.png', 'image/png')])),
      });

      expect(selected).not.toHaveBeenCalled();
    });
  });
});

function createFile(name: string, type: string, size?: number): File {
  return new File([size === undefined ? 'dummy content' : 'x'.repeat(size)], name, { type });
}

function dispatchPasteEvent(element: Element, files: File[]): ClipboardEvent {
  const event = new ClipboardEvent('paste', { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'clipboardData', {
    configurable: true,
    value: createDataTransfer(createFileList(files)),
  });
  fireEvent(element, event);
  return event;
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
