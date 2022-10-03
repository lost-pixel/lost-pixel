# Integrating With GitHub Actions

Lost Pixel has the first class support for GitHub Actions offering a dedicated action in the GitHub Action Marketplace:

```
- name: Lost Pixel
  uses: lost-pixel/lost-pixel@v2.22.2
```

As outlined in [modes](project-configuration/modes.md) Lost Pixel can run in different modes or in all of them simultaneously. You would need to build the respective provider and serve it in the action to make it available for the Lost Pixel e.g. build & serve storybook, build & serve ladle, build & serve next app

Here's an example of a full workflow file that builds the Storybook before continuing with Lost Pixel. To make it run you just need to place `vis-reg-test.yml` into `.github/workflows` at the root for your project. This will execute the Lost Pixel visual regression tests on every commit:

{% code title="vis-reg-test.yml" %}

```yaml
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
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build Storybook
        run: npm run build-storybook

      - name: Lost Pixel
        uses: lost-pixel/lost-pixel@v2.22.2
```

{% endcode %}
