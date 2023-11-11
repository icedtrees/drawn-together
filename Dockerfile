# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/engine/reference/builder/

FROM node:14

RUN apt-get update
RUN apt-get install -y ruby
RUN apt-get install -y ruby-dev
RUN gem install sass
RUN npm install -g grunt-cli

# Use production node environment by default.
#ENV NODE_ENV production

WORKDIR /usr/src/app

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


# Install global npm dependency without root access
#ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
#ENV PATH=$PATH:/home/node/.npm-global/bin

#RUN npm install load-grunt-tasks grunt-concurrent grunt-contrib-copy grunt-contrib-csslint grunt-contrib-cssmin grunt-contrib-jshint grunt-contrib-less grunt-contrib-sass grunt-contrib-uglify grunt-contrib-watch grunt-env grunt-ng-annotate grunt-nodemon

#RUN npm install --save grunt

# Expose the port that the application listens on.
EXPOSE 8443

RUN grunt build

# Run the application as a non-root user.
USER node

ENV DB_1_PORT_27017_TCP_ADDR mongodb

# Run the application.
CMD grunt concurrent:default
