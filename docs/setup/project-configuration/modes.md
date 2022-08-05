# Modes

Lost Pixel is able to run in different modes to base your visual regression tests on one of the currently available options:

* Storybook
* Ladle
* Page shots

### Storybook

{% code title="lost-pixel.config.ts" %}
```typescript
import { CustomProjectConfig } from 'lost-pixel';

export const config: CustomProjectConfig = {
  storybookShots: {
    storybookUrl: './storybook-static',
  },
  generateOnly: true,
};
```
{% endcode %}

### Ladle

{% code title="lost-pixel.config.ts" %}
```typescript
import { CustomProjectConfig } from 'lost-pixel';

export const config: CustomProjectConfig = {
  ladleShots: {
    ladleUrl: 'http://localhost:61000',
  },
  generateOnly: true,
  failOnDifference: true,
};
```
{% endcode %}

### Page shots

Page screenshots presume any frontend application that can run in browser. This example uses Next.js

{% code title="lost-pixel.config.ts" %}
```typescript
import { CustomProjectConfig } from 'lost-pixel';

export const config: CustomProjectConfig = {
  pageShots: {
    pages: [
      { path: '/app', name: 'app' },
      { path: '/next-app', name: 'next-app' },
      { path: '/next-app?name=App', name: 'next-app-with-query-param' },
      { path: '/fetch', name: 'fetch-static-props' },
      { path: '/client-fetch', name: 'fetch-client' },
    ],
    pageUrl: 'http://localhost:3000',
  },
  generateOnly: true,
};
```
{% endcode %}

### Simultaneous mode

Lost Pixel supports using several modes simultaneously to achieve your visual regression testing needs. In the following example we presume that your app packages some components that you want to test with **Ladle** & some full page screenshots that incorporate those components.

{% code title="lost-pixel.config.ts" %}
```typescript
import { CustomProjectConfig } from 'lost-pixel';

export const config: CustomProjectConfig = {
  pageShots: {
    pages: [
      { path: '/app', name: 'app' },
      { path: '/next-app', name: 'next-app' },
    ],
    pageUrl: 'http://localhost:3000',
  },
  ladleShots: {
    ladleUrl: 'http://localhost:61000',
  },
  generateOnly: true,
};
```
{% endcode %}
