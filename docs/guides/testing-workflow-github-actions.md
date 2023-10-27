# Testing workflow (GitHub Actions)

Whenever your frontend code changes, there is a possibility of a visual regression being introduced. Lost Pixel automates the testing process and reduces manual labor and blocking tasks.

<figure><img src="../.gitbook/assets/9442aab8e86a1d9b4a9d20a80ffe20d83830c314-2151x1572 (1).png" alt="" width="338"><figcaption><p>VIsual Testing Process</p></figcaption></figure>

Follow the GitHub Actions configuration instructions to set up the CI job. Every run will result in either a **green state** ✅ (no visual differences between the baseline image & image resulting from the change) or a **red state** ❌ (visual difference between the baseline image & image resulting from the change).\
\
✅ - you are doing great; your changes have not resulted in a difference in the visual appearance of your components/pages

❌ - there was either an intended or **unintended** change in the visual appearance of your components/pages. If the change was _intended_, you need to [update the baseline image](testing-and-updating-baseline-locally.md) for that particular story, **OR** if it was _unintended,_ you need to investigate the change and try to bring the visuals back to baseline
