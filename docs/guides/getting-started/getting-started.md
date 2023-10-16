---
coverY: 0
---

# Getting started with Ladle

### Prerequisites

- ladle that holds stories to be tested
- lost-pixel configuration file

1. Follow this [handy ladle guide ](https://ladle.dev/docs/setup)to add it to your project in minutes
2. Add lost-pixel [configuration file](../../setup/project-configuration/modes.md#ladle)
3. Add action file in the root of your project. In `.github/workflows/ci.yml`

   {% code overflow="wrap" %}

   ```
   on: [push]
   jobs:
     build:
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
          run: npm run serve &

        - name: Lost Pixel
          uses: lost-pixel/lost-pixel@v3.7.2
   ```

   {% endcode %}

4. _(Optional)_ Add [automatic PR for easy baseline update](../../recipes/lost-pixel-oss/automatic-baseline-update-pr.md)

{% content-ref url="../../recipes/lost-pixel-oss/automatic-baseline-update-pr.md" %}
[automatic-baseline-update-pr.md](../../recipes/lost-pixel-oss/automatic-baseline-update-pr.md)
{% endcontent-ref %}

After writing your first stories you can adopt the visual regression testing by following [_visual regression testing_ workflow](../testing-workflow-github-actions.md)

{% hint style="info" %}
This example is available [here](https://github.com/lost-pixel/lost-pixel-examples/tree/main/example-ladle). You can see some other popular integrations in the [lost-pixel-examples](https://github.com/lost-pixel/lost-pixel-examples) directory.
{% endhint %}
