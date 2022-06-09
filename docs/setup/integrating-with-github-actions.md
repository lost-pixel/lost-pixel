# Integrating With GitHub Actions

To configure Lost Pixel, you only need to add this step to your GitHub workflow file:

```
- name: Lost Pixel
  uses: lost-pixel/lost-pixel-action@v1.6.0
```

Of course, you will need a **Storybook build** for this to work.

Here's an example of a full workflow file that builds the Storybook before continuing with Lost Pixel:

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
        uses: lost-pixel/lost-pixel-action@v1.12.1
```

Depending on your individual project needs, there might be many other steps before and after that. For example, linter checks, builds, registry uploads, code coverage reports, etc.

For Lost Pixel to work, you only need a freshly built Storybook.
