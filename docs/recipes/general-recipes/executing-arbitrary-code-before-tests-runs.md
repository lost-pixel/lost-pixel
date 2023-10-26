# Executing arbitrary code before tests runs

Lost Pixel supports arbitrary code execution through Playwright `page.evaluate() & page.addStyleTag()`. This will ensure that you isolate all the changes in the browser execution to Lost Pixel runs; **your normal code & customers will not be affected by this.**

{% code title="lostpixel.config.js" %}
```javascript
module.exports = {
  pageShots: {
    baseUrl: 'http://172.17.0.1:9000',
    mask: [{ selector: 'span.gatsby-resp-image-background-image' }],
  },
  lostPixelProjectId: 'clb5ek3mm1772001qqg7yban38',
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
