# `@yorganc/telegram-api`

Telegram API spec isn't available in OpenAPI format. This project is aims to programmatically generate OpenAPI spec from Telegram's API documentation.

## Goal

Your goal is to programmatically parse Telegram's API documentation and generate OpenAPI spec.

## Dependencies

This project uses `effect` library for building type-safe and reliable code. `effect` library version is v4 so refer to [`effect`](.vendor/effect/packages/effect/package.json) for implementation. Refer to this document instead of your offline knowledge of `effect` library or any online documentation. Always refer to actually vendored version of `effect` library for implementation. For platform layer `effect/unstable/*` modules, refer to [`@effect/platform-node`](.vendor/effect/packages/platform-node/package.json) for implementation.
