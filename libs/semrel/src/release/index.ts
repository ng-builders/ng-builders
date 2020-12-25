import {
  BuilderContext,
  BuilderOutputLike,
  createBuilder
} from '@angular-devkit/architect';
import { Schema } from './schema';
import semanticRelease from 'semantic-release';
import { WritableStreamBuffer } from 'stream-buffers';

export function runRelease(
  { npm: { pkgRoot } }: Schema,
  context: BuilderContext
): BuilderOutputLike {
  const { project } = context.target;

  const stdoutBuffer = new WritableStreamBuffer();
  const stderrBuffer = new WritableStreamBuffer();

  return semanticRelease(
    {
      tagFormat: `${project}@\${version}`,
      branches: [
        '+([0-9])?(.{+([0-9]),x}).x',
        'master',
        'next',
        'next-major',
        { name: 'beta', prerelease: true },
        { name: 'alpha', prerelease: true }
      ],
      extends: undefined,
      dryRun: true,
      plugins: [
        [
          '@semantic-release/commit-analyzer',
          {
            releaseRules: [
              { type: 'feat', scope: project, release: 'minor' },
              { type: 'fix', scope: project, release: 'patch' },
              { type: 'perf', scope: project, release: 'patch' }
            ],
            parserOpts: {
              headerPattern: new RegExp(`^(\\w*)(?:\\((${project})\\))?: (.*)$`)
            }
          }
        ],
        '@semantic-release/release-notes-generator',
        ['@semantic-release/npm', { pkgRoot }],
        '@semantic-release/github'
      ]
    },
    {
      env: { ...process.env },
      cwd: '.',
      stderr: stderrBuffer as any,
      stdout: stdoutBuffer as any
    }
  ).then(result => {
    if (result) {
      const {
        nextRelease: { version }
      } = result;

      context.logger.info(
        `The '${project}' project released with version ${version}`
      );
    }

    return { success: true };
  });
}

export const FirebaseDeployBuilder = createBuilder(runRelease);

export default FirebaseDeployBuilder;
