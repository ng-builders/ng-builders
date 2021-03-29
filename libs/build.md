# @ng-builders/build

### @ng-builders/build:command

> The builder to run commands in the terminal

```javascript
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

```javascript
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

