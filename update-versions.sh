find docs README.md -name '*.md' -exec sed -i '' "s/lost-pixel\/lost-pixel@v[[:digit:]]*\.[[:digit:]]*\.[[:digit:]]*/lost-pixel\/lost-pixel@v$npm_package_version/g" {} +
find examples -name 'ci.yml' -exec sed -i '' "s/lost-pixel\/lost-pixel@v[[:digit:]]*\.[[:digit:]]*\.[[:digit:]]*/lost-pixel\/lost-pixel@v$npm_package_version/g" {} +
git add docs README.md
