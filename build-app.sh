#!/bin/bash

# Remove the previous instances.
docker container stop spotipyn && docker container rm spotipyn
docker container stop spotipyn-db && docker container rm spotipyn-db

# Build the project using docker-compose and start the containers.
# docker-compose -f "docker-compose.dev.yml" up -d --build

# Pull the image from remote source as specified in docker compose.
docker-compose pull

# Prune any dangling images.
docker image prune

# Prune any dangling volumes.
docker volume prune