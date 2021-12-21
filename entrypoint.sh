#!/bin/sh

echo $INPUT_LOST_PIXEL_URL
echo $INPUT_STORYBOOK_PATH
# env
# cat /github/workflow/event.json


STORYBOOK_PATH=/github/workspace/$INPUT_STORYBOOK_PATH
ls -lah $STORYBOOK_PATH


STORYBOOK="npm run storybook"
TEST="npm run test"



cd /app
ls -lah
# ls ./node_modules/
# ls ./node_modules/.bin


./node_modules/.bin/concurrently "${STORYBOOK}" "${TEST}" --success first --kill-others
