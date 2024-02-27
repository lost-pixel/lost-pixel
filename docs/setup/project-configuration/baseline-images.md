# Baseline images

{% hint style="danger" %}
This part of the documentation is only relevant for Lost Pixel(OSS) mode
{% endhint %}

Lost Pixel works through the concept of baseline images. A baseline image is something that is accepted to be the agreed desired state of the resulting component/page snapshot. Lost Pixel keeps the baseline images in a dedicated folder in `.png` format. `current` & `difference`\
paths are utility and used during the run of the action.

\
You could adapt the relative paths to the images in the config file:

{% code title="lostpixel.config.ts" %}
```typescript
import { CustomProjectConfig } from 'lost-pixel';

export const config: CustomProjectConfig = {
  ladleShots: {
    ladleUrl: 'http://localhost:61000',
  },
  imagePathBaseline: "./baseline-images",
  imagePathCurrent: "./current-images",
  imagePathDifference: "./difference-images",
  generateOnly: true,
};
```
{% endcode %}
