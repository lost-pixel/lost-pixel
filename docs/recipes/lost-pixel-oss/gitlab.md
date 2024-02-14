# GitLab Integration

While GitHub is the target of this project, one approach to integrate it with GitLab is the following:

1) Add the following to your package.json scripts:

    ```json
    "lostPixel": "bunx lost-pixel docker update --dockerArgs=\"--user $(id -u):$(id -g)\"",
    "lostPixel:currentAsBaseline": "rm -rf .lostpixel/baseline && cp -r .lostpixel/current/* .lostpixel/baseline"
    ```
    
    We add this dockerArgs as docker may create the files with root as the owner, not allowing us to remove the baseline files by ourselves.

2) In your `.gitlab-ci.yml` file, add the following:

