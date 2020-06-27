# @ng-builders

![GitHub](https://img.shields.io/github/license/ng-builders/ng-builders)
[![npm (scoped with tag)](https://img.shields.io/npm/v/@ng-builders/build/latest)](https://www.npmjs.com/package/@ng-builders/build)

The repository contains custom Angular CLI builders for different tasks. Over time, their number will increase.

<p align="center">
  <img src="./apps/sandbox/src/assets/logo.png" alt="Logo">
</p>

## List of builders

- [@ng-builders/build:command](#user-content-ng-buildersbuildcommand)
- [@ng-builders/build:stepper](#user-content-ng-buildersbuildstepper)

### @ng-builders/build:command
> The builder to run commands in the terminal

```json
{
  "target": {
    "builder": "@ng-builders/build:command",
    "options": {
      "command": "node -v"
    }
  }
}
```
### @ng-builders/build:stepper

> A builder for sequentially launching the commands described in `angular.json`

```json
{
  "test": {
    "builder": "@ng-builders/build:stepper",
    "options": {
      "targets": {
        "jest": {
          "target": "app:jest",
          "deps": ["server"]
        },
        "server": {
          "target": "app:serve",
          "watch": true
        }
      },
      "steps": ["jest"]
    }
  },
  "jest": {
    "builder": "@nrwl/jest:jest",
    "options": {
      "jestConfig": "apps/app/jest.config.js",
      "tsConfig": "apps/app/tsconfig.spec.json",
      "passWithNoTests": true
    }
  },
  "serve": {
    "builder": "@nrwl/web:dev-server",
    "options": {
      "buildTarget": "app:build"
    }
  }
}
```