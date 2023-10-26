---
description: Lost Pixel Platform & Lost Pixel(OSS)
---

# 🖼 What is Lost Pixel?

Lost Pixel is an open-source tool to run visual regression tests on your software project. Currently supported modes include [Storybook](https://storybook.js.org/), [Ladle](https://ladle.dev/), [Histoire](https://histoire.dev/) Page Screenshots(Web app pages) & Custom Screenshots(your own way of making screenshots, e.g. Cypress or Playwright).

Like other tests in software development (e.g., unit and integration tests), visual regression tests exist to detect regressions after changes to the code base have been made. In this case, the focus is on the visual aspect of unintended changes.

Lost Pixel consists of the [Lost Pixel engine(OSS)](https://github.com/lost-pixel/lost-pixel) & [Lost Pixel Platform(SaaS)](https://lost-pixel.com); learn which one fits your needs the best:

{% content-ref url="readme-1.md" %}
[readme-1.md](readme-1.md)
{% endcontent-ref %}

### Why Do I Need Visual Regression Tests?

Visual regression tests do not replace unit and integration tests. They complement them and improve the quality of your delivery.

{% embed url="https://lost-pixel.com/blog/post/visual-regression-testing-101" %}
Learn what is Visual Regression Testing and how you can benefit from it&#x20;
{% endembed %}

The fact that the user interface is what your customers will see makes it even more important to have these quality checks in place.

Developers must be confident that an introduced code change will not break the app. Manually visiting your app's page (and state) to check if everything is rendered correctly is neither pleasant nor effective. This is a process of the past.

> Humans are great at many things - finding visual differences is not one of them.

### Use Cases

Here are a few examples that visual regression tests could help with:

#### Differences In Environments

Developer machines often carry history setups that keep being updated but rarely get a new setup state. They can sometimes deviate from staging and production environments. Catching the resulting differences in production is something that could be prevented.

#### Review Process

If your team has designers and UX people, reviewing code changes by approving visual updates could be of great value. Lost Pixel enables the review process by providing a screenshot of the version before and after the code change. This makes it super easy to understand what impact the change will have.

#### Big Engineering Teams

In bigger engineering teams, it is impossible to know and remember each change to the UI introduced by each developer. With good visual regression tests, developers stop worrying about what they might have broken on the other end of the application.

{% embed url="https://lost-pixel.com/blog/post/visual-regression-testing-101" %}
Lean the Case Studies for Visual Regression testing
{% endembed %}

{% embed url="https://lost-pixel.com/blog/post/5-reasons-to-write-visual-regression-tests" %}
Learn 5 main reasons to add Visual Regression Testing to your test suite
{% endembed %}

### Case studies:

{% embed url="https://lost-pixel.com/blog/post/case-study-prisma" %}
Top-notch teams like prisma.io are using Lost Pixel to overcome their challenges. Learn from their experience.
{% endembed %}

{% embed url="https://lost-pixel.com/blog/post/lost-pixel-adverity-case-study" %}
Teams like Adverity run millions of shots per month and make sure their clients are always looking at impeccable UI
{% endembed %}

### Guides: Jump right in

Follow our handy guides to get started on the basics as quickly as possible:

{% content-ref url="guides/getting-started/getting-started.md" %}
[getting-started.md](guides/getting-started/getting-started.md)
{% endcontent-ref %}

{% content-ref url="guides/getting-started/getting-started-1.md" %}
[getting-started-1.md](guides/getting-started/getting-started-1.md)
{% endcontent-ref %}

{% content-ref url="guides/getting-started/getting-started-2.md" %}
[getting-started-2.md](guides/getting-started/getting-started-2.md)
{% endcontent-ref %}
