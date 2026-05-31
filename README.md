# `@yorganci/effect-telegram-api`

Type-safe Telegram Bot API client built with [Effect](https://effect.website). Method definitions, request payloads, response schemas, and documented API errors are generated from a pinned snapshot of [Telegram's official API documentation](https://core.telegram.org/bots/api).

## Install

```sh
# npm
npm install @yorganci/effect-telegram-api effect

# pnpm
pnpm add @yorganci/effect-telegram-api effect

# yarn
yarn add @yorganci/effect-telegram-api effect

# bun
bun add @yorganci/effect-telegram-api effect

# Deno & JSR
deno add jsr:@yorganci/effect-telegram-api
```

This package targets Effect v4 and uses `effect/unstable/httpapi` (`HttpApi`, `HttpApiGroup`, `HttpApiEndpoint`) for the wire contract. Pair it with `@effect/platform-node` (or `FetchHttpClient` from `effect/unstable/http`) for Node, Bun, Deno, or other runtimes.

## Exports

| Import                                  | Contents                                                                |
| --------------------------------------- | ----------------------------------------------------------------------- |
| `@yorganci/effect-telegram-api`         | `TelegramClient`, `Errors`, `TelegramHttpApi`, `Schema` namespaces      |
| `@yorganci/effect-telegram-api/Client`  | `TelegramClient`, `withToken`                                           |
| `@yorganci/effect-telegram-api/Errors`  | Tagged API errors (`BadRequest`, `Unauthorized`, `TelegramApiError`, …) |
| `@yorganci/effect-telegram-api/HttpApi` | `TelegramBotApi` and per-method endpoints                               |
| `@yorganci/effect-telegram-api/Schema`  | Generated Telegram object schemas and types                             |

## Usage

Provide a platform `HttpClient` layer and a bot token via `withToken`:

```ts
import { NodeHttpClient, NodeServices } from "@effect/platform-node";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { TelegramClient, withToken } from "@yorganci/effect-telegram-api/Client";

const platform = Layer.mergeAll(NodeServices.layer, NodeHttpClient.layerFetch);

const program = Effect.gen(function* () {
	const client = yield* TelegramClient;
	return yield* client.getMe();
}).pipe(Effect.provide(Layer.provideMerge(withToken(process.env.TELEGRAM_BOT_TOKEN!), platform)));

await Effect.runPromise(program);
```

Each client method returns an `Effect` that can fail with transport errors (`HttpClientError`), request validation (`SchemaError`), documented Telegram failures (e.g. `BadRequest` when listed in `spec/errors/{method}.json`), or `TelegramApiError` when Telegram returns `{ ok: false }` with a status not declared for that method.

You can also use `TelegramBotApi` directly with `HttpApiClient` if you need lower-level control over layers and error mapping.

## Development

```sh
pnpm install
pnpm scripts:fetch    # fetch and sanitize docs → spec/api.html
pnpm scripts:parse    # parse HTML → spec/schema, spec/endpoints
pnpm scripts:codegen  # generate src/
pnpm test             # live integration tests (needs .env)
```

## Acknowledgments

This approach to documenting API is inspired by [`alchemy-run/distilled`](https://github.com/alchemy-run/distilled) where agents are used to write parsers, code generators and tests to cover the whole API.
