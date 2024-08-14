ACTION_PATTERN="s/lost-pixel\/lost-pixel\@v\d+\.\d+\.\d+(-\d+)?/lost-pixel\/lost-pixel\@v$npm_package_version/g"
DOCKER_PATTERN="s/lostpixel\/lost-pixel:v\d+\.\d+\.\d+(-\d+)?/lostpixel\/lost-pixel:v$npm_package_version/g"

find docs README.md -name '*.md' -exec perl -pi -e $ACTION_PATTERN {} +
find examples -name 'ci.yml' -exec perl -pi -e $ACTION_PATTERN {} +
find action.yml -exec perl -pi -e $DOCKER_PATTERN {} +

git add docs README.md examples action.yml
