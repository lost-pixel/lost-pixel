FROM mcr.microsoft.com/playwright:v1.25.0-focal

COPY entrypoint.sh /entrypoint.sh

RUN PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm i -g lost-pixel

ENTRYPOINT ["/entrypoint.sh"]
