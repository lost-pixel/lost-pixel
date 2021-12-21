FROM node:16-alpine

ENV NODE_ENV production

RUN apk add chromium

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY entrypoint.sh /entrypoint.sh
COPY loki.config.js /loki.config.js

ENTRYPOINT ["/entrypoint.sh"]
