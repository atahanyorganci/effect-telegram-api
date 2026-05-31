# RPC method integration tests

Guide for adding live integration coverage for Telegram Bot API RPC methods.

## Goal

Each Bot API method should have a matching `test/{methodName}.test.ts` that exercises the generated `TelegramClient` against the live API. Undocumented `{ ok: false }` responses surface as `TelegramApiError`; documented HTTP status codes surface as tagged errors (`BadRequest`, `NotFound`, …) when listed in `spec/errors/{method}.json`.

As of the current tree there are ~176 parsed endpoints and ~147 test files — compare `spec/endpoints/` with `test/*.test.ts` to find gaps.

## Error model

Each client method exposes four error channels:

| Channel                           | Always?    | Example                                                  |
| --------------------------------- | ---------- | -------------------------------------------------------- |
| `HttpClientError.HttpClientError` | Yes        | transport failures, decode errors                        |
| `Schema.SchemaError`              | Yes        | missing required payload fields                          |
| `Errors.TelegramApiError`         | Yes        | `{ ok: false }` with a status not listed for this method |
| HTTP status errors from tests     | Per method | `BadRequest`, `NotFound`, `Unauthorized`, …              |

Errors are grouped by **HTTP status code only** — all Telegram `error_code: 400` responses use the `BadRequest` tag regardless of `description`. Tests still assert the exact `description` string via `expectErrorTag`.

The full HTTP 4xx/5xx catalog lives in `scripts/codegen/http-status-errors.ts`. `spec/errors/errors.json` mirrors it for validation; method JSON files list which status tags apply.

## Definition of done (per method)

- `test/{methodName}.test.ts` exists and follows existing patterns
- `spec/errors/{methodName}.json` lists HTTP status tags for every error the tests assert (e.g. `BadRequest`)
- `pnpm scripts:codegen` has been run so `src/errors.ts`, `src/http-api.ts`, and `src/client/` are regenerated
- `pnpm test` passes locally with valid `.env` credentials

## Workflow

1. **Pick an untested method** — Compare `spec/endpoints/` against `test/*.test.ts`. Prefer read-only or low-risk methods first.

2. **Probe the live API before writing tests** — Use curl or a small script with `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`. Capture exact `error_code` + `description` strings. Telegram is literal; tests must match verbatim.

3. **Add status tags** — Append the HTTP status tag (e.g. `BadRequest` for `error_code: 400`) to `spec/errors/{method}.json` if not already present. Status definitions are fixed in `spec/errors/errors.json`; do not add description-specific tags.

4. **Write `test/{method}.test.ts`** — Mirror nearby tests (`getChat.test.ts`, `sendMessage.test.ts`). Standard structure:
   - `liveTests("{method}", test => { … })` with `it.layer(LiveLayer)` from `helpers.ts`
   - `success` (when feasible)
   - `Telegram API errors` (use `expectErrorTag` or `expectClientSchemaError` for missing fields)
   - `authErrorTests(test, token => call…)` from `helpers.ts`

5. **Run codegen**

   ```sh
   pnpm scripts:codegen
   ```

6. **Run formatter and linter**

   ```sh
   pnpm format:fix
   pnpm lint
   ```

7. **Run tests**

   ```sh
   pnpm test
   ```

8. **If the method return type is wrong in generated code**, fix `scripts/parse/` (not `src/`), then:

   ```sh
   pnpm scripts:parse
   pnpm scripts:codegen
   ```

## Rules of the road

| Do                                                                           | Don't                                                              |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Modify `spec/errors/` and `scripts/`                                         | Hand-edit `src/`                                                   |
| Add HTTP status tags to a method's JSON when tests discover new status codes | Add description-specific tags like `ChatNotFound`                  |
| Name test file exactly after the RPC method                                  | Invent one-off naming                                              |
| Run codegen after error JSON changes                                         | Commit tests that expect tags codegen doesn't know about           |
| Use `expectErrorTag` with status tags (`BadRequest`, `NotFound`, …)          | Assert on raw `TelegramApiError` unless intentionally testing gaps |

`spec/errors/errors.json` defines shared errors (`Unauthorized`, `NotFound`) in `common`; those tags are merged into every method at codegen time. Do not duplicate them in a method's JSON unless testing method-specific behavior.

## Test design guidance

### Success tests

Use when the method works with the configured bot and chat. Prefer idempotent or self-cleaning flows:

- Read current state, mutate, restore (`setMyName` via `getMyName`)
- Pin, then unpin
- Set commands, then `deleteMyCommands`

### Error-only tests

Valid when the environment cannot support success:

- Private chat blocks invite links (`exportChatInviteLink`, `createChatInviteLink`)
- Boosts need a channel or supergroup (`getUserChatBoosts`)

### Shared helpers (`helpers.ts`)

- `telegramConfig` — loads typed env from `.env` via Effect `Config` at module load
- `liveTests` / `LiveLayer` — `NodeServices` + `NodeHttpClient.layerFetch`
- `callClient(method, token, …args)` — invokes `TelegramClient` with rate-limit retries
- `callLimitedClient(method, …args)` — same with `TELEGRAM_LIMITED_BOT_TOKEN`
- `authErrorTests(fn)` — standard 401/404 token cases (`Unauthorized`, `NotFound`)
- `expectErrorTag(error, tag, description)` — assert tagged API error
- `expectClientSchemaError(call)` — assert `SchemaError` for invalid payloads before the wire
- `trackCreatedForumTopic` — register forum topics for teardown cleanup
- Chain methods when you need fixtures (`sendDice` → `forwardMessage`)

### Environment variables

Create a `.env` in the repo root with:

| Variable                     | Used for                                                                  |
| ---------------------------- | ------------------------------------------------------------------------- |
| `TELEGRAM_BOT_TOKEN`         | Admin bot: success tests, cleanup, pin/invite/description in supergroup   |
| `TELEGRAM_LIMITED_BOT_TOKEN` | Member bot (no topic/admin rights): supergroup “not enough rights” errors |
| `TELEGRAM_CHAT_ID`           | Private user chat (DM with the bot)                                       |
| `TELEGRAM_GROUP_CHAT_ID`     | Supergroup admin, invite links, member queries                            |
| `TELEGRAM_FORUM_TOPIC_ID`    | Forum topic threads (`message_thread_id`)                                 |

Add both bots to the test supergroup. Promote only `TELEGRAM_BOT_TOKEN` to administrator with the permissions success tests need. Leave `TELEGRAM_LIMITED_BOT_TOKEN` as an ordinary member.

**CI:** set all five variables above as GitHub Actions secrets (same names). `.github/workflows/ci.yml` and release CI run `pnpm test` with them.

Success tests that need a supergroup or forum topic destructure `groupId` and `forumTopicId` from `telegramConfig` alongside `botToken` and `chatId`.

Vitest loads `.env` from the repo root in `vitest.config.ts` and `vitest.setup.ts` before collection, so tests and `skipIf` guards see credentials without importing `dotenv` in each file. Standalone probe scripts still need `import "dotenv/config"`.

### Side effects

Sending messages, pinning, deleting commands, and similar actions are acceptable in this suite, but document cleanup and avoid destructive admin operations unless you have a disposable test group.

After the full suite, `test/globalSetup.ts` runs `cleanupTestArtifacts` on teardown: clears pinned messages in the configured chats and forum topics, reopens the configured fixture topic if it was closed, and deletes forum topics recorded via `trackCreatedForumTopic`. Messages are left in place. Pin success tests also unpin in `Effect.ensuring` so a failed assertion does not leave a pin behind.

## Common pitfalls

1. **Undocumented status codes become `TelegramApiError`** — If a test expects `BadRequest` but the method JSON does not list it, the client will not tag it. Always add the status tag first, codegen, then write the assertion.

2. **Environment assumptions** — `TELEGRAM_CHAT_ID` as a private user chat blocks many group/channel methods. Do not force success tests; document the limitation in the test file or omit success coverage.

3. **Missing `.env`** — Without credentials, `telegramConfig` fails at import and the suite will not run. Probes run outside vitest need `import "dotenv/config"`.

4. **Schema decode failures are not API errors** — If success fails with `SchemaError`, the spec/parser return type is wrong (for example `forwardMessages` returning `MessageId[]`). Fix parsing, not the test.

5. **Overfitting error messages** — Some Telegram errors embed dynamic offsets (`entity begins at UTF-16 offset …`). Assert the stable prefix in the `description` argument; the error tag remains `BadRequest`.

6. **Editing `src/` directly** — Changes will be wiped on the next codegen. Treat generated `src/` files as output.

7. **Parallelism and rate limits** — The full suite hits the live API. `callClient` retries 429 responses with exponential backoff (see `retryOnRateLimit` in `helpers.ts`). Reduce `maxWorkers` in `vitest.config.ts` if limits persist.

## How to split work

Good parallelization unit: **one method or a small family** (for example `sendPhoto`, `sendDocument`, and `sendAudio` share the same “no media in request” pattern).

Suggested batches:

- **Batch A — getters:** `getUserProfileAudios`, `getChatGifts`, …
- **Batch B — send variants:** `sendVenue`, `sendPoll`, media methods
- **Batch C — forwards/copies:** `forwardMessage`, `copyMessages`, …
- **Batch D — admin/group:** requires a test supergroup in `.env` (coordinate env setup first)

Each engineer delivers: error JSON, test, and green `pnpm test` for their methods. One person owns parser/codegen fixes if spec issues appear.

## Review checklist

- [ ] Test file name matches RPC method exactly
- [ ] New status tags added to method JSON when tests cover new status codes
- [ ] Codegen run; diff in `src/` is expected generated output only
- [ ] Tests use `expectErrorTag` with status tags, not stringly-typed checks on unknown errors
- [ ] Success tests clean up or are idempotent
- [ ] No hand-edits to `src/` outside codegen
- [ ] PR notes call out env requirements or missing success coverage
