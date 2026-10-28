function getScrollableAncestor(element: HTMLElement): HTMLElement | null {
  let parent = element.parentElement;
  while (parent) {
    const style = window.getComputedStyle(parent);
    if (/(auto|scroll)/.test(style.overflowY) || /(auto|scroll)/.test(style.overflowX)) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return null;
}

export function scrollIntoViewIfNeeded(element: HTMLElement): void {
  const scrollableAncestor = getScrollableAncestor(element);
  if (!scrollableAncestor) return;

  const parentRect = scrollableAncestor.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();

  // rects are in visual pixels but scroll offsets are layout pixels, so undo any transform
  // scale (e.g. a scaled entrance animation) or the scroll falls short
  const scaleY = scrollableAncestor.offsetHeight
    ? parentRect.height / scrollableAncestor.offsetHeight
    : 1;
  const scaleX = scrollableAncestor.offsetWidth
    ? parentRect.width / scrollableAncestor.offsetWidth
    : 1;

  if (elementRect.top < parentRect.top) {
    scrollableAncestor.scrollTop -= (parentRect.top - elementRect.top) / scaleY;
  } else if (elementRect.bottom > parentRect.bottom) {
    scrollableAncestor.scrollTop += (elementRect.bottom - parentRect.bottom) / scaleY;
  }

  if (elementRect.left < parentRect.left) {
    scrollableAncestor.scrollLeft -= (parentRect.left - elementRect.left) / scaleX;
  } else if (elementRect.right > parentRect.right) {
    scrollableAncestor.scrollLeft += (elementRect.right - parentRect.right) / scaleX;
  }
}
