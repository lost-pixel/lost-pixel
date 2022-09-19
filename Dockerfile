

FROM node:16-alpine as builder

WORKDIR /app

COPY src src
COPY tsconfig.json .
COPY package.json .
COPY package-lock.json .

RUN npm install --ignore-scripts
RUN npm run build

