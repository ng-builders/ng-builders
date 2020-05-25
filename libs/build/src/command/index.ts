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
  return command(input.command, { stdio: 'pipe' })
    .then(({ stdout }) => {
      _context.logger.info(stdout);

      return {
        success: true,
        stdout
      };
    })
    .catch(error => ({ error: error.toString(), success: false }));
}

export const CommandBuilder = createBuilder(runCommand);

export default CommandBuilder;
