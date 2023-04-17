# Automatic baseline updates on selected branches

Sometimes your team uses Visual Regression Testing flow in a non-enforcement way, meaning that Lost Pixel checks don't need to pass for a PR to be qualified for a merge.&#x20;

In this case, to speed up your review flow, you can set up the automatic approval of baselines in Lost Pixel Platform whenever PR is merged into a defined branch. In this case, the branch is defined as `main` but Lost Pixel Platform supports regex syntax, and you can easily use multiple branches here or even branches that follow some regex pattern, e.g.: `main|master|develop`\


<figure><img src="../../.gitbook/assets/image (5).png" alt=""><figcaption><p>Lost Pixel Platform automatic baseline updates settings</p></figcaption></figure>

In this setup, whenever somebody merges a PR containing unapproved visual tests, they will be automatically approved on the main branch and will not appear in the next runs unless they have new changes.
