# Programmatically generated pages

Lost Pixel config can reduce boilerplate in your Page shots. If you can programmatically generate the list of pages and make them accessible to Lost Pixel, it will function as well as providing them manually:

{% code title="lostpixel.config.js" %}
```
module.exports = {
  pageShots: {
    pagesJsonUrl: 'http://172.17.0.1:9000/lost-pixel.json',
    baseUrl: 'http://172.17.0.1:9000',

  },
  lostPixelProjectId: 'YOUR_PROJECT_ID',
  apiKey: process.env.LOST_PIXEL_API_KEY,
  },
}
```
{% endcode %}

`pagesJsonUrl` In this case, it returns the list of pages like Lost Pixel expects them:

```
 pages: [{ path: '/app', name: 'app' },{ path: '/blog', name: 'blog' }],
```
