# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/engine/reference/builder/

FROM node:21

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

# Expose the port that the application listens on.
EXPOSE 8443

#RUN npm install -g bower
#RUN bower install --config.interactive=false

# Replace bower with our budget version until we get esbuild working properly
RUN mkdir -p public/lib/angular-sanitize public/lib/angular public/lib/angular-bootstrap-colorpicker/js public/lib/angular-bootstrap-colorpicker/css public/lib/angular-messages public/lib/angular-resource
RUN mkdir -p public/lib/angular-ui-router/release public/lib/angular-scroll-glue/src public/lib/font-awesome/css public/lib/font-awesome/fonts
RUN cp node_modules/angular/angular.js public/lib/angular/angular.js
RUN cp node_modules/angular-bootstrap-colorpicker/js/bootstrap-colorpicker-module.js public/lib/angular-bootstrap-colorpicker/js/bootstrap-colorpicker-module.js
RUN cp node_modules/angular-bootstrap-colorpicker/css/colorpicker.css public/lib/angular-bootstrap-colorpicker/css/colorpicker.css
RUN cp node_modules/angular-messages/angular-messages.js public/lib/angular-messages/angular-messages.js
RUN cp node_modules/angular-resource/angular-resource.js public/lib/angular-resource/angular-resource.js
RUN cp node_modules/angular-sanitize/angular-sanitize.js public/lib/angular-sanitize/angular-sanitize.js
RUN cp node_modules/angular-ui-router/release/angular-ui-router.js public/lib/angular-ui-router/release/angular-ui-router.js
RUN cp node_modules/angularjs-scroll-glue/src/scrollglue.js public/lib/angular-scroll-glue/src/scrollglue.js
RUN cp node_modules/font-awesome/css/font-awesome.css public/lib/font-awesome/css/font-awesome.css
RUN cp node_modules/font-awesome/fonts/* public/lib/font-awesome/fonts/

# Run the application as a non-root user.
USER node

# Run the application.
CMD node server.js
