# Storybook Element locator for components

In case you build something like a design system, you can use the `elementLocator` property to take a screenshot of the exact component you want to test.

This property is a CSS selector that will be used to find the element in the DOM. The screenshot will be taken of the first element that matches the selector.

You can add this property to `lostpixel.config.ts` like so:

### lostpixel.config.ts - works for all modes

```ts
// @ts-nocheck

import { CustomProjectConfig } from 'lost-pixel';

export const config: CustomProjectConfig = {
  storybookShots: {
    storybookUrl: './storybook-static',
    elementLocator: '#root > *:first-child',
  },
  generateOnly: true,
  failOnDifference: true,
};
```

Or you can add it to the `parameters` of a story like so (only works in storybookShots mode at the moment):

### Storybook example
```ts
export const LoggedOut = Template.bind({});
LoggedOut.args = {};
LoggedOut.parameters = {
  lostpixel: {
    elementSelector: '#root',
  },
};
```