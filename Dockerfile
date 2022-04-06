FROM mcr.microsoft.com/playwright:v1.20.0-focal

WORKDIR /app

COPY package.json .
COPY package-lock.json .
COPY src src/
COPY tsconfig.json .
COPY entrypoint.sh /entrypoint.sh

RUN npm install
RUN npm run build

ENV NODE_ENV production

ENTRYPOINT ["/entrypoint.sh"]
