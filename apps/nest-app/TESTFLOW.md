# Test flow (nest-app)

This app uses **two test runners**: **Vitest** for fast unit tests next to source files, and **Jest** for end-to-end HTTP tests under `test/`. Both use Nest’s `Test.createTestingModule` and `@nestjs/testing`.

## Commands

From `apps/nest-app`:

| Command | Purpose |
| --- | --- |
| `pnpm test` | Vitest once (CI-style). |
| `pnpm test:watch` | Vitest watch mode while developing. |
| `pnpm test:cov` | Vitest with V8 coverage under `./coverage`. |
| `pnpm test:e2e` | Jest e2e (`test/**/*.e2e-spec.ts`). |

From the monorepo root:

```bash
pnpm --filter nest-app test
pnpm --filter nest-app test:watch
pnpm --filter nest-app test:cov
pnpm --filter nest-app test:e2e
```

## Unit tests (Vitest)

### Discovery and config

- **Glob:** `src/**/*.spec.ts` (see `vitest.config.ts`).
- **Environment:** Node.
- **Transform:** SWC via `unplugin-swc` (aligned with Nest/TypeScript).
- **Setup:** `vitest.setup.ts` registers a global `mock` helper from `vitest-mock-extended`.
- **Types:** `test.d.ts` augments globals with `mock` and `Mocked<T>`.

### Typical flow

1. **Arrange:** `Test.createTestingModule({ ... }).compile()`.
2. **Inject:** `module.get<T>(Token)` for the class under test and mocked collaborators.
3. **Act / assert:** Use `expect` (Vitest globals are enabled).

Services and collaborators are often provided with `useValue: mock<SomeService>()` so calls are spied without a real database.

### Coverage

Coverage includes `src/**/*.(t|j)s` but excludes specs, `*.module.ts`, and `main.ts` (see `vitest.config.ts` `coverage` block). Open `coverage/index.html` after `pnpm test:cov` for the HTML report.

## End-to-end tests (Jest)

### Discovery and config

- **Config:** `test/jest-e2e.json`.
- **Glob:** files matching `.e2e-spec.ts` under `test/`.
- **Transform:** `ts-jest`.

### Typical flow

1. Build a `TestingModule` that **imports `AppModule`** (full app wiring, including TypeORM and SQLite when configured).
2. `createNestApplication()` and `init()`.
3. Use **Supertest** against `app.getHttpServer()` for real HTTP status and body checks.

Growing the e2e suite usually means adding scenarios in `test/*.e2e-spec.ts` or splitting by feature, and optionally using a dedicated test database or overrides if tests must not share `db.sqlite` with development.

## Suggested workflow before you push

1. `pnpm test` — unit suite green.
2. `pnpm test:e2e` — smoke the booted app and HTTP layer.
3. Optionally `pnpm test:cov` — confirm new code is exercised.

## Where to add tests

| Kind | Location | Runner |
| --- | --- | --- |
| Unit (service, controller, pipes, guards) | `src/**/<name>.spec.ts` | Vitest |
| E2E (routes, filters, global middleware) | `test/**/*.e2e-spec.ts` | Jest |

Keep unit tests focused on one class or small collaboration graph; reserve full-stack checks for e2e.
