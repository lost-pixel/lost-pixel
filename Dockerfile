FROM mcr.microsoft.com/playwright:v1.20.0-focal

COPY entrypoint.sh /entrypoint.sh

RUN npm i -g lost-pixel-action

ENTRYPOINT ["/entrypoint.sh"]
