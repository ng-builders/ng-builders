import {
  BuilderContext,
  BuilderOutputLike,
  createBuilder,
  scheduleTargetAndForget,
  targetFromTargetString
} from '@angular-devkit/architect';
import { Schema, Target, Targets } from './schema';
import { combineLatest, concat, noop, Observable, of, pipe } from 'rxjs';
import { catchError, concatMap, map, take, tap } from 'rxjs/operators';

function buildStep(
  stepName: string,
  targets: Targets,
  context: BuilderContext
): Observable<any> {
  const { deps = [], overrides, target, watch }: Target = targets[stepName];

  const deps$ = deps.length
    ? combineLatest(deps.map(depName => buildStep(depName, targets, context)))
    : of(null);

  return deps$.pipe(
    concatMap(() => {
      return scheduleTargetAndForget(context, targetFromTargetString(target), {
        watch,
        ...overrides
      });
    }),
    watch ? tap(noop) : take(1)
  );
}

function buildSteps(config: Schema, context: BuilderContext): Observable<any> {
  return concat(
    ...config.steps.map(step => buildStep(step, config.targets, context))
  );
}

export function runStepper(
  input: Schema,
  context: BuilderContext
): BuilderOutputLike {
  return buildSteps(input, context).pipe(
    map(() => ({
      success: true
    })),
    catchError(error => {
      return of({ error: error.toString(), success: false });
    })
  );
}

export default createBuilder(runStepper);
