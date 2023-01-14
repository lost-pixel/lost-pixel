# Build Stage

FROM node:19.4.0-alpine as builder

WORKDIR /app

COPY src src
COPY tsconfig.json .
COPY package.json .
COPY package-lock.json .

RUN npm install --ignore-scripts
RUN npm run build
# Ensure odiff binary is present and linked correctly, --ignore-scripts ignores post-install which is needed by odiff
RUN cd node_modules/odiff-bin && npm run postinstall


# Run Stage

FROM mcr.microsoft.com/playwright:v1.29.2-focal AS runner
# Check available tags: https://mcr.microsoft.com/en-us/product/playwright/tags

ENV NODE_ENV=production

WORKDIR /lost-pixel

COPY --from=builder /app/dist dist
COPY --from=builder /app/node_modules node_modules

COPY config-templates config-templates
COPY package.json .
COPY entrypoint.sh /entrypoint.sh

RUN ln -s /lost-pixel/dist/bin.js /usr/local/bin/lost-pixel
RUN chmod +x /usr/local/bin/lost-pixel

WORKDIR /

ENTRYPOINT ["/entrypoint.sh"]
