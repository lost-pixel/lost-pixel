FROM mcr.microsoft.com/playwright:v1.24.0-focal

COPY entrypoint.sh /entrypoint.sh

RUN npm i -g lost-pixel

ENTRYPOINT ["/entrypoint.sh"]
