#!/bin/sh

echo "INPUT_LOST_PIXEL_URL=$INPUT_LOST_PIXEL_URL"
echo "INPUT_STORYBOOK_PATH=$INPUT_STORYBOOK_PATH"

STORYBOOK_PATH=/github/workspace/$INPUT_STORYBOOK_PATH

cd /app

./node_modules/.bin/loki \
--verboseRenderer \
--requireReference \
--reactUri file:$STORYBOOK_PATH \
--reference /github/workspace/.loki/reference \
--output /github/workspace/.loki/current \
--difference /github/workspace/.loki/difference \
--chromeFlags="--headless --disable-gpu --hide-scrollbars --no-sandbox" \
update
