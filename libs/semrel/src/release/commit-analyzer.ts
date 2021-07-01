import { PluginSpec } from 'semantic-release';

export function commitAnalyzer({ project }: { project: string }): PluginSpec {
  return [
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
  ];
}
