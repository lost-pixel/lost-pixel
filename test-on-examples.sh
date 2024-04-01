#!/bin/sh

cd examples \
&& echo "======== Testing: example-storybook-v6.4" \
&& cd example-storybook-v6.4 \
&& node ../../dist/bin.js \
&& cd .. \
&& echo "======== Testing: example-storybook-v6.5-storystore-v7" \
&& cd example-storybook-v6.5-storystore-v7 \
&& node ../../dist/bin.js \
&& cd .. \
&& echo "======== Testing: example-storybook-v8" \
&& cd example-storybook-v8 \
&& node ../../dist/bin.js \
&& cd .. \
&& echo "======== Testing: example-storybook-v8-compareAfterShot" \
&& cd example-storybook-v8-compareAfterShot \
&& node ../../dist/bin.js \
&& cd .. \
&& echo "======== Testing: example-next-js-pages" \
&& cd example-next-js-pages \
&& node ../../dist/bin.js \
&& cd .. \
&& echo "======== Testing: example-ladle" \
&& cd example-ladle \
&& node ../../dist/bin.js \
&& cd .. \
&& echo "======== Testing: example-histoire" \
&& cd example-swyxkit \
&& node ../../dist/bin.js \
&& cd .. \
&& echo "======== Testing: example-vite-app" \
&& cd example-vite-app \
&& node ../../dist/bin.js \
&& cd .. \
