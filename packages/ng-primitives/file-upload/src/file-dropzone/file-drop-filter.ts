import { BooleanInput } from '@angular/cdk/coercion';

/**
 * Why a file was rejected.
 */
export type NgpFileRejectionReason = 'type' | 'size' | 'count';

/**
 * A file that failed validation, with every rule it broke.
 */
export interface NgpFileRejection {
  readonly file: File;
  readonly reasons: NgpFileRejectionReason[];
}

/**
 * Where pasted files are captured: on the focused host element, anywhere in the document, or not at all.
 */
export type NgpFilePasteTarget = false | 'host' | 'document';

export interface NgpFileValidationOptions {
  fileTypes: string[] | undefined;
  maxFileSize: number | undefined;
  multiple: boolean;
}

export function validateFiles(
  fileList: FileList,
  { fileTypes, maxFileSize, multiple }: NgpFileValidationOptions,
): { accepted: File[]; rejections: NgpFileRejection[] } {
  const accepted: File[] = [];
  const rejections: NgpFileRejection[] = [];

  for (const file of Array.from(fileList)) {
    const reasons: NgpFileRejectionReason[] = [];

    if (!isFileTypeAccepted(file, fileTypes)) {
      // folder uploads carry OS files like .DS_Store - drop them quietly rather than report them
      if (file.webkitRelativePath && file.name.startsWith('.')) {
        continue;
      }
      reasons.push('type');
    }

    // a NaN limit (e.g. an empty attribute) compares false, so it means no limit
    if (file.size > (maxFileSize ?? Infinity)) {
      reasons.push('size');
    }

    if (reasons.length === 0 && !multiple && accepted.length > 0) {
      reasons.push('count');
    }

    if (reasons.length) {
      rejections.push({ file, reasons });
    } else {
      accepted.push(file);
    }
  }

  return { accepted, rejections };
}

export function isFileTypeAccepted(file: File, acceptedTypes: string[] | undefined) {
  // allow all file types if no types are specified
  if (!acceptedTypes || acceptedTypes.length === 0) return true;

  const mimeType = file.type;
  const fileName = file.name.toLowerCase();

  return acceptedTypes.some(type => {
    type = type.toLowerCase();

    if (type.startsWith('.')) {
      return fileName.endsWith(type);
    }

    if (type.endsWith('/*')) {
      const baseType = type.replace('/*', '');
      return mimeType.startsWith(baseType);
    }

    return mimeType === type;
  });
}

export function filesToFileList(files: File[]): FileList {
  const dataTransfer = new DataTransfer();
  files.forEach(file => dataTransfer.items.add(file));
  return dataTransfer.files;
}

export function coercePasteTarget(value: BooleanInput | NgpFilePasteTarget): NgpFilePasteTarget {
  if (value === 'document' || value === 'host') {
    return value;
  }

  if (value === '' || value === true || value === 'true') {
    return 'host';
  }

  if (ngDevMode && value != null && value !== false && value !== 'false') {
    console.warn(
      `[ng-primitives] Unknown paste target "${value}". Expected 'host', 'document' or a boolean.`,
    );
  }

  return false;
}
