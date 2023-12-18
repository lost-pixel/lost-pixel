---
description: Run lost-pixel locally to debug visual testing issues easier
---

# Local debugging

If you are setting up the Lost Pixel platform for the project for the first time, there are high chances that you will need to make sure everything looks good for your baselines and tweak a thing or two. Waiting for CI to finish to look at how your changes have affected the visual testing is tedious. We provide a utility via \`lost-pixel\` CLI to help streamline it.

{% code title="lostpixel.config.ts" %}
````
```typescript
import { CustomProjectConfig } from 'lost-pixel';

export const config: CustomProjectConfig = {
	pageShots: {
		pages: [
			{ path: '/', name: 'landing' },
			{
				path: '/blog',
				name: 'blog',
			},
		],
		baseUrl: 'http://172.17.0.1:3000',
		breakpoints: [640, 1024],
	},
	lostPixelProjectId: 'YOUR_PROJECT_ID',
	apiKey: process.env.LOST_PIXEL_API_KEY,
};

```
````
{% endcode %}

For this config, just run `npx lost-pixel local`\
\
This will ensure that the `platform mode` is overridden by `oss mode` and you can see your screenshots done locally.

Under the hood `local` flag overrides `lostPixelProjectId` with `genereateOnly:true` and for **`pageShots`** replaces anything in your **host** part of `baseUrl` with **localhost.** The above example becomes `baseUrl: 'http://localhost:3000'`&#x20;
