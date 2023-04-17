# Modes

Lost Pixel is able to run in different modes to base your visual regression tests on one of the currently available options:

* Storybook
* Ladle
* Page shots
* Custom shots

### Storybook

{% code title="lost-pixel.config.ts" %}
```typescript
import { CustomProjectConfig } from 'lost-pixel';

export const config: CustomProjectConfig = {
  storybookShots: {
    storybookUrl: './storybook-static',
  },
  generateOnly: true,
  failOnDifference: true,
};
```
{% endcode %}

### Ladle

{% code title="lost-pixel.config.ts" %}
```typescript
import { CustomProjectConfig } from 'lost-pixel';

export const config: CustomProjectConfig = {
  ladleShots: {
  // IP should be localhost when running locally & 172.17.0.1 when running in GitHub action
    baseUrl: 'http://172.17.0.1:61000',
  },
  generateOnly: true,
  failOnDifference: true,
};
```
{% endcode %}

### Page shots

Page screenshots presume any frontend application that can run in the browser. This example uses Next.js

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
    // IP should be localhost when running locally & 172.17.0.1 when running in GitHub action

    baseUrl: 'http://localhost:3000',
  },
  generateOnly: true,
  failOnDifference: true,
};
```
{% endcode %}

### Custom shots

Custom screenshots presume that you take the screenshots on your side & Lost Pixel Platform runs them for Visual Regression tests. In this example, you can use **Cypress** or **Playwright** to make the screenshots during the tests and just forward them to **lost-pixel** folder.

{% code title="lost-pixel.config.ts" %}
```typescript
import { CustomProjectConfig } from 'lost-pixel';

export const config: CustomProjectConfig = {
 customShots: {
    currentShotsPath: "./lost-pixel",
  },
  lostPixelProjectId: "xxxxxxx",
  apiKey: process.env.LOST_PIXEL_API_KEY,
  lostPixelPlatform: "https://api.staging.lost-pixel.com",
};
```
{% endcode %}

### Holistic Visual Regression Testing mode

Lost Pixel supports simultaneously using several modes to achieve visual regression testing needs. In the following example, we presume that your app packages some components you want to test with **Ladle** & some **full-page screenshots** that incorporate those components.

{% code title="lost-pixel.config.ts" %}
```typescript
import { CustomProjectConfig } from 'lost-pixel';

export const config: CustomProjectConfig = {
  pageShots: {
    pages: [
      { path: '/app', name: 'app' },
      { path: '/next-app', name: 'next-app' },
    ],
    // IP should be localhost when running locally & 172.17.0.1 when running in GitHub action
    baseUrl: 'http://172.17.0.1:3000',

  },
  ladleShots: {
    // IP should be localhost when running locally & 172.17.0.1 when running in GitHub action
    ladleUrl: 'http://172.17.0.1:61000',
  },
  generateOnly: true,
  failOnDifference: true,
};
```
{% endcode %}
