pnpm := require("pnpm")
doppler := require("doppler")
jq := require("jq")
repo_root := `git rev-parse --show-toplevel`

doppler-login:
    {{ doppler }} me --no-check-version || {{ doppler }} login --no-check-version

env config="dev": doppler-login
    #!/usr/bin/env bash

    set -e
    {{ doppler }} setup --no-interactive
    cd {{ repo_root }} && {{ doppler }} secrets download --config {{ config }} --no-file --format env > .env && cd -

install:
    {{ pnpm }} install

@setup: install env
    echo "Done."
