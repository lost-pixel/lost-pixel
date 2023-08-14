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
4. Build storybook to execute lost-pixel against 
    ```
    npm run build-example-storybook
    ```
4. Start developing and execute the action against the local static build of storybook:
   ```
   npm run dev
   ```

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
