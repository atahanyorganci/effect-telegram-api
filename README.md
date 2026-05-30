# `@yorganci/effect-telegram-api`

Type-safe Telegram Bot API client built with [Effect](https://effect.website). Method definitions, request payloads, and response schemas are generated from [Telegram's official API documentation](https://core.telegram.org/bots/api).

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

This package targets Effect v4 and uses `effect/unstable/rpc/Rpc` and `effect/unstable/rpc/RpcGroup` for defining the API contract. Thus, it can be used with Node.js/Bun/Deno runtimes or even with `FetchHttpClient` from `effect/unstable/http` for browser or unconventional runtimes such as Cloudflare Workers.

## Exports

| Import                                  | Contents                                    |
| --------------------------------------- | ------------------------------------------- |
| `@yorganci/effect-telegram-api`         | Re-exports below                            |
| `@yorganci/effect-telegram-api/Client`  | `callMethod`, `TelegramApiError`            |
| `@yorganci/effect-telegram-api/Methods` | Generated Bot API method RPCs               |
| `@yorganci/effect-telegram-api/Objects` | Generated Telegram object schemas and types |

## Development

This repo parses a pinned snapshot of Telegram's HTML docs into a JSON spec, then codegen's TypeScript modules under `src/`.

```sh
pnpm scripts:fetch   # fetch and sanitize docs → data/api.html
pnpm scripts:parse   # parse HTML → data/spec/
pnpm scripts:codegen
pnpm test
```

See [`test/README.md`](./test/README.md) for live integration test setup and contribution workflow.
