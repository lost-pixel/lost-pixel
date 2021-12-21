#!/bin/sh

echo $INPUT_LOST_PIXEL_URL
echo $STORYBOOK_PATH
# env
# cat /github/workflow/event.json

STORYBOOK="npm run storybook"
TEST="npm run test"

./node_modules/.bin/concurrently "${STORYBOOK}" "${TEST}" --success first --kill-others
