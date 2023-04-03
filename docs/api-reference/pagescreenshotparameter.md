---
description: Values that can be provided to pages
---

# PageScreenshotParameter

* **path**: `string`
  * **Required**
  * Path to the page to take a screenshot of (e.g. '/login')
  * This is the URL path of the page that you want to take a screenshot of.
* **name**: `string`
  * **Required**
  * Unique name for the page
  * This is used to give a unique name to the page, so it can be easily identified in the results.
* **waitBeforeScreenshot**: `number`
  * **Optional**
  * Defaults to `1000`
  * Time to wait before taking a screenshot
  * The time to wait before taking a screenshot is used to ensure that the page is fully loaded and rendered before the image is captured.
* **threshold**: `number`
  * **Optional**
  * Defaults to `0`
  * Threshold for the difference between the baseline and current image
  * **Values between 0 and 1 are interpreted as percentage of the image size.**
  * **Values greater or equal to 1 are interpreted as absolute pixel count.**
  * This threshold is used to determine whether an image is considered different or not. It means that if the difference between the images is greater than the threshold, the test will fail.
* **viewport**: `{ width?: number; height?: number; }`
  * **Optional**
  * Defaults to `{ width: 1280, height: 720 }`
  * Define a custom viewport for the page
  * Allows for specifying a custom width and height for the viewport when taking the screenshot.
* **mask**: `Mask[]`
  * **Optional**
  * Define areas for the page where differences will be ignored
  * Allows for specifying areas of the image that should be ignored when comparing for differences.
