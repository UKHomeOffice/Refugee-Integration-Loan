FROM node:16-alpine@sha256:264861cd2f785a2b727e9f908065e8d9e9358fcc1308da3cb207d9cba69afee2

USER root


# Update packages as a result of Anchore security vulnerability checks
RUN apk update && \
    apk add --upgrade gnutls binutils nodejs npm apk-tools libjpeg-turbo libcurl libx11 libxml2

# Setup nodejs group & nodejs user
RUN addgroup --system nodejs --gid 998 && \
    adduser --system nodejs --uid 999 --home /app/ && \
    chown -R 999:998 /app/

USER 999

WORKDIR /app

COPY --chown=999:998 . /app

RUN yarn install --frozen-lockfile --production --ignore-optional && \
    yarn run postinstall

HEALTHCHECK --interval=5m --timeout=3s \
 CMD curl --fail http://localhost:8080 || exit 1

CMD ["sh", "/app/run.sh"]

EXPOSE 8080
