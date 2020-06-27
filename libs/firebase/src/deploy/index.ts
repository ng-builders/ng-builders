import {
  BuilderContext,
  BuilderOutputLike,
  createBuilder
} from '@angular-devkit/architect';
import { Schema } from './schema';
import { runCommand } from '@ng-builders/build';

function coerceArray<T>(value: any): T[] {
  return Array.isArray(value) ? value : [value];
}

function buildCommand(input: Schema): string {
  return Object.keys(input)
    .filter(key => !!input[key])
    .reduce((command: string, key: string) => {
      return `${command} --${key} ${coerceArray(input[key]).join(',')}`;
    }, 'firebase deploy');
}

export function runDeploy(
  input: Schema,
  context: BuilderContext
): BuilderOutputLike {
  return runCommand({ command: buildCommand(input) }, context);
}

export const FirebaseDeployBuilder = createBuilder(runDeploy);

export default FirebaseDeployBuilder;
