import { strings } from '@angular-devkit/core';
import {
  FileEntry,
  Rule,
  apply,
  forEach,
  mergeWith,
  move,
  template,
  url,
} from '@angular-devkit/schematics';
import { AngularPrimitivesComponentSchema } from './schema';

export default function generatePrimitive(options: AngularPrimitivesComponentSchema): Rule {
  return () => {
    const templateSource = apply(url(`./templates/${options.primitive}`), [
      template({
        ...options,
        ...strings,
        prefix: options.prefix ?? 'app',
        fileSuffix: options.fileSuffix ?? 'component',
      }),
      forEach((fileEntry: FileEntry) => {
        if (fileEntry.path.endsWith('.template')) {
          let newPath = fileEntry.path.replace('.template', '');

          // if the file has two consecutive periods, replace them with a single period - this can happen if the fileSuffix is empty
          if (newPath.includes('..')) {
            newPath = newPath.replace('..', '.');
          }

          return {
            path: newPath,
            content: fileEntry.content,
          } as FileEntry;
        }
        return fileEntry;
      }),
      move(options.path),
    ]);

    return mergeWith(templateSource);
  };
}
