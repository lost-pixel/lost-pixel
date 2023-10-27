---
description: Baseline approval flow
---

# Working with baseline images

1. On the first run of Lost Pixel, you will always get visual snapshots to be added to the platform as a baseline.
2. After each new run, you will have a couple of options for the actions to be performed on the images:
   1. **Remove image**(if it has been deleted from visual tests)
   2. **Approve** the new baseline of the existing image(if the visual snapshot changed in a way we expected it to change)
   3. **Reject** the new baseline(this does not affect the baseline and is done for informational purposes to identify for future reviewers that that snapshot is a **result of a regression**)
3. After you approve all images for the particular build on the Lost Pixel Platform, we will automatically make the **status check on GitHub** **green**.
4. If they are not introducing changes that affect the front end, your subsequent commits shall be green on the Lost Pixel Platform and GitHub.
5. When regression has happened, there will be a **red status check on GitHub and Lost Pixel Platform** - fix it on the side of the product, commit the code, and the new build of Lost Pixel Platform shall be **green again**.
