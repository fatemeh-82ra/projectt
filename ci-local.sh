#!/bin/bash
set -e
docker build -t local-gitlab-ci-local .
docker run --rm -it \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v "$PWD":/repo \
  local-gitlab-ci-local
