# Testing & updating baseline locally

In the `open-source edition` of Lost Pixel, the updates of baselines are happening on the developers' machines. If you have failed visual regression tests ❌ with an **intended** change in the visual appearance of your components/pages. After the code modifications, you will need to run the Lost Pixel update locally and commit new baselines to the git repository:\
\
`npx lost-pixel-action update`

{% hint style="warning" %}
The Open Source edition of Lost Pixel aims to give you building blocks for creating your visual regression testing pipelines with some limitations.
{% endhint %}

* You need to update the baselines on intended changes manually.
* It would help if you blocked the developer's machine for the time the screenshots are regenerated.
* GitHub split view is your most straightforward way of comparing the before/after images.

{% hint style="info" %}
You can use **Lost Pixel Platform** to have a lot of added value and mitigate the complexity of setting up your testing workflow. Learn more about Lost Pixel Platform(link).
{% endhint %}
