FROM mcr.microsoft.com/playwright:v1.25.0-focal
# Check available tags: https://mcr.microsoft.com/en-us/product/playwright/tags

COPY entrypoint.sh /entrypoint.sh

RUN npm i -g lost-pixel

ENTRYPOINT ["/entrypoint.sh"]
