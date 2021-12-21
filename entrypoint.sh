#!/bin/sh

STORYBOOK="npm run storybook"
TEST="npm run test"

./node_modules/.bin/concurrently "${STORYBOOK}" "${TEST}" --success first --kill-others
