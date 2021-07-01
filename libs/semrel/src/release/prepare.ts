import { Context, PluginSpec } from 'semantic-release';
import execa from 'execa';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { from } from 'rxjs';
import { concatMap, filter } from 'rxjs/operators';
import semver from 'semver';

export interface Tag {
  version: string;
  channel: string | 'stable';
  project?: string;
}

export function parseTag(tag: string): Tag {
  const [project, version = project] = tag.split('@');

  const {
    prerelease: [channel = 'stable']
  } = semver.parse(version) ?? { prerelease: [] };

  return {
    project,
    version,
    channel: typeof channel === 'string' ? channel : undefined
  };
}

export async function getTags(branch: string): Promise<Tag[]> {
  const { stdout } = await execa('git', ['tag', '--merged', branch]);

  return stdout
    .split('\n')
    .map(tag => tag.trim())
    .filter(tag => !!tag)
    .map(parseTag);
}

export function getSortedVersions(
  tags: Tag[],
  { project, channel = 'stable' }: { project: string; channel?: string }
): string[] {
  const versions = tags
    .filter(tag => tag.project === project && tag.channel === channel)
    .map(tag => tag.version);

  if (channel !== 'stable' && !versions.length) {
    return getSortedVersions(tags, { project });
  }

  return semver.rsort(versions);
}

export async function analyzeCommits(
  { publishPath }: { publishPath: string },
  context: Context
): Promise<void> {
  const pckg = JSON.parse(
    readFileSync(join(publishPath, 'package.json')).toString()
  );

  await from(['dependencies', 'peerDependencies', 'devDependencies'])
    .pipe(
      filter(type => !!pckg[type]),
      concatMap((type: string) =>
        from(Object.entries(pckg[type])).pipe(
          filter(([, version]) => version === '0.0.0-development'),
          concatMap(async ([name]) => {
            const [, project = name] = name.split('/');

            const tags = await getTags((context as any).branch.name);
            const [latest] = await getSortedVersions(tags, {
              project,
              channel: (context as any).branch.channel
            });

            pckg[type][name] = latest;
          })
        )
      )
    )
    .toPromise();

  writeFileSync(
    join(publishPath, 'package.json'),
    JSON.stringify(pckg, null, 2)
  );
}

export function preparePlugin({
  publishable,
  publishPath
}: {
  publishable: boolean;
  publishPath: string;
}): PluginSpec | null {
  let plugin: string;

  try {
    require.resolve('@ng-builders/semrel');
    plugin = '@ng-builders/semrel';
  } catch (e) {
    plugin = './dist/libs/semrel';
  }

  return publishable ? [plugin, { publishPath }] : null;
}
