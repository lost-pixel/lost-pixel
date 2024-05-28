# Compare After Shot

By default, Lost Pixel first takes all of the screenshots and then compares them all with the baseline images.

In this default behavior, together with `flakynessRetries`, Lost Pixel takes at least 2 screenshots until a stable image hash is reached, being this second one possibly unnecessary if the first one was already correct.

Also, it's possible that the second screenshot has the same hash as the first one, while they are still not fully ready, so an unready image will be used for the comparison with the baseline image.

**As an alternative behavior, the [lostpixel.config](../../api-reference/lostpixel.config.js-or-ts.md) file has the option `compareAfterShot`.**

This option changes this strategy so the comparison is done right after the screenshot is taken, and it's repeated until the current image matches the baseline or the retry count reaches the `flakynessRetries` value (default is 0; no retry is made).

This possibly halves the time taken if all of the first shots are correct and reduces the flakiness as a stable hash of a shot could be reached while the image is still not in its final UI state.

The option `compareConcurrency` isn't considered if this option is used. All the other options are still used.

## Config

`compareAfterShot` allows a high usage of the machine's resources to have a considerably lower time of execution.

You can, for example, have the following in your `lostpixel.config`:

```ts
{
  compareAfterShot: true,
  shotConcurrency: process.env.CI ? 5 : 10,
  flakynessRetries: process.env.CI ? 5 : 10,
  waitBetweenFlakynessRetries: process.env.CI ? 500 : 250,
  waitBeforeScreenshot: 100,
  waitForFirstRequest: 0,
  waitForLastRequest: 0,
}
```

These values can be tweaked depending on your local and CI machines.
