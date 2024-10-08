# Executing arbitrary code before tests runs

Lost Pixel supports arbitrary code execution through Playwright `page.evaluate() & page.addStyleTag()`. This will ensure that you isolate all the changes in the browser execution to Lost Pixel runs; **your normal code & customers will not be affected by this.**

{% code title="lostpixel.config.js" %}
```javascript
module.exports = {
  pageShots: {
    baseUrl: 'http://172.17.0.1:9000',
    mask: [{ selector: 'span.gatsby-resp-image-background-image' }],
  },
  lostPixelProjectId: 'YOUR_PROJECT_ID',
  apiKey: process.env.LOST_PIXEL_API_KEY,
  beforeScreenshot: async (page) => {
    await page.addStyleTag({
      content: `iframe {
          visibility: hidden;
        }

        /* do not show underline animation */
        #toc-holder  a {
          background-size: 0 !important;
          background-image: none !important;
        }
        /* skip image display within section */
        section img {
          visibility: hidden;
        }

        /* hide cookie banner */
        #onetrust-consent-sdk {
          display: none;
        }
        
        /* reset menu item alignment */
        #sidebar-holder li a {
          vertical-align: baseline;
        }
        `,
    })
  },
}
```
{% endcode %}

It is possible to change rendered screenshot after it was written to the file system. The most common scenario is to trim empty spaces (for example by using [Sharp](https://sharp.pixelplumbing.com)).

{% code title="lostpixel.config.js" %}
```javascript
const fs = require("node:fs/promises")
const path = require("node:path")
const sharp = require("sharp")

module.exports = {
  pageShots: {
    baseUrl: 'http://172.17.0.1:9000',
  },
  lostPixelProjectId: 'YOUR_PROJECT_ID',
  apiKey: process.env.LOST_PIXEL_API_KEY,
  afterScreenshot: async (_, { filePathCurrent }) => {
    const { base, dir } = path.parse(filePathCurrent)
    const tmpShotPath = path.join(dir, `tmp.${base}`)
    await sharp(filePathCurrent).trim().toFile(tmpShotPath)
    await fs.rename(tmpShotPath, filePathCurrent)
  },
}
```
{% endcode %}
