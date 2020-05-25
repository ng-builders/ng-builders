import {
  BuilderContext,
  BuilderOutputLike,
  createBuilder
} from '@angular-devkit/architect';
import { Schema } from './schema';
import { command } from 'execa';

export function runCommand(
  input: Schema,
  _context: BuilderContext
): BuilderOutputLike {
  return command(input.command, { stdio: 'inherit' })
    .then(() => ({
      success: true
    }))
    .catch(error => ({ error: error.toString(), success: false }));
}

export default createBuilder(runCommand);
