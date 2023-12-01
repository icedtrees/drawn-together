# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/engine/reference/builder/

FROM node:21-alpine

WORKDIR /usr/src/app

ENV NODE_ENV production

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.npm to speed up subsequent builds.
# Leverage a bind mounts to package.json and package-lock.json to avoid having to copy them into
# into this layer.
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --include=dev # Must install dev dependencies because we're building the project in this docker image

# Copy the rest of the source files into the image.
COPY . .

# This is for frontend only - the express backend server will serve all the outputs in public/
# Transpile all frontend .ts files that are reachable from the application.ts entrypoint
# Load all the html files and stuff that hasn't been imported
RUN node_modules/.bin/esbuild --bundle --outdir=build/public "application.ts" "modules/client/**/*.png" \
    --loader:.png=copy \
    --loader:.ttf=file --loader:.eot=file --loader:.woff=file --loader:.svg=file --loader:.woff2=file

# Build backend
RUN node esbuild.config.mjs build

# Generate prisma client
RUN npx prisma generate

# Run the application as a non-root user.
USER node

# Expose the port that the application listens on.
EXPOSE 8443

# Run the application.
CMD cd build && node src/server.js
