import { JsonObject } from '@angular/compiler-cli/ngcc/src/packages/entry_point';

export interface Target extends JsonObject {
  deps?: string[];
  target: string;
  watch?: boolean;
  overrides?: { [key: string]: any };
}

export interface Targets extends JsonObject {
  [targetId: string]: Target;
}

export interface Schema extends JsonObject {
  steps: string[];
  targets: Targets;
}
