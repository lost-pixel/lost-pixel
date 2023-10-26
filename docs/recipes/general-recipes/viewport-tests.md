# Viewport tests

Lost Pixel supports testing different viewports. You can use the **breakpoints** option in the config. Page/story level breakpoints will override the top-level breakpoints.

{% hint style="info" %}
Breakpoint tests are supported in both OSS and Platform versions of Lost Pixel
{% endhint %}

{% code title="lostpixel.config.ts" %}
```typescript

import { CustomProjectConfig } from 'lost-pixel';

export const config: CustomProjectConfig = {
    pageShots: {
        pages: [
            { path: '/', name: 'landing' },
            {
                path: '/blog',
                name: 'blog',
                breakpoints: [800, 1400],
            },
        ],
        baseUrl: 'http://172.17.0.1:3000',
        breakpoints: [640, 1024],
    },
    waitBeforeScreenshot: 3500,
    lostPixelProjectId: 'clb1xlaeo1299101qqkt94cn43',
    apiKey: process.env.LOST_PIXEL_API_KEY,
};
```
{% endcode %}

<figure><img src="../../.gitbook/assets/Screenshot 2023-10-26 at 14.51.55.png" alt=""><figcaption></figcaption></figure>
