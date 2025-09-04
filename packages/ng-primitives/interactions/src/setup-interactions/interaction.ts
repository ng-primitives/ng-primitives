/**
 * This function checks to see if a given interaction has already been setup on a given element.
 * If it has, it returns the existing interaction state.
 * If it has not, it sets up the interaction state for future checks.
 */
export function hasInteraction(element: HTMLElement, interaction: string): boolean {
  const hasInteraction = `__ngp-${interaction}` in element;

  // if the interaction has not been setup, we mark it as setup for future checks
  if (!hasInteraction) {
    (element as unknown as Record<string, unknown>)[`__ngp-${interaction}`] = true;
  }

  return hasInteraction;
}
