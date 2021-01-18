import { BuilderContext, createBuilder } from '@angular-devkit/architect';
import { Schema } from './schema';
import semanticRelease, { Commit, PluginSpec } from 'semantic-release';
import { WritableStreamBuffer } from 'stream-buffers';
import { BuilderOutput } from '@angular-devkit/architect/src/api';

export async function runRelease(
  { npm: { pkgRoot }, dryRun, publishable }: Schema,
  builderContext: BuilderContext
): Promise<BuilderOutput> {
  const { project } = builderContext.target;

  const { outputPath } = await builderContext
    .getTargetOptions({
      project,
      target: 'build'
    })
    .catch(() => ({ outputPath: null }));

  const publishPath = outputPath ?? pkgRoot;

  if (publishable && !publishPath) {
    return {
      success: false,
      error: `Builder can't detect output path for the '${project}' project automatically. Please, provide the 'npm.pkgRoot' option`
    };
  } else if (publishable) {
    builderContext.logger.info(
      `The directory ${publishPath} will be used for publishing`
    );
  }

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
      dryRun,
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
        [
          '@semantic-release/release-notes-generator',
          {
            writerOpts: {
              transform(commit, context): void | Commit {
                let discard = true;
                const issues = [];

                commit.notes.forEach(note => {
                  note.title = `BREAKING CHANGES`;
                  discard = false;
                });

                if (commit.type === `feat`) {
                  commit.type = `Features`;
                } else if (commit.type === `fix`) {
                  commit.type = `Bug Fixes`;
                } else if (commit.type === `perf`) {
                  commit.type = `Performance Improvements`;
                } else if (commit.type === `revert` || commit.revert) {
                  commit.type = `Reverts`;
                } else if (discard) {
                  return;
                } else if (commit.type === `docs`) {
                  commit.type = `Documentation`;
                } else if (commit.type === `style`) {
                  commit.type = `Styles`;
                } else if (commit.type === `refactor`) {
                  commit.type = `Code Refactoring`;
                } else if (commit.type === `test`) {
                  commit.type = `Tests`;
                } else if (commit.type === `build`) {
                  commit.type = `Build System`;
                } else if (commit.type === `ci`) {
                  commit.type = `Continuous Integration`;
                }

                if (commit.scope === `*`) {
                  commit.scope = ``;
                }

                if (typeof commit.hash === `string`) {
                  commit.shortHash = commit.hash.substring(0, 7);
                }

                if (typeof commit.subject === `string`) {
                  let url = context.repository
                    ? `${context.host}/${context.owner}/${context.repository}`
                    : context.repoUrl;
                  if (url) {
                    url = `${url}/issues/`;
                    // Issue URLs.
                    commit.subject = commit.subject.replace(
                      /#([0-9]+)/g,
                      (_, issue) => {
                        issues.push(issue);
                        return `[#${issue}](${url}${issue})`;
                      }
                    );
                  }
                  if (context.host) {
                    // User URLs.
                    commit.subject = commit.subject.replace(
                      /\B@([a-z0-9](?:-?[a-z0-9/]){0,38})/g,
                      (_, username) => {
                        if (username.includes('/')) {
                          return `@${username}`;
                        }

                        return `[@${username}](${context.host}/${username})`;
                      }
                    );
                  }
                }

                commit.references = commit.references.filter(reference => {
                  return issues.indexOf(reference.issue) === -1;
                });

                if (commit.scope !== project && commit.scope !== '') {
                  return;
                }

                return commit;
              }
            }
          }
        ],
        publishable
          ? ['@semantic-release/npm', { pkgRoot: publishPath }]
          : null,
        [
          '@semantic-release/github',
          {
            successComment: `:tada: This \${issue.pull_request ? 'pull request' : 'issue'} is included in version ${project}@\${nextRelease.version} :tada:

The release is available on [GitHub release](<github_release_url>)`,
            releasedLabels: [
              `released<%= nextRelease.channel ? " on @\${nextRelease.channel}" : "" %>`,
              project
            ]
          }
        ]
      ].filter(plugin => !!plugin) as PluginSpec[]
    },
    {
      env: { ...process.env },
      cwd: '.',
      stderr: stderrBuffer as any,
      stdout: stdoutBuffer as any
    }
  )
    .then(result => {
      if (result) {
        const {
          nextRelease: { version }
        } = result;

        builderContext.logger.info(
          `The '${project}' project released with version ${version}`
        );
      } else {
        builderContext.logger.info(
          `No new release for the '${project}' project`
        );
      }

      const errors = stderrBuffer.getContentsAsString('utf8');

      if (errors) {
        builderContext.logger.error(errors);
      }

      return { success: true };
    })
    .catch(err => {
      builderContext.logger.error(err);

      return {
        success: false,
        error: `The automated release failed with error: ${err}`
      };
    });
}

export const FirebaseDeployBuilder = createBuilder(runRelease);

export default FirebaseDeployBuilder;
