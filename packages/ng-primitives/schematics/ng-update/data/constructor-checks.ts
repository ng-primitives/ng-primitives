import { ConstructorChecksUpgradeData } from '@angular/cdk/schematics';
import { NgpVersionChanges } from './changeset';

/**
 * List of class names for which the constructor signature has been changed. The new constructor
 * signature types don't need to be stored here because the signature will be determined
 * automatically through type checking.
 */
export const constructorChecks: NgpVersionChanges<ConstructorChecksUpgradeData> = {};
