<div align='center'><img width='150px' height='150px' src='https://user-images.githubusercontent.com/29632358/168112844-77e76a0d-b96f-4bc8-b753-cd39f4afd428.png'>
</div>
<div align="center">
  <h1>Lost Pixel</h1>
  <h2>Holistic visual regression testing solution </h2>  
  <a href="https://www.npmjs.com/package/lost-pixel"><img src="https://img.shields.io/npm/v/lost-pixel?style=plastic" /></a>
  <a href="https://github.com/lost-pixel/lost-pixel/blob/main/docs/contributing.md"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" /></a>
  <a href="https://github.com/lost-pixel/lost-pixel/blob/main/LICENSE"><img src="https://img.shields.io/github/license/lost-pixel/lost-pixel" /></a>
  <br />
  <hr />
  <a href="https://docs.lost-pixel.com/user-docs">Documentation</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://docs.lost-pixel.com/user-docs/community-edition/getting-started">Quickstart</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://github.com/lost-pixel/lost-pixel-examples">Examples</a>
  <br />
  <br />
</div>

## What is Lost Pixel?

**Lost Pixel** is an open source visual regression testing tool. Run visual regression tests on your **Storybook** and **Ladle** stories and on your application pages.

**Lost Pixel** consists of two products:

- **lost-pixel** (*open BETA*) - the core engine driving the visual regression test runs. It could be used standalone and the main use-cases are outlined in the documentation
- **lost-pixel-platform** (*closed BETA*) -  the UI and CI helpers that allow you to use lost-pixel's managed version. Configure it just once and enjoy hassle free visual regression tests integrated into your GitHub actions pipeline. 
###  📇 Fill in the form to participate in closed beta for free.

<hr/>

## Ladle example 🥄

Assuming you are using [basic example of Ladle](https://github.com/tajo/ladle)

Add `lostpixel.config.ts` at the root of the project:

```typescript
import { CustomProjectConfig } from "lost-pixel";

export const config: CustomProjectConfig = {
  ladleShots: {
    ladleUrl: "http://172.17.0.1:61000",
  },
  generateOnly: true,
  failOnDifference: true
};
```

Update `package.json` with following scripts:

```json
 "scripts": {
    "serve": "npx serve build -p 61000",
    "build": "ladle build"
  },
```

Add GitHub action `.github/workflows/lost-pixel-run.yml`

```yml
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

      - name: Build ladle
        run: npm run build

      - name: Serve ladle
        run: npm run serve &

      - name: Lost Pixel
        uses: lost-pixel/lost-pixel-action@v2.7.0
```

To see more examples(storybook/pages), recipes and intended usage workflow visit the documentation.

## Contributing

**Lost Pixel** is open source in it's heart and welcomes any external contribution. You can refer to [CONTRIBUTING.md](https://github.com/lost-pixel/lost-pixel/blob/main/CONTRIBUTING.md) to get going with the project locally in couple of minutes.


