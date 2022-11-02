Command for running with path to config from root with `storybookUrl` also referenced relatively from the root: 
`docker run --rm -it -v $PWD:/workspace -e WORKSPACE=/workspace -e LOST_PIXEL_CONFIG_DIR=examples/example-storybook-v6.5-storystore-v7 lostpixel/lost-pixel:v2.17.0`

- which command to use to run in docker mode? `npx lost-pixel in-docker update`, `npx lost-pixel run-in-docker update`, `npx lost-pixel dockerized update`