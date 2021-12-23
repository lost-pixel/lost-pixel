#!/bin/sh

echo $INPUT_LOST_PIXEL_URL
echo $INPUT_STORYBOOK_PATH
# env
# cat /github/workflow/event.json


STORYBOOK_PATH=/github/workspace/$INPUT_STORYBOOK_PATH
# ls -lah $STORYBOOK_PATH


STORYBOOK="STORYBOOK_PATH=${STORYBOOK_PATH} npm run storybook"
TEST="npm run test"
DEBUG="STORYBOOK_PATH=${STORYBOOK_PATH} npm run debug"
# DEBUG3="STORYBOOK_PATH=${STORYBOOK_PATH} npm run debug"
# DEBUG4="STORYBOOK_PATH=/yolo/github/workspace/$INPUT_STORYBOOK_PATH npm run debug"

echo $STORYBOOK_PATH

# echo "DEBUG1:"
# npm run debug

echo "GITHUB_JOB=$GITHUB_JOB"
echo "GITHUB_REF=$GITHUB_REF"
echo "GITHUB_SHA=$GITHUB_SHA"
echo "GITHUB_REPOSITORY=$GITHUB_REPOSITORY"
echo "GITHUB_REPOSITORY_OWNER=$GITHUB_REPOSITORY_OWNER"
echo "GITHUB_RUN_ID=$GITHUB_RUN_ID"
echo "GITHUB_RUN_NUMBER=$GITHUB_RUN_NUMBER"
echo "GITHUB_RUN_ATTEMPT=$GITHUB_RUN_ATTEMPT"
echo "GITHUB_ACTOR=$GITHUB_ACTOR"
echo "GITHUB_WORKFLOW=$GITHUB_WORKFLOW"
echo "GITHUB_HEAD_REF=$GITHUB_HEAD_REF"
echo "GITHUB_BASE_REF=$GITHUB_BASE_REF"
echo "GITHUB_EVENT_NAME=$GITHUB_EVENT_NAME"
echo "GITHUB_REF_NAME=$GITHUB_REF_NAME"
echo "GITHUB_REF_PROTECTED=$GITHUB_REF_PROTECTED"
echo "GITHUB_REF_TYPE=$GITHUB_REF_TYPE"


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
