---
description: >-
  Use typescript version for smart autocompletion and static type check of your
  config file
---

# lost-pixel.config.js|ts|cjs|mjs

#### Options

- **`browser`**`: 'chromium' | 'firefox' | 'webkit'`
  - <mark style="color:green;">**Required**</mark>
  - Defaults to **chromium**
  - Browser to use when doing the screenshots: chromium, firefox, or webkit
- **`threshold`**`: number`
  - Defaults to **0**
  - The threshold for the difference between the baseline and current image
  - Values **between** **0** and **1**(e.g. 0.3) are interpreted as a percentage of the image size
  - Values **greater or equal** to **1**(e.g. 500) are interpreted as pixel count.
- **`storybookShots`**`: { storybookUrl, mask }`
  - **`storybookUrl`**`: string`
    - Defaults to **storybook-static**
    - URL of the Storybook instance or local folder
  - **`mask`**`: { selector }`
    - **`selector`**`: string`
      - CSS selector for the element to mask
      - Examples:
      - `#my-id`: Selects the element with the id `my-id`
      - `.my-class`: Selects all elements with the class `my-class`
      - `div`: Selects all `div` elements
      - `div.my-class`: Selects all `div` elements with the class `my-class`
      - `li:nth-child(2n)`: Selects all even `li` elements
      - `[data-testid="hero-banner"]`: Selects all elements with the attribute `data-testid` set to `hero-banner`
      - `div > p`: Selects all `p` elements that are direct children of a `div` element \*/
