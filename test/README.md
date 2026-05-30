# RPC method integration tests

Guide for adding live integration coverage for Telegram Bot API RPC methods.

## Goal

Expand live integration coverage for Telegram Bot API RPC methods. Each method gets a typed error catalog and a matching test file, so undocumented API failures surface as compile-time error tags instead of generic `TelegramApiError`.

## Definition of done (per method)

- `test/{methodName}.test.ts` exists and follows existing patterns
- `errors/{methodName}.json` documents every error the tests assert (plus any new ones discovered)
- `pnpm scripts:codegen` has been run so `src/Errors.ts` and `src/Methods.ts` are regenerated
- `pnpm test` passes locally with valid `.env` credentials

## Workflow

1. **Pick an untested method** — Compare `data/spec/methods/` against `test/*.test.ts`. Prefer read-only or low-risk methods first.

2. **Probe the live API before writing tests** — Use curl or a small script with `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`. Capture exact `error_code` + `description` strings. Telegram is literal; tests must match verbatim.

3. **Add `errors/{method}.json`** — Only add new entries. Do not edit or reorder existing errors in other files. Reuse tags like `ChatIdEmpty` only when `errorCode` and `description` match exactly.

4. **Write `test/{method}.test.ts`** — Mirror nearby tests (`getChat.test.ts`, `sendMessage.test.ts`). Standard structure:
   - `success` (when feasible)
   - `Telegram API errors`
   - `authErrorTests(...)` from `helpers.ts`

5. **Run codegen**

   ```sh
   pnpm scripts:codegen
   ```

6. **Run tests**

   ```sh
   pnpm test
   ```

7. **If the method return type is wrong in generated code**, fix `scripts/parse/` (not `src/`), then:

   ```sh
   pnpm scripts:parse
   pnpm scripts:codegen
   ```

## Rules of the road

| Do                                          | Don't                                                              |
| ------------------------------------------- | ------------------------------------------------------------------ |
| Modify `errors/` and `scripts/`             | Hand-edit `src/`                                                   |
| Append new errors to a method's JSON        | Change existing error entries in any file                          |
| Name test file exactly after the RPC method | Invent one-off naming                                              |
| Run codegen after error JSON changes        | Commit tests that expect tags codegen doesn't know about           |
| Use `expectErrorTag` for documented errors  | Assert on raw `TelegramApiError` unless intentionally testing gaps |

`errors/common.json` (`Unauthorized`, `NotFound`) is merged into every method doc at codegen time. Do not duplicate those per method unless testing method-specific behavior.

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

### Shared helpers

- `requireBotToken()` / `requireChatId()` — fail fast if `.env` is missing
- `authErrorTests(fn)` — standard 401/404 token cases
- Chain methods when you need fixtures (`sendDice` → `forwardMessage`)

### Side effects

Sending messages, pinning, deleting commands, and similar actions are acceptable in this suite, but document cleanup and avoid destructive admin operations unless you have a disposable test group.

## Common pitfalls

1. **Undocumented errors become `TelegramApiError`** — If a test expects `ChatNotFound` but the JSON is not codegen'd, the client will not tag it. Always add the error first, codegen, then write the assertion.

2. **Tag collisions across methods** — The same tag must have the same `errorCode` everywhere. Codegen fails on conflicts.

3. **Environment assumptions** — `TELEGRAM_CHAT_ID` as a private user chat blocks many group/channel methods. Do not force success tests; document the limitation in the test file or omit success coverage.

4. **Missing `dotenv`** — Probes and scripts need `import 'dotenv/config'` or tests run without credentials and return misleading 404s.

5. **Schema decode failures are not API errors** — If success fails with `SchemaError`, the spec/parser return type is wrong (for example `forwardMessages` returning `MessageId[]`). Fix parsing, not the test.

6. **Overfitting error messages** — Some Telegram errors embed dynamic offsets (`entity begins at UTF-16 offset …`). Either test the stable prefix or add a separate tagged variant per observed shape; follow `sendMessage.json` conventions.

7. **Editing `src/` directly** — Changes will be wiped on the next codegen. Treat `src/Errors.ts` and `src/Methods.ts` as generated output.

8. **Parallelism and rate limits** — The full suite hits the live API. Expect flakiness under flood limits; avoid redundant success tests that spam the same chat.

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
- [ ] New errors added; existing errors untouched
- [ ] Codegen run; diff in `src/` is expected generated output only
- [ ] Tests use `expectErrorTag`, not stringly-typed checks on unknown errors
- [ ] Success tests clean up or are idempotent
- [ ] No hand-edits to `src/` outside codegen
- [ ] PR notes call out env requirements or missing success coverage
