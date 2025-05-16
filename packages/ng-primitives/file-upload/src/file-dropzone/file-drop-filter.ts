export function fileDropFilter(
  fileList: FileList,
  acceptedTypes: string[] | undefined,
  multiple: boolean,
) {
  const validFiles = Array.from(fileList).filter(file => isFileTypeAccepted(file, acceptedTypes));

  const limitedFiles = multiple ? validFiles : validFiles.slice(0, 1);

  return limitedFiles.length > 0 ? filesToFileList(limitedFiles) : null;
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

function filesToFileList(files: File[]): FileList {
  const dataTransfer = new DataTransfer();
  files.forEach(file => dataTransfer.items.add(file));
  return dataTransfer.files;
}
