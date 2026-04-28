import { isFileTypeAccepted } from './file-drop-filter';

describe('isFileTypeAccepted', () => {
  const createFile = (name: string, type: string): File =>
    new File(['dummy content'], name, { type });

  test('returns true if no acceptedTypes are provided', () => {
    const file = createFile('image.jpg', 'image/jpeg');
    expect(isFileTypeAccepted(file, undefined)).toBe(true);
    expect(isFileTypeAccepted(file, [])).toBe(true);
  });

  test('matches exact MIME types', () => {
    const file = createFile('image.jpg', 'image/jpeg');
    expect(isFileTypeAccepted(file, ['image/jpeg'])).toBe(true);
    expect(isFileTypeAccepted(file, ['image/png'])).toBe(false);
  });

  test('matches wildcard MIME types', () => {
    const file = createFile('image.jpg', 'image/jpeg');
    expect(isFileTypeAccepted(file, ['image/*'])).toBe(true);
    expect(isFileTypeAccepted(file, ['application/*'])).toBe(false);
  });

  test('matches file extensions', () => {
    const file = createFile('photo.JPG', 'image/jpeg');
    expect(isFileTypeAccepted(file, ['.jpg'])).toBe(true);
    expect(isFileTypeAccepted(file, ['.jpeg'])).toBe(false);
    expect(isFileTypeAccepted(file, ['.png'])).toBe(false);
  });

  test('ignores case in acceptedTypes', () => {
    const file = createFile('photo.jpg', 'image/jpeg');
    expect(isFileTypeAccepted(file, ['.JPG', 'IMAGE/*'])).toBe(true);
  });

  test('does not match extension if only MIME type matches', () => {
    const file = createFile('photo.jpg', 'image/jpeg');
    expect(isFileTypeAccepted(file, ['.png'])).toBe(false);
  });

  test('matches application/pdf MIME type', () => {
    const file = createFile('document.pdf', 'application/pdf');

    expect(isFileTypeAccepted(file, ['application/pdf'])).toBe(true);
    expect(isFileTypeAccepted(file, ['application/*'])).toBe(true);
    expect(isFileTypeAccepted(file, ['.pdf'])).toBe(true);
    expect(isFileTypeAccepted(file, ['image/*'])).toBe(false);
  });

  test('handles PDF file without extension', () => {
    const file = createFile('document', 'application/pdf');

    expect(isFileTypeAccepted(file, ['application/pdf'])).toBe(true);
    expect(isFileTypeAccepted(file, ['application/*'])).toBe(true);
    expect(isFileTypeAccepted(file, ['.pdf'])).toBe(false);
  });

  test('handles PNG file without extension', () => {
    const file = createFile('image', 'image/png');

    expect(isFileTypeAccepted(file, ['image/png'])).toBe(true);
    expect(isFileTypeAccepted(file, ['image/*'])).toBe(true);
    expect(isFileTypeAccepted(file, ['.png'])).toBe(false);
  });
});
