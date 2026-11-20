import { NGP_DRAWER_CSS_VARIABLES } from '../drawer.constants';

export function initializeDrawerVisualProperties(element: HTMLElement): void {
  setDefaultProperty(element, NGP_DRAWER_CSS_VARIABLES.swipeMovementX, '0px');
  setDefaultProperty(element, NGP_DRAWER_CSS_VARIABLES.swipeMovementY, '0px');
  setDefaultProperty(element, NGP_DRAWER_CSS_VARIABLES.swipeProgress, '0');
  setDefaultProperty(element, NGP_DRAWER_CSS_VARIABLES.swipeStrength, '1');
}

function setDefaultProperty(element: HTMLElement, name: string, value: string): void {
  if (!element.style.getPropertyValue(name)) {
    element.style.setProperty(name, value);
  }
}
