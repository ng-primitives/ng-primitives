import { Rule, SchematicContext } from '@angular-devkit/schematics';
import {
  createMigrationSchematicRule,
  NullableDevkitMigration,
  TargetVersion,
} from '@angular/cdk/schematics';
import { NgpTargetVersion } from './data/changeset';
import { ngpUpgradeData } from './upgrade-data';

const migrations: NullableDevkitMigration[] = [];

/** Entry point for the migration schematics with target of Angular Primitives v0.24.0 */
export function updateToV0_24_0(): Rule {
  return createMigrationSchematicRule(
    // we have to cast this as the enum only allows Angular versions, but it doesn't matter for us
    NgpTargetVersion.V0_24_0 as unknown as TargetVersion,
    migrations,
    ngpUpgradeData,
    onMigrationComplete,
  );
}

/** Function that will be called when the migration completed. */
function onMigrationComplete(
  context: SchematicContext,
  targetVersion: TargetVersion,
  hasFailures: boolean,
) {
  context.logger.info('');
  context.logger.info(`  ✓  Updated Angular Primitives to ${targetVersion}`);
  context.logger.info('');

  if (hasFailures) {
    context.logger.warn(
      '  ⚠  Some issues were detected but could not be fixed automatically. Please check the ' +
        'output above and fix these issues manually.',
    );
  }
}
