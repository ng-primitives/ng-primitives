import { Component, input, signal } from '@angular/core';
import { fireEvent, render } from '@testing-library/angular';
import { ngpFileDropzone, NgpFilePasteTarget, NgpFileRejection } from 'ng-primitives/file-upload';
import { describe, expect, it } from 'vitest';

/** Sets up the dropzone from a component field rather than through the directive. */
@Component({
  selector: 'app-dropzone',
  host: { '[attr.data-dragging]': 'dropzone.isDragOver() || null' },
  template: '',
})
class ProgrammaticDropzone {
  readonly fileTypes = input<string[]>();
  readonly maxFileSize = input<number>();
  readonly disabled = input(false);
  readonly paste = input<NgpFilePasteTarget>(false);
  readonly multiple = signal(true);

  readonly selected: File[][] = [];
  readonly rejections: NgpFileRejection[][] = [];

  protected readonly dropzone = ngpFileDropzone({
    fileTypes: this.fileTypes,
    multiple: this.multiple,
    maxFileSize: this.maxFileSize,
    paste: this.paste,
    disabled: this.disabled,
    onSelected: files => this.selected.push(Array.from(files ?? [])),
    onRejectedFiles: rejections => this.rejections.push(rejections),
  });
}

describe('ngpFileDropzone', () => {
  it('should report drag state through isDragOver and accepted drops through onSelected', async () => {
    const { container, fixture } = await render(`<app-dropzone />`, {
      imports: [ProgrammaticDropzone],
    });
    const host = container.querySelector('app-dropzone')!;
    const dropzone = fixture.debugElement.children[0].componentInstance as ProgrammaticDropzone;
    const file = createFile('a.png', 'image/png');

    dispatchDragEvent(host, 'dragenter', createFileList([file]));
    await fixture.whenStable();
    expect(host).toHaveAttribute('data-dragging');

    dispatchDragEvent(host, 'drop', createFileList([file]));
    await fixture.whenStable();
    expect(host).not.toHaveAttribute('data-dragging');
    expect(dropzone.selected).toEqual([[file]]);
  });

  it('should report files over the size limit or of the wrong type through onRejectedFiles', async () => {
    const { container, fixture } = await render(
      `<app-dropzone [fileTypes]="['.png']" [maxFileSize]="10" />`,
      { imports: [ProgrammaticDropzone] },
    );
    const host = container.querySelector('app-dropzone')!;
    const dropzone = fixture.debugElement.children[0].componentInstance as ProgrammaticDropzone;
    const big = createFile('big.png', 'image/png', 100);
    const wrongType = createFile('doc.txt', 'text/plain', 1);

    dispatchDragEvent(host, 'drop', createFileList([big, wrongType]));

    expect(dropzone.selected).toEqual([]);
    expect(dropzone.rejections).toEqual([
      [
        { file: big, reasons: ['size'] },
        { file: wrongType, reasons: ['type'] },
      ],
    ]);
  });

  it('should follow changes to the disabled signal', async () => {
    const { container, fixture, rerender } = await render(
      `<app-dropzone [disabled]="disabled" />`,
      { imports: [ProgrammaticDropzone], componentProperties: { disabled: true } },
    );
    const host = container.querySelector('app-dropzone')!;
    const dropzone = fixture.debugElement.children[0].componentInstance as ProgrammaticDropzone;
    const file = createFile('a.png', 'image/png');

    dispatchDragEvent(host, 'drop', createFileList([file]));
    expect(dropzone.selected).toEqual([]);
    expect(host).toHaveAttribute('data-disabled');

    await rerender({ componentProperties: { disabled: false } });
    await fixture.whenStable();

    dispatchDragEvent(host, 'drop', createFileList([file]));
    expect(dropzone.selected).toEqual([[file]]);
  });

  it('should select files pasted on the host when paste targets the host', async () => {
    const { container, fixture } = await render(`<app-dropzone paste="host" />`, {
      imports: [ProgrammaticDropzone],
    });
    const host = container.querySelector('app-dropzone')!;
    const dropzone = fixture.debugElement.children[0].componentInstance as ProgrammaticDropzone;
    const file = createFile('a.png', 'image/png');

    const event = new ClipboardEvent('paste', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'clipboardData', {
      value: createDataTransfer(createFileList([file])),
    });
    fireEvent(host, event);

    expect(dropzone.selected).toEqual([[file]]);
  });
});

function createFile(name: string, type: string, size?: number): File {
  return new File([size === undefined ? 'dummy content' : 'x'.repeat(size)], name, { type });
}

function dispatchDragEvent(element: Element, type: string, files: FileList): void {
  const event = new DragEvent(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'dataTransfer', { value: createDataTransfer(files) });
  fireEvent(element, event);
}

function createDataTransfer(files: FileList): DataTransfer {
  const dataTransfer = new DataTransfer();
  Object.defineProperty(dataTransfer, 'files', { value: files });
  return dataTransfer;
}

function createFileList(files: File[]): FileList {
  const fileList = {
    length: files.length,
    item: (i: number) => files[i],
    [Symbol.iterator]: function* () {
      yield* files;
    },
  } as unknown as FileList;
  files.forEach((file, i) => ((fileList as FileList & Record<number, File>)[i] = file));
  return fileList;
}
