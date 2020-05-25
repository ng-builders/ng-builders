import { Architect } from '@angular-devkit/architect';
import { TestingArchitectHost } from '@angular-devkit/architect/testing';
import { schema } from '@angular-devkit/core';
import CommandBuilder from './index';

describe('Command Runner Builder', () => {
  let architect: Architect;
  let architectHost: TestingArchitectHost;

  beforeEach(async () => {
    const registry = new schema.CoreSchemaRegistry();
    registry.addPostTransform(schema.transforms.addUndefinedDefaults);

    architectHost = new TestingArchitectHost(__dirname, __dirname);
    architect = new Architect(architectHost, registry);

    await architectHost.addBuilder(
      '@ng-builders/build:command',
      CommandBuilder
    );
  });

  it('can run node', async () => {
    const run = await architect.scheduleBuilder('@ng-builders/build:command', {
      command: `node --print 'foo'`
    });

    const result = await run.result;
    await run.stop();

    // Expect that foo was logged
    expect(result.stdout).toContain('foo');
  });
});
