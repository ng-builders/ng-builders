// prettier-ignore
jest.doMock('execa', () => () =>
  Promise.resolve({
    stdout: `
v1.0
tag
semrel@0.0.0
semrel@0.0.0-rc.1
semrel@0.0.0-rc.2
semrel@0.0.0-rc.5
semrel@0.0.1
semrel@1.0.0
semrel@2.0.0-beta.5
firebase@0.0.0
firebase@0.0.0-rc.1
firebase@0.0.0-rc.2
firebase@0.0.0-rc.5
firebase@0.0.1
firebase@1.0.0
firebase@2.0.0-beta.5
`
  })
);
// prettier-ignore
jest.doMock('fs', () => ({
  readFileSync: jest.fn().mockImplementation(() => {
    return `
{
  "dependencies": {
    "@ng-builders/semrel": "0.0.0-development"
  },
  "devDependencies": {
    "@ng-builders/builder": "1.0.0"
  },
  "peerDependencies": {
    "@ng-builders/firebase": "0.0.0-development"
  }
}
    `;
  }),
  writeFileSync: jest.fn()
}));

import { writeFileSync } from 'fs';
import { getSortedVersions, getTags, prepare } from './prepare';
import { Context } from 'semantic-release';

describe('getTags', () => {
  it('should return parsed tags', async () => {
    expect(await getTags('master')).toStrictEqual([
      {
        channel: 'stable',
        project: 'v1.0',
        version: 'v1.0'
      },
      {
        channel: 'stable',
        project: 'tag',
        version: 'tag'
      },
      {
        channel: 'stable',
        project: 'semrel',
        version: '0.0.0'
      },
      {
        channel: 'rc',
        project: 'semrel',
        version: '0.0.0-rc.1'
      },
      {
        channel: 'rc',
        project: 'semrel',
        version: '0.0.0-rc.2'
      },
      {
        channel: 'rc',
        project: 'semrel',
        version: '0.0.0-rc.5'
      },
      {
        channel: 'stable',
        project: 'semrel',
        version: '0.0.1'
      },
      {
        channel: 'stable',
        project: 'semrel',
        version: '1.0.0'
      },
      {
        channel: 'beta',
        project: 'semrel',
        version: '2.0.0-beta.5'
      },
      {
        channel: 'stable',
        project: 'firebase',
        version: '0.0.0'
      },
      {
        channel: 'rc',
        project: 'firebase',
        version: '0.0.0-rc.1'
      },
      {
        channel: 'rc',
        project: 'firebase',
        version: '0.0.0-rc.2'
      },
      {
        channel: 'rc',
        project: 'firebase',
        version: '0.0.0-rc.5'
      },
      {
        channel: 'stable',
        project: 'firebase',
        version: '0.0.1'
      },
      {
        channel: 'stable',
        project: 'firebase',
        version: '1.0.0'
      },
      {
        channel: 'beta',
        project: 'firebase',
        version: '2.0.0-beta.5'
      }
    ]);
  });
});

describe('getSortedVersions', () => {
  it('should filter and sort versions', () => {
    expect(
      getSortedVersions(
        [
          {
            channel: 'stable',
            project: 'v1.0',
            version: 'v1.0'
          },
          {
            channel: 'stable',
            project: 'tag',
            version: 'tag'
          },
          {
            channel: 'stable',
            project: 'semrel',
            version: '0.0.0'
          },
          {
            channel: 'rc',
            project: 'semrel',
            version: '0.0.0-rc.1'
          },
          {
            channel: 'rc',
            project: 'semrel',
            version: '0.0.0-rc.2'
          },
          {
            channel: 'rc',
            project: 'semrel',
            version: '0.0.0-rc.5'
          },
          {
            channel: 'stable',
            project: 'semrel',
            version: '0.0.1'
          },
          {
            channel: 'stable',
            project: 'semrel',
            version: '1.0.0'
          },
          {
            channel: 'beta',
            project: 'semrel',
            version: '2.0.0-beta.5'
          },
          {
            channel: 'stable',
            project: 'firebase',
            version: '0.0.0'
          },
          {
            channel: 'rc',
            project: 'firebase',
            version: '0.0.0-rc.1'
          },
          {
            channel: 'rc',
            project: 'firebase',
            version: '0.0.0-rc.2'
          },
          {
            channel: 'rc',
            project: 'firebase',
            version: '0.0.0-rc.5'
          },
          {
            channel: 'stable',
            project: 'firebase',
            version: '0.0.1'
          },
          {
            channel: 'stable',
            project: 'firebase',
            version: '1.0.0'
          },
          {
            channel: 'beta',
            project: 'firebase',
            version: '2.0.0-beta.5'
          }
        ],
        { project: 'firebase' }
      )
    ).toStrictEqual(['1.0.0', '0.0.1', '0.0.0']);
  });
});

describe('prepare', () => {
  beforeEach(() => {
    ((writeFileSync as unknown) as jest.SpyInstance).mockReset();
  });

  it('should update versions to stable', async () => {
    await prepare({ publishPath: '' }, ({
      branch: { name: 'branch' }
    } as unknown) as Context);

    expect(writeFileSync).toBeCalledWith(
      'package.json',
      `{
  "dependencies": {
    "@ng-builders/semrel": "1.0.0"
  },
  "devDependencies": {
    "@ng-builders/builder": "1.0.0"
  },
  "peerDependencies": {
    "@ng-builders/firebase": "1.0.0"
  }
}`
    );
  });

  it('should update version to rc', async () => {
    await prepare({ publishPath: '' }, ({
      branch: { name: 'branch', channel: 'rc' }
    } as unknown) as Context);

    expect(writeFileSync).toBeCalledWith(
      'package.json',
      `{
  "dependencies": {
    "@ng-builders/semrel": "0.0.0-rc.5"
  },
  "devDependencies": {
    "@ng-builders/builder": "1.0.0"
  },
  "peerDependencies": {
    "@ng-builders/firebase": "0.0.0-rc.5"
  }
}`
    );
  });
});
