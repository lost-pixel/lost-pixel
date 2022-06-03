# Testing workflow (Github Actions)

Whenever your frontend code changes there is a possibility of a visual regression being introduced. You should always strive to automate testing process and reduce manual labor and blocking tasks.

Given that your storybook build is working & `lost-pixel` config file has been created we are ready to write the Github Action to spin the visual regression testing on every commit.

Follow the instructions from[ GitHub Actions configuration](../setup/integrating-with-github-actions.md) to setup the CI job. Every run will result either result in **green state** ✅ (no visual differences between the baseline image & image resulting from the change) or **red state** ❌ (visual difference between the baseline image & image resulting from the change).\
\
✅ - you are doing great, your changes have not resulted in change of visual appearance of your components/pages

❌ - there was either intended or **unintended**  change in visual appearance of your components/pages. If change was _intended_, you need to [update the baseline image](testing-and-updating-baseline-locally.md) for that particular story **OR** if it was _unintended_ you need to investigate the change and try to bring the visuals back to baseline
