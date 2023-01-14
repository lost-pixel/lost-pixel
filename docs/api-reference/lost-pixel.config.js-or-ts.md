---
description: >-
  Use typescript version for smart autocompletion and static type check of your
  config file
---

# lost-pixel.config.js|ts|cjs|mjs

#### Options

* **browser**: `'chromium' | 'firefox' | 'webkit'`
  * **Required**
  * Defaults to `'chromium'`
  * Browser to use when doing the screenshots: **chromium**, **firefox**, or **webkit**
* **lostPixelPlatform**: `string`
  * **Required**
  * Defaults to `'https://api.lost-pixel.com'` if not provided
  * URL of the Lost Pixel API endpoint
  * The endpoint URL is the location of the Lost Pixel platform which will be used for the visual regression testing.
* **apiKey**: `string` | `undefined`
  * **Optional**
  * API key for the Lost Pixel platform
  * The API key is used to authenticate with the Lost Pixel platform. Only used when using Lost Pixel Platform managed version.
* **storybookShots**: `{ storybookUrl: string, mask?:` [`Mask`](mask.md)`[] }` | `undefined`
  * **Optional**
  * Enable Storybook mode
  * Allows for specifying the URL of the Storybook instance or local folder and any areas for all stories where differences will be ignored with `mask.`See reference for `Mask` below
  * Default value for `storybookUrl` is `'storybook-static'`
* **ladleShots**: `{ ladleUrl: string, mask?:` [`Mask`](mask.md)`[] }` | `undefined`
  * **Optional**
  * Enable Ladle mode
  * Allows for specifying the URL of the Ladle served instance and any areas for all stories where differences will be ignored with `mask.`See reference for `Mask` below
  * Default value for `ladleUrl` is `'http://localhost:61000'`
* **pageShots**: `{ pages:` [`PageScreenshotParameter`](pagescreenshotparameter.md)`[], pagesJsonUrl?: string, baseUrl: string, mask?:` [`Mask`](mask.md)`[] }` | `undefined`
  * **Optional**
  * Enable Page mode
  * Allows for specifying the paths to take screenshots of, the URL that must return a JSON compatible with [`PageScreenshotParameter`](pagescreenshotparameter.md)`[]`, the base URL of the running application, and any areas for all pages where differences will be ignored with `mask.`See reference for `Mask` below
  * if `pagesJsonUrl` is provided lost-pixel will try to make a call to the supplied url to fetch the pages from there. It will be composed together with `pages` provided. This is useful for running lost-pixel on the generated list of pages.
* **customShots**: `{ currentShotsPath: string }` | `undefined`
  * **Optional**
  * Enable Custom mode
  * Allows for specifying the path to current shots folder.
* **imagePathBaseline**: `string`
  * **Required**
  * Defaults to `'.lostpixel/baseline/'`
  * Path to the baseline image folder
  * The baseline image folder is where the original, or "reference" images are stored. These images will be used as a comparison point for future runs of the visual regression tests.
* **imagePathCurrent**: `string`
  * **Required**
  * Defaults to `'.lostpixel/current/'`
  * Path to the current image folder
  * The current image folder is where the images taken during the current run of the visual regression tests will be stored.
* **imagePathDifference**: `string`
  * **Required**
  * Defaults to `'.lostpixel/difference/'`
  * Path to the difference image folder
  * The difference image folder is where the images highlighting the differences between the baseline and current images will be stored.
* **shotConcurrency**: `number`
  * **Required**
  * Defaults to `5`
  * Number of concurrent shots to take
  * This determines how many images will be taken at the same time during the visual regression testing.
* **compareConcurrency**: `number`
  * **Required**
  * Defaults to `10`
  * Number of concurrent screenshots to compare
  * This determines how many images will be compared at the same time during the visual regression testing.
* **compareEngine**: `'pixelmatch' | 'odiff'`
  * **Required**
  * Defaults to `'pixelmatch'`
  * Which comparison engine to use for diffing images
  * The comparison engine is the algorithm used to compare the images and identify differences.
* **timeouts**: `{ fetchStories?: number, loadState?: number, networkRequests?: number }`
  * **Required**
  * Timeouts for various stages of the test
  * Allows for specifying timeouts for fetching stories from Storybook, loading the state of the page and waiting for network requests to finish.
  * Default value for `fetchStories` is `30000`, for `loadState` is `30000`, and for `networkRequests` is `30000`
* **waitBeforeScreenshot**: `number`
  * **Required**
  * Defaults to `1000`
  * Time to wait before taking a screenshot
  * The time to wait before taking a screenshot is used to ensure that the page is fully loaded and rendered before the image is captured.
* **waitForFirstRequest**: `number`
  * **Required**
  * Defaults to `1000`
  * Time to wait for the first network request to start
  * The time to wait for the first network request to start is used to ensure that any initial network requests have been made before the image is captured.
* **waitForLastRequest**: `number`
  * **Required**
  * Defaults to `1000`
  * Time to wait for the last network request to start
  * The time to wait for the last network request to start is used to ensure that any final network requests have been made before the image is captured.
* **threshold**: `number`
  * **Required**
  * Threshold for the difference between the baseline and current image
  * **Values between 0 and 1 are interpreted as percentage of the image size.**
  * **Values greater or equal to 1 are interpreted as absolute pixel count.**
  * This threshold is used to determine whether an image is considered different or not. It means that if the difference between the images is greater than the threshold, the test will fail.

