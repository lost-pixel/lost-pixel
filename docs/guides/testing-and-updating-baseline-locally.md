# Updating baseline images

{% hint style="warning" %}
The Open Source edition of Lost Pixel aims to give you building blocks for creating your visual regression testing pipelines with some limitations.
{% endhint %}

In the `open-source edition` of Lost Pixel, the updates of baselines is something that engineers need to take care of. If you have failed visual regression tests ❌ with an **intended** change in the visual appearance of your components/pages according to the [visual regression testing workflow ](testing-workflow-github-actions.md)you need to **update the baseline** to reflect the intended change. After the code modifications, you will need to run the Lost Pixel update and commit new baselines to the git repository:

* You need to update the baselines on intended changes manually
* <mark style="color:green;background-color:green;">RECOMMENDED local flow:</mark> You can run the baseline update locally with `npx lost-pixel docker update`. This will ensure that there are no operating system-related differences and will update your baselines.
* <mark style="color:green;background-color:green;">RECOMMENDED CI flow:</mark> Lost Pixel provides a [useful recipe to create automatic PR with updated baselines](../recipes/lost-pixel-oss/automatic-baseline-update-pr.md) in case of visual regression
* GitHub split view is your most straightforward way of comparing the before/after images.

{% hint style="info" %}
You can use **Lost Pixel Platform** to reduce the complexity of your testing workflow & drastically increase the speed and turnaround of the baseline updates.
{% endhint %}

{% embed url="https://lost-pixel.com" %}
Lost Pixel Platform
{% endembed %}
