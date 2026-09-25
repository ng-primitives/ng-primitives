import { DOCUMENT } from '@angular/common';
import { computed, ElementRef, inject, Injector, Signal } from '@angular/core';
import { attrBinding, listener } from 'ng-primitives/state';
import { onBooleanChange } from 'ng-primitives/utils';
import { NgpFilePasteTarget } from './file-drop-filter';

/**
 * Capture files pasted on the host (while focused) or anywhere in the document.
 */
export function filePaste(
  element: ElementRef<HTMLElement>,
  paste: Signal<NgpFilePasteTarget>,
  disabled: () => boolean,
  onFiles: (files: FileList) => void,
): void {
  const document = inject(DOCUMENT);
  const injector = inject(Injector);

  function onPaste(event: ClipboardEvent, target: 'host' | 'document'): void {
    // a host-mode instance that handled the paste first wins over document-mode ones
    if (paste() !== target || disabled() || event.defaultPrevented) {
      return;
    }

    // pastes into a text field or rich-text editor belong to that field
    if (isEditable(event.target)) {
      return;
    }

    const files = event.clipboardData?.files;

    // leave text pastes alone
    if (!files?.length) {
      return;
    }

    event.preventDefault();
    onFiles(files);
  }

  listener(element, 'paste', event => onPaste(event, 'host'));

  // paste is off by default, so only hold a document listener while it is actually in use
  let removeDocumentListener: (() => void) | undefined;

  function addDocumentListener(): void {
    removeDocumentListener = listener(document, 'paste', event => onPaste(event, 'document'), {
      injector,
    });
  }

  onBooleanChange(
    computed(() => paste() === 'document'),
    addDocumentListener,
    () => removeDocumentListener?.(),
  );

  // a paste only fires on the focused element, so a plain div needs to become focusable,
  // but never override an element that is already focusable or a tabindex the consumer set
  const host = element.nativeElement;
  if (!host.hasAttribute('tabindex') && !(host.tabIndex >= 0)) {
    attrBinding(element, 'tabindex', () => (paste() === 'host' && !disabled() ? 0 : null));
  }
}

function isEditable(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  );
}
