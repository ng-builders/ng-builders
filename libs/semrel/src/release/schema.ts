import { JsonObject } from '@angular/compiler-cli/ngcc/src/packages/entry_point';

export interface Schema extends JsonObject {
  npm?: { pkgRoot?: string };
  dryRun?: boolean;
}
