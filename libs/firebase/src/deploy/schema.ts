import { JsonObject } from '@angular/compiler-cli/ngcc/src/packages/entry_point';

export interface Schema extends JsonObject {
  /**
   * Override the Hosting public directory specified in firebase.json
   */
  public?: string;

  /**
   * An optional message describing this deploy
   */
  message?: string;

  /**
   * Only deploy to specified targets
   * (e.g. ["hosting", "storage"]). For functions, can specify
   * filters with colons to scope function deploys to
   * only those functions (e.g. ["functions:func1", "functions:func2"]).
   * When filtering based on export groups (the exported module object
   * keys), use dots to specify group names
   * (e.g. ["functions:group1.subgroup1", "functions:group2"])
   */
  only?: string[] | string;

  /**
   * Deploy to all targets except specified (e.g."database")
   */
  except?: string[] | string;
}
