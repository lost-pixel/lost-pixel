# Masking page elements

Lost Pixel supports masking elements that can be flaky during visual tests. Lazy-loaded images, animated components, and other parts of pages are all good candidates for masking them out.

You can use any selectors to mask the elements on the page. Refer to api reference for more details:

[mask.md](../../api-reference/mask.md "mention")

{% code title="lostpixel.config.ts" %}
```typescript

import { CustomProjectConfig } from 'lost-pixel';

export const config: CustomProjectConfig = {
  pageShots: {
    pages: [
      { path: '/app', name: 'app' },
      {
        path: '/app',
        name: 'app-masked',
        mask: [{ selector: 'code' }, { selector: 'h2' }],
        breakpoints: [360, 500],
      },
      { path: '/next-app', name: 'next-app' },
    ],
    baseUrl: 'http://127.0.0.1:3000',
  },
  generateOnly: true,
  failOnDifference: true,
};
```
{% endcode %}

<figure><img src="../../.gitbook/assets/app-masked__[w500px].png" alt="" width="250"><figcaption></figcaption></figure>
