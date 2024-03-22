# Modes

Lost Pixel can run in different modes to base your visual regression tests on one of the currently available options:

* Storybook(needs built Storybook)
* Ladle(needs built Ladle or running Ladle)
* Histoire(needs built Histoire)
* Page shots
* Custom shots

### Storybook

{% code title="lostpixel.config.ts" %}
```typescript
import { CustomProjectConfig } from 'lost-pixel';

export const config: CustomProjectConfig = {
  storybookShots: {
    storybookUrl: './storybook-static',
  },
  // OSS mode 
  generateOnly: true,
  failOnDifference: true
  
  // Lost Pixel Platform (to use in Platform mode, comment out the OSS mode and uncomment this part )
  // lostPixelProjectId: "xxxx",
  // process.env.LOST_PIXEL_API_KEY,
};
```
{% endcode %}

### Ladle

{% code title="lostpixel.config.ts" %}
```typescript
import { CustomProjectConfig } from 'lost-pixel';

export const config: CustomProjectConfig = {
  ladleShots: {
  // IP should be localhost when running locally & 172.17.0.1 when running in GitHub action
    baseUrl: 'http://172.17.0.1:61000',
  },
  // OSS mode 
  generateOnly: true,
  failOnDifference: true
  
  // Lost Pixel Platform (to use in Platform mode, comment out the OSS mode and uncomment this part )
  // lostPixelProjectId: "xxxx",
  // process.env.LOST_PIXEL_API_KEY,
};
```
{% endcode %}

### Histoire

{% code title="lostpixel.config.ts" %}
```typescript
import { CustomProjectConfig } from 'lost-pixel';

export const config: CustomProjectConfig = {
  histoireShots: {
    histoireUrl: './.histoire/dist',
  },
  // OSS mode 
  generateOnly: true,
  failOnDifference: true
  
  // Lost Pixel Platform (to use in Platform mode, comment out the OSS mode and uncomment this part )
  // lostPixelProjectId: "xxxx",
  // process.env.LOST_PIXEL_API_KEY,
};
```
{% endcode %}

### Page shots

Page screenshots presume any frontend application that can run in the browser. This example uses Next.js

{% code title="lostpixel.config.ts" %}
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
  // OSS mode 
  generateOnly: true,
  failOnDifference: true
  
  // Lost Pixel Platform (to use in Platform mode, comment out the OSS mode and uncomment this part )
  // lostPixelProjectId: "xxxx",
  // process.env.LOST_PIXEL_API_KEY,
};
```
{% endcode %}

### Custom shots

Custom screenshots presume that you take the screenshots on your side & Lost Pixel Platform runs them for Visual Regression tests. In this example, you can use **Cypress** or **Playwright** to make the screenshots during the tests and forward them to the **lost-pixel** folder.

{% code title="lostpixel.config.ts" %}
```typescript
import { CustomProjectConfig } from 'lost-pixel';

export const config: CustomProjectConfig = {
 customShots: {
    currentShotsPath: "./lost-pixel",
  },
  // OSS mode 
  generateOnly: true,
  failOnDifference: true
  
  // Lost Pixel Platform (to use in Platform mode, comment out the OSS mode and uncomment this part )
  // lostPixelProjectId: "xxxx",
  // process.env.LOST_PIXEL_API_KEY,
};
```
{% endcode %}

### Holistic Visual Regression Testing mode

Lost Pixel supports simultaneously using several modes to achieve visual regression testing needs. In the following example, we presume that your app packages some components you want to test with **Ladle** & some **full-page screenshots** that incorporate those components.

{% code title="lostpixel.config.ts" %}
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
  // OSS mode 
  generateOnly: true,
  failOnDifference: true
  
  // Lost Pixel Platform (to use in Platform mode, comment out the OSS mode and uncomment this part )
  // lostPixelProjectId: "xxxx",
  // process.env.LOST_PIXEL_API_KEY,
};
```
{% endcode %}
