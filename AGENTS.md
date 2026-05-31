# `@yorganci/effect-telegram-api`

Type-safe [Telegram Bot API](https://core.telegram.org/bots/api) client built with [Effect](https://effect.website) v4. Telegram does not publish OpenAPI; this repo ingests their HTML docs into a JSON spec, then codegen's TypeScript under `src/`.

## Layout

```text
spec/
  api.raw.html, api.html     # pinned doc snapshot (gitignored)
  schema/                    # object IR (~200 JSON files, gitignored)
  endpoints/                 # method IR (~170 JSON files, gitignored)
  errors/                    # HTTP status error catalog + per-method tags (tracked)
scripts/
  fetch.ts, parse.ts         # ingest pipeline
  codegen.ts                 # spec → src/
src/                         # generated client (do not hand-edit)
  schema.ts                  # Telegram object schemas
  http-api.ts                # HttpApi contract (TelegramBotApi)
  errors.ts                  # tagged API errors
  client/
    service.ts               # TelegramClient Context.Service interface
    live.ts                  # withToken layer + method implementations
    to-form.ts               # multipart form encoding (hand-maintained)
test/                        # live integration tests (one file per RPC method)
```

NEVER EDIT GENERATED FILES UNDER `spec/endpoints/*`, `spec/schema/*`, `src/` FILES. UPDATE THEM THROUGH `scripts/` CODEGEN SCRIPTS.

## Dependencies

This project uses `effect` library for building type-safe and reliable code. `effect` library version is v4 so refer to [`effect`](.vendor/effect/packages/effect/package.json) for implementation. Refer to this document instead of your offline knowledge of `effect` library or any online documentation. Always refer to actually vendored version of `effect` library for implementation. For platform layer `effect/unstable/*` modules, refer to [`@effect/platform-node`](.vendor/effect/packages/platform-node/package.json) for implementation.

HTML parsing uses `node-html-parser`.

## Pipeline

Work from the **sanitized local snapshot** (`spec/api.html`), not the live URL.

```sh
pnpm scripts:fetch    # fetch → normalize → verify hash → write HTML
pnpm scripts:parse    # parse HTML → spec/schema, spec/endpoints
pnpm scripts:codegen  # spec → src/schema.ts, src/http-api.ts, src/errors.ts, src/client/
```

### Fetch (`scripts/fetch*.ts`, `sanitize-document.ts`, `hash.ts`)

1. Fetch `https://core.telegram.org/bots/api`
2. Strip the dynamic generation comment (`normalize-document.ts`)
3. Sanitize to semantic HTML (`sanitize-document.ts`): extract `#dev_page_content`, normalize headings (`h4 id="slug"`), strip non-semantic attrs, deterministic output
4. Verify SHA-256 hash pinned in `scripts/document.ts`
5. Write `spec/api.raw.html` and `spec/api.html`

### Parse (`scripts/parse/`)

Section-scoped discovery via hardcoded `h3` ids:

| Section | `h3` id             | Output                       |
| ------- | ------------------- | ---------------------------- |
| Objects | `available-types`   | `spec/schema/{Name}.json`    |
| Methods | `available-methods` | `spec/endpoints/{name}.json` |
| Errors  | integration tests   | `spec/errors/{name}.json`    |

Each `h4[id]` under a section is a block. Classification is by shape, not naming:

- Field table (`Field` / `Type` / `Description`) → object
- Parameter table or method prose (`Requires no parameters`, `Use this method`) → method
- “can be one of” + list → union (skipped for now)

Shared parsers: `parse-type-expr.ts` (primitives, refs, arrays, `oneOf`), `walk-block.ts` (collect section until next heading).

### Codegen (`scripts/codegen/`)

Reads `spec/schema/`, `spec/endpoints/`, and `spec/errors/`. Writes:

| Output                  | Role                                                 |
| ----------------------- | ---------------------------------------------------- |
| `src/schema.ts`         | Effect schemas for Telegram types                    |
| `src/http-api.ts`       | `TelegramBotApi` (`HttpApi`, endpoints, wire codecs) |
| `src/errors.ts`         | Shared + per-method tagged errors                    |
| `src/client/service.ts` | `TelegramClient` method signatures                   |
| `src/client/live.ts`    | `withToken(token)` layer wiring `HttpApiClient`      |

## Spec IR (`scripts/parse/model.ts`)

**`TypeExpr`:** `integer`, `float`, `string`, `boolean`, `file`, `literal`, `ref`, `array`, `oneOf`

**Object:** `{ kind: "object", name, slug, description, fields[] }`

**Method:** `{ kind: "method", name, slug, description, parameters[], returns, notes? }`

Method return types are inferred from prose (`parse-return-type.ts`): ref links, `Returns True`, `Returns Int`, `as String`, `Message | True`, etc.

## Client and errors

- **`TelegramClient`** — one method per Bot API RPC; typed payloads and results from the spec.
- **`withToken(token)`** — `Layer` that binds `https://api.telegram.org/bot{token}` via `HttpApiClient.make(TelegramBotApi, …)`.
- **Error channels** — `HttpClientError`, `SchemaError`, documented HTTP status tags from `spec/errors/` (e.g. `BadRequest`), and `TelegramApiError` for undocumented `{ ok: false }` responses. Status tags map to Telegram `error_code` (400 → `BadRequest`), not description strings.

Do not edit generated files under `src/` except `src/client/to-form.ts`. Change `scripts/` or `spec/`, then re-run parse/codegen.

## Tests

Live integration tests call the real API. See [`test/README.md`](./test/README.md) for env vars, workflow, and contribution rules.

```sh
pnpm test          # vitest run (requires .env)
pnpm test:watch
```

## Agent rules

| Do                                                     | Don't                                               |
| ------------------------------------------------------ | --------------------------------------------------- |
| Fix parsers/codegen/spec/errors JSON                   | Hand-edit generated `src/` (except `to-form.ts`)    |
| Run `scripts:codegen` after spec or error JSON changes | Commit tests that expect tags codegen does not emit |
| Match existing test patterns in `test/`                | Invent new client or error APIs without codegen     |
