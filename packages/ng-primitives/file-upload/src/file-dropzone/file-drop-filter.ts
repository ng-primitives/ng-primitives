export function fileDropFilter(
  fileList: FileList,
  acceptedTypes: string[] | undefined,
  multiple: boolean,
) {
  const validFiles = Array.from(fileList).filter(file => isFileTypeAccepted(file, acceptedTypes));

  const limitedFiles = multiple ? validFiles : validFiles.slice(0, 1);

  return limitedFiles.length > 0 ? filesToFileList(limitedFiles) : null;
}

function isFileTypeAccepted(file: File, acceptedTypes: string[] | undefined) {
  // allow all file types if no types are specified
  if (!acceptedTypes || acceptedTypes.length === 0) return true;

  return acceptedTypes.some(acceptedType => file.type.match(acceptedType));
}

function filesToFileList(files: File[]): FileList {
  const dataTransfer = new DataTransfer();
  files.forEach(file => dataTransfer.items.add(file));
  return dataTransfer.files;
}
