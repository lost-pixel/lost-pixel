# Baseline images

Lost Pixel works trough the concept of baseline images. Baseline image is something that is accepted to be the agreed desired state of the resulting component/page snapshot. Lost Pixel keeps the baseline images in a dedicated folder in `.png` format. `current` & `difference`\
paths are utility and used during the run of the action.

\
You could adapt the relative paths to the images in the config file:

{% code title="lost-pixel.config.ts" %}
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
