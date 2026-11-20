import type { NgpPosition } from 'ng-primitives/portal';

// The styles that decide where text wraps and how wide it is, copied onto the mirror.
const mirroredProperties = [
  'direction',
  'boxSizing',
  'width',
  'height',
  'overflowX',
  'overflowY',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'borderStyle',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'fontStyle',
  'fontVariant',
  'fontWeight',
  'fontStretch',
  'fontSize',
  'fontSizeAdjust',
  'lineHeight',
  'fontFamily',
  'textAlign',
  'textTransform',
  'textIndent',
  'textDecoration',
  'letterSpacing',
  'wordSpacing',
  'tabSize',
] as const;

/**
 * The viewport position of the bottom-left corner of the character at `index`.
 *
 * Inputs and textareas don't expose text layout, so the text is laid out again in a hidden
 * element with the same styles, and the position is read from a marker at `index`. Adapted
 * from textarea-caret (MIT, https://github.com/component/textarea-caret-position).
 */
export function getCaretPosition(
  element: HTMLInputElement | HTMLTextAreaElement,
  index: number,
): NgpPosition {
  const document = element.ownerDocument;
  const style = getComputedStyle(element);
  const isInput = element.nodeName === 'INPUT';
  const mirror = document.createElement('div');

  for (const property of mirroredProperties) {
    mirror.style[property] = style[property];
  }

  mirror.style.position = 'absolute';
  mirror.style.visibility = 'hidden';
  mirror.style.top = '0';
  mirror.style.left = '-9999px';
  // an input never wraps, a textarea wraps like the mirror does
  mirror.style.whiteSpace = isInput ? 'pre' : 'pre-wrap';
  mirror.style.overflowWrap = isInput ? 'normal' : 'break-word';

  // The copied width already leaves out a textarea's scrollbar, so the mirror must not draw one,
  // except in Firefox, which reports a scrolling textarea's overflow as visible
  // (https://bugzilla.mozilla.org/show_bug.cgi?id=984275) and so needs the scrollbar back.
  const isFirefox = 'mozInnerScreenX' in (document.defaultView ?? {});
  if (isFirefox && element.scrollHeight > parseFloat(style.height)) {
    mirror.style.overflowY = 'scroll';
  } else if (!isFirefox) {
    mirror.style.overflow = 'hidden';
  }

  mirror.textContent = element.value.slice(0, index);
  const marker = document.createElement('span');
  // the marker needs content to have a height
  marker.textContent = element.value.slice(index) || '.';
  mirror.appendChild(marker);
  document.body.appendChild(mirror);

  // offsets start inside the border, the element's rect outside it
  const lineHeight = parseFloat(style.lineHeight) || marker.offsetHeight;
  const top = parseFloat(style.borderTopWidth) + marker.offsetTop + lineHeight;
  const left = parseFloat(style.borderLeftWidth) + marker.offsetLeft;
  mirror.remove();

  const rect = element.getBoundingClientRect();

  return {
    x: rect.left + left - element.scrollLeft,
    // an input centres its single line, so its bottom edge is the line's bottom
    y: isInput ? rect.bottom : rect.top + top - element.scrollTop,
  };
}
