import { describe, expect, it, vi } from 'vitest';
import {
  coercePasteTarget,
  isFileTypeAccepted,
  validateFiles,
} from '../../file-dropzone/file-drop-filter';

describe('isFileTypeAccepted', () => {
  const createFile = (name: string, type: string): File =>
    new File(['dummy content'], name, { type });

  it('returns true if no acceptedTypes are provided', () => {
    const file = createFile('image.jpg', 'image/jpeg');
    expect(isFileTypeAccepted(file, undefined)).toBe(true);
    expect(isFileTypeAccepted(file, [])).toBe(true);
  });

  it('matches exact MIME types', () => {
    const file = createFile('image.jpg', 'image/jpeg');
    expect(isFileTypeAccepted(file, ['image/jpeg'])).toBe(true);
    expect(isFileTypeAccepted(file, ['image/png'])).toBe(false);
  });

  it('matches wildcard MIME types', () => {
    const file = createFile('image.jpg', 'image/jpeg');
    expect(isFileTypeAccepted(file, ['image/*'])).toBe(true);
    expect(isFileTypeAccepted(file, ['application/*'])).toBe(false);
  });

  it('matches file extensions', () => {
    const file = createFile('photo.JPG', 'image/jpeg');
    expect(isFileTypeAccepted(file, ['.jpg'])).toBe(true);
    expect(isFileTypeAccepted(file, ['.jpeg'])).toBe(false);
    expect(isFileTypeAccepted(file, ['.png'])).toBe(false);
  });

  it('ignores case in acceptedTypes', () => {
    const file = createFile('photo.jpg', 'image/jpeg');
    expect(isFileTypeAccepted(file, ['.JPG', 'IMAGE/*'])).toBe(true);
  });

  it('does not match extension if only MIME type matches', () => {
    const file = createFile('photo.jpg', 'image/jpeg');
    expect(isFileTypeAccepted(file, ['.png'])).toBe(false);
  });

  it('matches application/pdf MIME type', () => {
    const file = createFile('document.pdf', 'application/pdf');

    expect(isFileTypeAccepted(file, ['application/pdf'])).toBe(true);
    expect(isFileTypeAccepted(file, ['application/*'])).toBe(true);
    expect(isFileTypeAccepted(file, ['.pdf'])).toBe(true);
    expect(isFileTypeAccepted(file, ['image/*'])).toBe(false);
  });

  it('handles PDF file without extension', () => {
    const file = createFile('document', 'application/pdf');

    expect(isFileTypeAccepted(file, ['application/pdf'])).toBe(true);
    expect(isFileTypeAccepted(file, ['application/*'])).toBe(true);
    expect(isFileTypeAccepted(file, ['.pdf'])).toBe(false);
  });

  it('handles PNG file without extension', () => {
    const file = createFile('image', 'image/png');

    expect(isFileTypeAccepted(file, ['image/png'])).toBe(true);
    expect(isFileTypeAccepted(file, ['image/*'])).toBe(true);
    expect(isFileTypeAccepted(file, ['.png'])).toBe(false);
  });
});

describe('validateFiles', () => {
  const createFile = (name: string, type: string, size = 10): File =>
    new File(['x'.repeat(size)], name, { type });
  const toFileList = (files: File[]) => files as unknown as FileList;
  const options = { fileTypes: undefined, maxFileSize: undefined, multiple: true };

  it('accepts everything when there are no rules', () => {
    const files = [createFile('a.png', 'image/png'), createFile('b.exe', '')];
    expect(validateFiles(toFileList(files), options)).toEqual({ accepted: files, rejections: [] });
  });

  it('splits accepted and rejected files, keeping every reason per file', () => {
    const ok = createFile('a.png', 'image/png', 5);
    const big = createFile('b.png', 'image/png', 50);
    const wrong = createFile('c.exe', '', 50);

    const result = validateFiles(toFileList([ok, big, wrong]), {
      ...options,
      fileTypes: ['image/*'],
      maxFileSize: 10,
    });

    expect(result.accepted).toEqual([ok]);
    expect(result.rejections).toEqual([
      { file: big, reasons: ['size'] },
      { file: wrong, reasons: ['type', 'size'] },
    ]);
  });

  it('keeps the first valid file and rejects the rest with count when multiple is false', () => {
    const invalid = createFile('a.exe', '');
    const first = createFile('b.png', 'image/png');
    const second = createFile('c.png', 'image/png');

    const result = validateFiles(toFileList([invalid, first, second]), {
      ...options,
      fileTypes: ['.png'],
      multiple: false,
    });

    expect(result.accepted).toEqual([first]);
    expect(result.rejections).toEqual([
      { file: invalid, reasons: ['type'] },
      { file: second, reasons: ['count'] },
    ]);
  });

  it('reports count alongside other reasons for extra files when multiple is false', () => {
    const first = createFile('a.png', 'image/png');
    const extra = createFile('b.exe', '', 50);

    const result = validateFiles(toFileList([first, extra]), {
      fileTypes: ['.png'],
      maxFileSize: 10,
      multiple: false,
    });

    expect(result.rejections).toEqual([{ file: extra, reasons: ['type', 'size', 'count'] }]);
  });

  it('treats a NaN size limit as no limit', () => {
    const file = createFile('a.png', 'image/png', 50);
    expect(validateFiles(toFileList([file]), { ...options, maxFileSize: NaN }).accepted).toEqual([
      file,
    ]);
  });

  it('silently drops hidden files from folder uploads that fail the type check', () => {
    const dsStore = createFile('.DS_Store', '');
    Object.defineProperty(dsStore, 'webkitRelativePath', { value: 'photos/.DS_Store' });

    expect(validateFiles(toFileList([dsStore]), { ...options, fileTypes: ['image/*'] })).toEqual({
      accepted: [],
      rejections: [],
    });
  });
});

describe('coercePasteTarget', () => {
  it('maps the bare attribute and true to host', () => {
    expect(coercePasteTarget('')).toBe('host');
    expect(coercePasteTarget(true)).toBe('host');
    expect(coercePasteTarget('true')).toBe('host');
  });

  it('keeps explicit targets', () => {
    expect(coercePasteTarget('host')).toBe('host');
    expect(coercePasteTarget('document')).toBe('document');
  });

  it('maps falsy values to false', () => {
    expect(coercePasteTarget(false)).toBe(false);
    expect(coercePasteTarget('false')).toBe(false);
    expect(coercePasteTarget(null)).toBe(false);
    expect(coercePasteTarget(undefined)).toBe(false);
  });

  it('warns about an unknown target and falls back to false', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    expect(coercePasteTarget('documnet' as never)).toBe(false);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('documnet'));

    warn.mockRestore();
  });
});
