import { DOCUMENT } from '@angular/common';
import { afterNextRender, computed, ElementRef, inject, Injector, Signal } from '@angular/core';
import { listener } from 'ng-primitives/state';
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

  // A paste only fires on the focused element, so a plain div needs to become focusable.
  // Not `attrBinding`: its `null` would strip a tabindex the consumer binds. Wait for the first
  // render so their bindings are applied, only add one when none is present, and only remove ours.
  const host = element.nativeElement;
  let ownsTabIndex = false;

  afterNextRender(
    () =>
      onBooleanChange(
        computed(() => paste() === 'host' && !disabled()),
        () => {
          if (!host.hasAttribute('tabindex') && !(host.tabIndex >= 0)) {
            host.setAttribute('tabindex', '0');
            ownsTabIndex = true;
          }
        },
        () => {
          if (ownsTabIndex) {
            host.removeAttribute('tabindex');
            ownsTabIndex = false;
          }
        },
        { injector },
      ),
    { injector },
  );
}

function isEditable(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  );
}
