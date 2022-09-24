---
description: >-
  Use typescript version for smart autocompletion and static type check of your
  config file
---

# lost-pixel.config.js|ts

#### Options

* `browser: 'chromium' | 'firefox' | 'webkit'`
  * <mark style="color:green;">**Required**</mark>
  * Defaults to **chromium**
  * Browser to use when doing the screenshots: chromium, firefox, or webkit
* `threshold: number`
  * Defaults to **0**
  * Threshold for the difference between the baseline and current image
  * Values **between** **0** and **1**(e.g. 0.3) are interpreted as percentage of the image size
  * Values **greater or equal** to **1**(e.g. 500) are interpreted as pixel count.

