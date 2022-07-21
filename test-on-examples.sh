#!/bin/sh

cd examples \
&& cd example-storybook-v6.4 \
&& node ../../dist/bin.js \
&& cd .. \
&& cd example-storybook-v6.5-storystore-v7 \
&& node ../../dist/bin.js \
&& cd .. \
&& cd example-next-js-pages \
&& node ../../dist/bin.js \
&& cd .. \
