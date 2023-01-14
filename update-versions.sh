ACTION_PATTERN="s/lost-pixel\/lost-pixel@v[[:digit:]]*\.[[:digit:]]*\.[[:digit:]]*/lost-pixel\/lost-pixel@v$npm_package_version/g"
DOCKER_PATTERN="s/lostpixel\/lost-pixel\:v[[:digit:]]*\.[[:digit:]]*\.[[:digit:]]*/lostpixel\/lost-pixel\:v$npm_package_version/g"

find docs README.md -name '*.md' -exec sed -i '' $ACTION_PATTERN {} +
find examples -name 'ci.yml' -exec sed -i '' $ACTION_PATTERN {} +
find action.yml -exec sed -i '' $DOCKER_PATTERN {} +

git add docs README.md examples action.yml
