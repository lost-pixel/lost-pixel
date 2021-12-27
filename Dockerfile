FROM node:16-alpine

RUN apk add chromium

WORKDIR /app

COPY package.json .
COPY package-lock.json .
COPY entrypoint.sh /entrypoint.sh
COPY loki.config.js /loki.config.js
COPY tsconfig.json /tsconfig.json

RUN npm install
RUN npm run build

ENV NODE_ENV production

ENTRYPOINT ["/entrypoint.sh"]
