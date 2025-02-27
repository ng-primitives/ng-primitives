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

  if (elementRect.top < parentRect.top) {
    scrollableAncestor.scrollTop -= parentRect.top - elementRect.top;
  } else if (elementRect.bottom > parentRect.bottom) {
    scrollableAncestor.scrollTop += elementRect.bottom - parentRect.bottom;
  }

  if (elementRect.left < parentRect.left) {
    scrollableAncestor.scrollLeft -= parentRect.left - elementRect.left;
  } else if (elementRect.right > parentRect.right) {
    scrollableAncestor.scrollLeft += elementRect.right - parentRect.right;
  }
}
