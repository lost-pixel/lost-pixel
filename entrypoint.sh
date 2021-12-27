#!/bin/sh

WORKSPACE=$PWD
STORYBOOK_PATH=$WORKSPACE/$INPUT_STORYBOOK_PATH
CI_BUILD_ID=$GITHUB_RUN_ID
LOST_PIXEL_URL=$INPUT_LOST_PIXEL_URL
STORYBOOK_PATH=$INPUT_STORYBOOK_PATH
S3_END_POINT=$INPUT_S3_END_POINT
S3_ACCESS_KEY=$INPUT_S3_ACCESS_KEY
S3_SECRET_KEY=$INPUT_S3_SECRET_KEY
S3_BUCKET_NAME=$INPUT_S3_BUCKET_NAME
S3_BASE_URL=$INPUT_S3_BASE_URL

echo "WORKSPACE=$WORKSPACE"
echo "STORYBOOK_PATH=$STORYBOOK_PATH"
echo "CI_BUILD_ID=$CI_BUILD_ID"
echo "LOST_PIXEL_URL=$LOST_PIXEL_URL"
echo "STORYBOOK_PATH=$STORYBOOK_PATH"
echo "S3_END_POINT=$S3_END_POINT"
echo "S3_ACCESS_KEY=*****************"
echo "S3_SECRET_KEY=*****************"
echo "S3_BUCKET_NAME=$S3_BUCKET_NAME"
echo "S3_BASE_URL=$S3_BASE_URL"

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

npm run start
