# `@yorganc/telegram-api`

Telegram Bot API docs are not published as OpenAPI. This project parses [Telegram's HTML documentation](https://core.telegram.org/bots/api) and generates a structured spec, eventually OpenAPI.

## Goal

Programmatically parse Telegram's API documentation and generate OpenAPI spec.

## Dependencies

This project uses `effect` library for building type-safe and reliable code. `effect` library version is v4 so refer to [`effect`](.vendor/effect/packages/effect/package.json) for implementation. Refer to this document instead of your offline knowledge of `effect` library or any online documentation. Always refer to actually vendored version of `effect` library for implementation. For platform layer `effect/unstable/*` modules, refer to [`@effect/platform-node`](.vendor/effect/packages/platform-node/package.json) for implementation.

HTML parsing uses `node-html-parser`.

## Pipeline

Parse the **sanitized local snapshot** (`spec/api.html`), not the live URL.

```sh
pnpm ingest:fetch   # fetch → normalize → verify hash → write HTML
pnpm ingest:parse   # parse HTML → write JSON spec
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
| Errors  | (integration tests) | `spec/errors/{name}.json`    |

Each `h4[id]` under a section is a block. Classification is by shape, not naming:

- Field table (`Field` / `Type` / `Description`) → object
- Parameter table or method prose (`Requires no parameters`, `Use this method`) → method
- “can be one of” + list → union (skipped for now)

Shared parsers: `parse-type-expr.ts` (primitives, refs, arrays, `oneOf`), `walk-block.ts` (collect section until next heading).

## Spec IR (`scripts/parse/model.ts`)

**`TypeExpr`:** `integer`, `float`, `string`, `boolean`, `file`, `literal`, `ref`, `array`, `oneOf`

**Object:** `{ kind: "object", name, slug, description, fields[] }`

**Method:** `{ kind: "method", name, slug, description, parameters[], returns, notes? }`

Method return types are inferred from prose (`parse-return-type.ts`): ref links, `Returns True`, `Returns Int`, `as String`, `Message | True`, etc.

## Layout

Parsed `spec/schema/`, `spec/endpoints/`, and `spec/*.html` are gitignored; `spec/errors/` is tracked (integration test catalog).

```text
spec/
  api.raw.html
  api.html
  schema/    # ~201 JSON files (generated)
  endpoints/ # ~129 JSON files (generated)
  errors/    # error catalog + per-method tags (tracked)
```

Config and paths: `scripts/document.ts`.
