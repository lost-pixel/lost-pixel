# 🖼 What is Lost Pixel?

Lost Pixel is a tool to run visual regression tests on your software project. Currently supported modes include: Storybook(link tbd), Ladle(link tbd) and Page Screenshots(link tbd)

Like other tests in software development (e.g., unit and integration tests), visual regression tests exist to detect regressions after changes to the code base have been made. In this case, the focus is on the visual aspect of unintended changes.

### Why Do I need Visual Regression Tests?

Visual regression tests do not replace unit and integration tests. They complement them and improve the quality of your delivery.

Especially the fact that the user interface is what your customers will see makes it even more important to have these quality checks in place.

Any developer must be confident that an introduced code change will not break the app. Manually visiting your app's page (and state) to check if everything is rendered correctly is neither pleasant nor effective. This is a process of the past.

> Humans are great at many things - finding visual differences is not one of them.

### Use Cases

A few examples that visual regression tests could help with:

#### Differences In Environments

Developer machines often carry history setups that keep being updated but rarely get a new setup state. They can sometimes deviate from staging and production environments. Catching the resulting differences in production is something that could be prevented.

#### Review Process

If your team has designers and UX people, it could be of great value to review code changes by approving visual updates. Lost Pixel enables the review process by providing a screenshot of the version before and after the code change. This makes it super easy to understand what impact the change will have.

#### Big Engineering Teams

In bigger engineering teams, it is impossible to know and remember each change to the UI introduced by each developer. With good visual regression tests, developers stop worrying about what they might have broken on the other end of the application.

### Guides: Jump right in

Follow our handy guides to get started on the basics as quickly as possible:

{% content-ref url="broken-reference/" %}
[broken-reference](broken-reference/)
{% endcontent-ref %}

{% content-ref url="setup/project-configuration/" %}
[project-configuration](setup/project-configuration/)
{% endcontent-ref %}

{% content-ref url="broken-reference" %}
[Broken link](broken-reference)
{% endcontent-ref %}
