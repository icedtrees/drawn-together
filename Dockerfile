# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/engine/reference/builder/

FROM node:21-alpine

# Use production node environment by default.
#ENV NODE_ENV production

WORKDIR /usr/src/app

ENV NODE_ENV production

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.npm to speed up subsequent builds.
# Leverage a bind mounts to package.json and package-lock.json to avoid having to copy them into
# into this layer.
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

# Copy the rest of the source files into the image.
COPY . .

RUN node_modules/.bin/esbuild --bundle --outdir=public/modules "modules/client/**/*.js" "modules/shared/**/*.js"

# Install font-awesome
RUN mkdir -p public/lib/font-awesome/css public/lib/font-awesome/fonts
RUN cp node_modules/font-awesome/css/font-awesome.css public/lib/font-awesome/css/font-awesome.css
RUN cp node_modules/font-awesome/fonts/* public/lib/font-awesome/fonts/

# Run the application as a non-root user.
USER node

# Expose the port that the application listens on.
EXPOSE 8443

# Run the application.
CMD node server.js
