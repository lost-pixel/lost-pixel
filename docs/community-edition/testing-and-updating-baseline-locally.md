# Testing & updating baseline locally

In `open source edition` of Lost Pixel **** the updates of baselines are happening on the machines of developers. If you have failing visual regression tests ❌ with an **intended** change in visual appearance of your components/pages after the code modifications you will need to run Lost Pixel **** update locally and commit new baselines to git repository:\
\
`npx lost-pixel-action update`

{% hint style="warning" %}
Open Source edition of Lost Pixel is aimed at giving you building blocks for creating your own visual regression testing pipelines with some limitations
{% endhint %}

* You need to manually update the baselines on intended changes&#x20;
* You need to block the developer's machine for the time the screenshots are regenerated
* Your easiest way of comparing the before/after images is using GitHub split view

{% hint style="info" %}
You can use **Lost Pixel Platform** to have a lot of added value and mitigate the complexity of setting up your testing workflow. Learn more about Lost Pixel Platform(link).
{% endhint %}
