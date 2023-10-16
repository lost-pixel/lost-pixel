# Integrating With GitHub Actions

Lost Pixel has first-class support for GitHub Actions offering a dedicated action in the GitHub Action Marketplace:

```
- name: Lost Pixel
  uses: lost-pixel/lost-pixel@v3.7.2
```

As outlined in [modes](project-configuration/modes.md), Lost Pixel can run in different modes or all of them simultaneously. You would need to build the respective provider and serve it in the action to make it available for the Lost Pixel, e.g. build & serve storybook, build & serve ladle, build & serve next app

Here's an example of a full workflow file that builds the Storybook before continuing with Lost Pixel. To make it run, you need to place `vis-reg-test.yml` into `.github/workflows` at the root of your project. This will execute the Lost Pixel visual regression tests on every commit:

{% code title="vis-reg-test.yml" %}
```yaml
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
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build Storybook
        run: npm run build-storybook

      - name: Lost Pixel
        uses: lost-pixel/lost-pixel@v3.7.2
```
{% endcode %}

{% hint style="info" %}
Using Lost Pixel in **Platform Mode,** you need to provide the `LOST_PIXEL_API_KEY`

`to the action:`

```
- name: Lost Pixel
  uses: lost-pixel/lost-pixel@v3.7.2
  env:
      LOST_PIXEL_API_KEY: ${{ secrets.LOST_PIXEL_API_KEY }}
```
{% endhint %}
