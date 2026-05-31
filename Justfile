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

# Bump package.json and jsr.json, commit, and tag v{version}. Pass push=true to publish.
release version push="false":
    #!/usr/bin/env bash

    set -euo pipefail

    version="{{ version }}"
    push="{{ push }}"

    version="${version#v}"

    if ! [[ "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$ ]]; then
        echo "error: invalid semver '$version' (expected e.g. 0.1.0)" >&2
        exit 1
    fi

    tag="v$version"
    cd {{ repo_root }}

    if ! git diff-index --quiet HEAD --; then
        echo "error: working tree has uncommitted changes" >&2
        exit 1
    fi

    if git rev-parse "$tag" >/dev/null 2>&1; then
        echo "error: tag '$tag' already exists" >&2
        exit 1
    fi

    for file in package.json jsr.json; do
        if sed --version >/dev/null 2>&1; then
            sed -i 's/^\t"version": "[^"]*"/\t"version": "'"$version"'"/' "$file"
        else
            sed -i '' 's/^\t"version": "[^"]*"/\t"version": "'"$version"'"/' "$file"
        fi
    done

    git add package.json jsr.json
    git commit -m "chore: release $tag"
    git tag -a "$tag" -m "$tag"

    echo "Created $tag at $(git rev-parse --short HEAD)"

    if [ "$push" = "true" ]; then
        git push origin HEAD
        git push origin "$tag"
        echo "Pushed branch and $tag to origin"
    else
        echo "Push with: just release $version push=true"
        echo "Or manually: git push origin HEAD && git push origin $tag"
    fi
