import { UpgradeData } from '@angular/cdk/schematics';
import {
  attributeSelectors,
  classNames,
  constructorChecks,
  cssSelectors,
  cssTokens,
  elementSelectors,
  inputNames,
  methodCallChecks,
  outputNames,
  propertyNames,
  symbolRemoval,
} from './data';

/** Upgrade data that will be used for the Angular Primitives ng-update schematic. */
export const ngpUpgradeData = {
  attributeSelectors,
  classNames,
  constructorChecks,
  cssSelectors,
  cssTokens,
  elementSelectors,
  inputNames,
  methodCallChecks,
  outputNames,
  propertyNames,
  symbolRemoval,
} as UpgradeData;
