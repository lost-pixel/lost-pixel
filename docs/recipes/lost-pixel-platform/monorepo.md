---
description: Set up Lost Pixel Platform with Monorepo (GitHub Actions)
---

# Monorepo

Follow a comprehensive  tutorial covering the Lost Pixel + Turborepo setup(WIP)

\
The GitHub action below focuses on running Lost Pixel in monorepo mode on the Lost Pixel Platform. You need to enable this on the Platform UI first in the repository settings:\


<figure><img src="../../.gitbook/assets/image (8).png" alt=""><figcaption><p>Lost Pixel Platform - monorepo mode in settings</p></figcaption></figure>

{% code title=".github/workflows/vrt.yml" %}
```yaml
on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  lost_pixel:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        config:
          - {
              package: "apps/web",
              name: "Lost Pixel for Web",
              command: "pnpm run dev",
            }
          - {
              package: "apps/docs",
              name: "Lost Pixel for Docs",
              command: "pnpm run dev",
            }
    steps:
      - name: Checkout
        uses: actions/checkout@v2

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 16.x

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 7.17.1

      - name: Install dependencies
        run: pnpm install

      - name: Cache Build
        uses: actions/cache@v2
        with:
          path: |
            apps/web/.next
            apps/docs/.next
          key: ${{ runner.os }}-build-${{ github.sha }}
          restore-keys: |
            ${{ runner.os }}-build-${{ github.sha }}

      - name: Start App
        run: cd ${{ matrix.config.package }} && ${{ matrix.config.command }} &
        env:
          CI: true

      - name: ${{ matrix.config.name }}
        uses: lost-pixel/lost-pixel@v3.7.1
        env:
          LOST_PIXEL_API_KEY: ${{ secrets.LOST_PIXEL_API_KEY }}
          LOST_PIXEL_CONFIG_DIR: ${{ matrix.config.package }}
  finalize:
    needs: [lost_pixel]
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v2

      - name: Lost Pixel Finalize
        uses: lost-pixel/lost-pixel@v3.7.1
        env:
          LOST_PIXEL_API_KEY: ${{ secrets.LOST_PIXEL_API_KEY }}
          LOST_PIXEL_CONFIG_DIR: apps/web
        with:
          FINALIZE: true
```
{% endcode %}

To run Lost Pixel in monorepo, you must ensure that you have two[ lostpixel.config.ts|js](../../api-reference/lost-pixel.config.js-or-ts.md) files in respective monorepo packages.&#x20;

#### FInalise action

As seen above, a Lost Pixel Finalize step is required to wrap up the Lost Pixel run and create respective GitHub commit checks. The final step needs to point to any of the monorepo [lostpixel.config.js|ts](../../api-reference/lost-pixel.config.js-or-ts.md), in this case, it is `apps/web` but we can easily replace it with `apps/docs` with no effect on the run
