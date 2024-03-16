# Compare After Shots

By default, only a single screenshot of the page is taken.

The [lostpixel.config.ts|js](../../api-reference/lostpixel.config.js-or-ts.md) file has a boolean property called `compareAfterShots`.

By default, Lost Pixel first takes all of the screenshots and then compare them all with the baseline images.

In the default behavior, together with `flakynessRetries`, it takes at least 2 screenshots until a stable image hash is reached, being this second one possibly unnecessary if the first one was already correct.

The `compareAfterShots` option changes this strategy so it only retries if the image fails, possibly halving the time taken if all of the first shots are correct and reducing the run flakiness as a stable hash of a shot could be reached while the image could still not be in its final UI state.

The option `compareConcurrency` isn't considered if this option is used.