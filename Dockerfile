FROM node:16-alpine

WORKDIR /app

COPY package.json .
COPY package-lock.json .
COPY src src/
COPY tsconfig.json .
COPY loadEnv.js .
COPY entrypoint.sh /entrypoint.sh

RUN npm install
RUN npm run build
RUN npx playwright install firefox

ENV NODE_ENV production

ENTRYPOINT ["/entrypoint.sh"]
