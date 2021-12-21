#!/bin/sh

echo $INPUT_LOST_PIXEL_URL
echo $STORYBOOK_PATH
# env
# cat /github/workflow/event.json

ls -lah $STORYBOOK_PATH

ls -lah
ls ./node_modules/
ls ./node_modules/.bin

STORYBOOK="npm run storybook"
TEST="npm run test"


# ./node_modules/.bin/concurrently "${STORYBOOK}" "${TEST}" --success first --kill-others
