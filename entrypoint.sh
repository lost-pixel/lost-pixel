#!/bin/sh

WORKSPACE=$PWD
STORYBOOK_PATH=$WORKSPACE/$INPUT_STORYBOOK_PATH
CI_BUILD_ID=$GITHUB_RUN_ID

echo "WORKSPACE=$WORKSPACE"
echo "INPUT_LOST_PIXEL_URL=$INPUT_LOST_PIXEL_URL"
echo "INPUT_STORYBOOK_PATH=$INPUT_STORYBOOK_PATH"
echo "STORYBOOK_PATH=$STORYBOOK_PATH"
echo "CI_BUILD_ID=$CI_BUILD_ID"

cd /app

./node_modules/.bin/loki \
--verboseRenderer \
--requireReference \
--reactUri file:$STORYBOOK_PATH \
--reference $WORKSPACE/.loki/reference \
--output $WORKSPACE/.loki/current \
--difference $WORKSPACE/.loki/difference \
--chromeFlags="--headless --disable-gpu --hide-scrollbars --no-sandbox" \
test

npm run dev
