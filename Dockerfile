FROM docker.arvancloud.ir/node:20-alpine

RUN apk add --no-cache bash rsync docker-cli \
    && npm install -g gitlab-ci-local

WORKDIR /repo

ENTRYPOINT [ "gitlab-ci-local" ]
