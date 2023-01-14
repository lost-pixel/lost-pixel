---
coverY: 0
---

# Getting started with Storybook

### Prerequisites

- storybook that holds stories to be tested
- lost-pixel configuration file

1. Follow this [storybook guide](https://storybook.js.org/docs/react/get-started/install) to add it to your project in minutes
2. Add lost-pixel [configuration file](../../setup/project-configuration/modes.md#storybook)
3. Add action file in the root of your project. In `.github/workflows/ci.yml`

   ```
   on: [push]
   jobs:
     build:
       runs-on: ubuntu-latest

       steps:
         - name: Checkout
           uses: actions/checkout@v2

         - name: Setup Node
           uses: actions/setup-node@v2
           with:
             node-version: 16.x
             cache: "npm"

         - name: Install dependencies
           run: npm install

         - name: Build Storybook
           run: npm run build-storybook

         - name: Lost Pixel
           uses: lost-pixel/lost-pixel@2.21.0
   ```

4. _(Optional)_ Add [automatic PR for easy baseline update](../../recipes/automatic-baseline-update-pr.md)

{% content-ref url="../../recipes/automatic-baseline-update-pr.md" %}
[automatic-baseline-update-pr.md](../../recipes/automatic-baseline-update-pr.md)
{% endcontent-ref %}

{% hint style="info" %}
Note that your `lostpixel.config.js|ts|cjs|mjs` should point to the correct **relative path to built storybook** or to **served storybook url**
{% endhint %}

After writing your first stories you can adopt the visual regression testing by following [_visual regression testing_ workflow](../testing-workflow-github-actions.md)

{% hint style="info" %}
You can see some popular integrations in the [lost-pixel-examples](https://github.com/lost-pixel/lost-pixel-examples) directory
{% endhint %}
