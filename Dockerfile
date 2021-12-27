FROM node:14-alpine

RUN apk add chromium

ENV NODE_ENV development

WORKDIR /app

COPY package.json .
COPY package-lock.json .
COPY entrypoint.sh /entrypoint.sh
COPY loki.config.js /loki.config.js
COPY tsconfig.json /tsconfig.json
COPY loadEnv.js /loadEnv.js
COPY src /src

RUN npm install
# RUN npm run build



ENTRYPOINT ["/entrypoint.sh"]
