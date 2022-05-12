<div align='center'><img width='150px' height='150px' src='https://user-images.githubusercontent.com/29632358/168112844-77e76a0d-b96f-4bc8-b753-cd39f4afd428.png'>
</div>
<div align="center">
  <h1>Lost Pixel</h1>
  <a href="https://www.npmjs.com/package/lost-pixel-action"><img src="https://img.shields.io/npm/v/lost-pixel-action?style=plastic" /></a>
  <a href="https://github.com/lost-pixel/lost-pixel-action/blob/main/docs/contributing.md"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" /></a>
  <a href="https://github.com/lost-pixel/lost-pixel-action/blob/main/LICENSE"><img src="https://img.shields.io/github/license/lost-pixel/lost-pixel-action" /></a>
  <br />
  <br />
  <a href="https://docs.lost-pixel.com">Documentation</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://docs.lost-pixel.com/quickstart">Quickstart</a>
</div>

## What is Lost Pixel?

Lost Pixel is your hassle-free way of running on-demand visual regression tests. Run visual regression tests on your Storybook stories and conveniently compare and approve visual differences using a UI.

<div align='center'><video src='https://user-images.githubusercontent.com/29632358/168114749-44a9244a-bcd8-42a6-b783-905c9f144f04.mp4' /></div>

## Setup

The integration is done by adding this action to your workflow file.

### Using You Own Lost Pixel Server

Example workflow for a project called `your-project-name` using an S3 bucket on Digital Ocean.

```
- name: Lost Pixel
  uses: lost-pixel/lost-pixel-action@v1beta
```


