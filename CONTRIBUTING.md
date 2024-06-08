## Contributing to Lost Pixel

Before jumping into a PR be sure to search [existing PRs](https://github.com/lost-pixel/lost-pixel/pulls) or [issues](https://github.com/lost-pixel/lost-pixel/issues) for an open or closed item that relates to your submission.

## Developing

The development branch is `main`. This is the branch that all pull requests should be made against.

To develop locally:

1. [Fork](https://help.github.com/articles/fork-a-repo/) this repository to your
   own GitHub account and then
   [clone](https://help.github.com/articles/cloning-a-repository/) it to your local device.

   ```sh
   git clone https://github.com/lost-pixel/lost-pixel.git
   ```

2. Create a new branch:
   ```
   git checkout -b MY_BRANCH_NAME
   ```
3. Install the dependencies with:
   ```
   npm install
   ```
4. Build storybook to execute lost-pixel (e.g. storybook v8 in examples/example-storybook-v8 folder)

   ```
   npm run build-example-storybook-v8
   ```

   Or the version you want to run lost-pixel against. (There are different storybook versions you can build for more information check the package.json file)

5. Start developing and execute the action against the local static build of storybook:

   Go into the folder you want to run lost-pixel against

   ```
   cd examples/example-storybook-v8
   ```

   ```
   npx ts-node ../../src/bin.ts
   ```

   will run lost-pixel against the storybook in the folder you are in.

6. Running lost-pixel against all storybook versions.

   In order to run lost-pixel against all storybook versions start by compiling each storybook statically using the scripts in package.json

   ```
   npm run build-example-storybook-v6.4
   npm run build-example-storybook-v6.5-storystore-v7
   npm run build-example-storybook-v8
   ```

   Compile lost-pixel

   ```
   npm run build
   ```

   Run lost-pixel against all storybooks versions :

   ```
   npm run test-on-examples
   ```

   This will run lost-pixel in each storybook version on the examples folder.

## Running tests

**Lost Pixel** is committed to testing the core flows of the application, so if you are contributing to those we highly encourage you to add test coverage as well.

To run test locally:

```
npm run test
```

## Linting application

To check the formatting of your code:

```
npm run lint
```

## Getting your work merged

When you are satisfied with your work open a PR against the `main` branch and somebody from project maintainers will help you review & merge it!
