---
coverY: 0
---

# Getting started with Next js

### Prerequisites

- storybook that holds stories to be tested
- lost-pixel configuration file

1. Follow this [next.js quickstart doc](https://nextjs.org/docs) to have a basic example up and running
2. Add lost-pixel [configuration file](../../setup/project-configuration/modes.md#page-shots)
3. Add action file in the root of your project. In `.github/workflows/ci.yml`

   <pre><code>on: [push]
   <strong>jobs:
   </strong>  build:
       runs-on: ubuntu-latest
   
       steps:
         - name: Checkout
           uses: actions/checkout@v3
   
         - name: Setup Node
           uses: actions/setup-node@v3
           with:
             node-version: 18.x
             cache: "npm"
   
         - name: Install dependencies
           run: npm install
   
         - name: Build ladle
           run: npm run build
   
         - name: Serve ladle
           run: npm run serve &#x26;
   
         - name: Lost Pixel
           uses: lost-pixel/lost-pixel@v3.7.2
   </code></pre>

4. _(Optional)_ Add [automatic PR for easy baseline update](../../recipes/lost-pixel-oss/automatic-baseline-update-pr.md)

{% content-ref url="../../recipes/lost-pixel-oss/automatic-baseline-update-pr.md" %}
[automatic-baseline-update-pr.md](../../recipes/lost-pixel-oss/automatic-baseline-update-pr.md)
{% endcontent-ref %}

After writing your first stories you can adopt the visual regression testing by following [_visual regression testing_ workflow](../testing-workflow-github-actions.md)

{% hint style="info" %}
You can see some popular integrations in the [lost-pixel-examples](https://github.com/lost-pixel/lost-pixel-examples) directory
{% endhint %}
