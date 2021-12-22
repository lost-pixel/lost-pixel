#!/bin/sh

echo $INPUT_LOST_PIXEL_URL
echo $INPUT_STORYBOOK_PATH
# env
# cat /github/workflow/event.json


STORYBOOK_PATH=/github/workspace/$INPUT_STORYBOOK_PATH
ls -lah $STORYBOOK_PATH


STORYBOOK="npm run storybook"
TEST="npm run test"
DEBUG="npm run debug"
DEBUG3="STORYBOOK_PATH=${STORYBOOK_PATH} npm run debug"
DEBUG4="STORYBOOK_PATH=/yolo/github/workspace/$INPUT_STORYBOOK_PATH npm run debug"

echo "DEBUG1:"
npm run debug



cd /app
ls -lah
# ls ./node_modules/
# ls ./node_modules/.bin


./node_modules/.bin/concurrently "${DEBUG}" "${STORYBOOK}" "${TEST}" --success first --kill-others
