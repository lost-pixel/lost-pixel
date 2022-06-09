# Testing workflow (Github Actions)

Whenever your frontend code changes there is a possibility of a visual regression being introduced. It would help if you always strived to automate the testing process and reduce manual labor and blocking tasks.

Given that your storybook build is working & `lost-pixel` config file has been created, we are ready to write the Github Action to spin the visual regression testing on every commit.

Follow the GitHub Actions configuration instructions to set up the CI job. Every run will result in either result in a **green state** ✅ (no visual differences between the baseline image & image resulting from the change) or a **red state** ❌ (visual difference between the baseline image & image resulting from the change).\
\
✅ - you are doing great; your changes have not resulted in a difference in the visual appearance of your components/pages

❌ - there was either intended or **unintended** change in the visual appearance of your components/pages. If change was _intended_, you need to [update the baseline image](testing-and-updating-baseline-locally.md) for that particular story, **OR** if it was _unintended,_ you need to investigate the change and try to bring the visuals back to baseline
