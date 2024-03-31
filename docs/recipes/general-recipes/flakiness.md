# Flakiness

{% embed url="https://lost-pixel.com/blog/post/handling-flaky-visual-regression-tests-with-lost-pixel-platform" %}
Blogpost related to managing flaky visual tests
{% endembed %}

## Retries

By default, only a single screenshot of the page is taken.

The [lostpixel.config](../../api-reference/lostpixel.config.js-or-ts.md) file has a number property called `flakynessRetries`. If set and greater than 0, at least 2 screenshots of the page will be taken.

If the hash of second screenshot differs from the hash of the first one, it will wait the time defined by `waitBetweenFlakynessRetries` (default 2000ms) to take another screenshot and repeat this process, until the same hash is obtained or the number of retries is reached. The last image obtained in this process will then be compared to the baseline image.

If `flakynessRetries` is 2, it will take **at most** 3 screenshots.

Read [`Compare After Shot`](./compareAfterShot.md) for an alternative behavior to this.

