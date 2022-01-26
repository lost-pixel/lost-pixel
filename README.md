# GitHub Action for Lost Pixel integration

Run visual regression tests on your Storybook stories and conveniently compare and approve visual differences using a UI.

## Setup

The integration is done by adding this action to your workflow file.

### Using You Own Lost Pixel Server

Example workflow for a project called `your-project-name` using an S3 bucket on Digital Ocean.

```
- name: Lost Pixel
  uses: lost-pixel/lost-pixel-action@v1beta
  with:
    LOST_PIXEL_PROJECT_ID: ${{ secrets.LOST_PIXEL_PROJECT_ID }}
    S3_END_POINT: 'fra1.digitaloceanspaces.com'
    S3_ACCESS_KEY: ${{ secrets.S3_ACCESS_KEY }}
    S3_SECRET_KEY: ${{ secrets.S3_SECRET_KEY }}
    S3_BUCKET_NAME: 'your-project-name'
```
