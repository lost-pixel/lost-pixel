# Project Configuration

Each project needs a configuration file that lives inside the Git repo of the project.

To get started, you can use the init command to create an initial configuration which uses storybook by default, you can [change the mode](modes.md) in the config file later:

```bash
npx lost-pixel init-js
```

This will create a new file `lostpixel.config.js` that looks the following way:

{% code overflow="wrap" %}
```javascript
module.exports = {
  storybookShots: {
    storybookUrl: 'examples/storybook-build/storybook-static',
  },
  // OSS mode 
  generateOnly: true,
  
  // Lost Pixel Platform (to use in Platform mode, comment out the OSS mode and uncomment this part )
  // lostPixelProjectId: "xxxx",
  // process.env.LOST_PIXEL_API_KEY,
};
```
{% endcode %}

### TypeScript

In case you prefer TypeScript (recommended), you will need to do a bit more but will benefit from a much better experience when it comes to configuring the project.

To initialize the configuration run this command:

```bash
npx lost-pixel init-ts
```

We will also need the `lost-pixel` NPM package to get access to the configuration types. Run this command to add it as a developer dependency:

```bash
npm i -D lost-pixel
```

Finally, we can take a look at the created configuration file `lostpixel.config.ts`. You can notice that it includes types already, which makes writing the configuration so much easier (IDE IntelliSense, type safety, ...).

```typescript
import { CustomProjectConfig } from 'lost-pixel';

export const config: CustomProjectConfig = {
  storybookShots: {
    storybookUrl: 'examples/storybook-build/storybook-static',
  },
 // OSS mode 
  generateOnly: true,
  
  // Lost Pixel Platform (to use in Platform mode, comment out the OSS mode and uncomment this part )
  // lostPixelProjectId: "xxxx",
  // process.env.LOST_PIXEL_API_KEY,
};
```

{% hint style="info" %}
Don't forget to include the configuration file in your `tsconfig.json`
{% endhint %}
