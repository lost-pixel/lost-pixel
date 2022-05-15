# Project Configuration

Each project needs a configuration file that sits inside the Git repo of the project.

To get started you can use the init command to create an initial configuration:

```bash
npx lost-pixel-action init-js
```

This will create a new file `lostpixel.config.js` that might look somewhat like that:

```javascript
module.exports = {
  lostPixelProjectId: 'YOUR_PROJECT_ID',
};
```

### TypeScript

In case you prefer TypeScript (recommended) you will need to do a bit more but will benefit from a much better experience when it comes to configuring the project.

To initialize the configuration run this command:

```bash
npx lost-pixel-action init-ts
```

We will also need the `lost-pixel-action` NPM package to get access to the configuration types. Run this command to add it as a developer dependency:

```bash
npm i -D lost-pixel-action
```

Finally, we can take a look at the created configuration file `lostpixel.config.ts`. You can notice that it includes types already, which makes the job of writing the configuration so much easier (IDE IntelliSense, type safety, ...).

```typescript
import { CustomProjectConfig } from 'lost-pixel-action'

export const config: CustomProjectConfig = {
  lostPixelProjectId: 'YOUR_PROJECT_ID',
};
```

{% hint style="info" %}
Don't forget to include the configuration file in your `tsconfig.json`
{% endhint %}
