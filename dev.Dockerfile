# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/engine/reference/builder/

FROM node:21-alpine

# This will be mounted against the root of the repo on the host system
WORKDIR /usr/src/app

ENV NODE_ENV development

# Run the application as a non-root user.
USER node

# Expose the port that the application listens on.
EXPOSE 8443

# Generate prisma client
# TODO this only runs once - if you change the prisma schema file, the backend will not hot reload with the changes
# TODO in order to do this "properly" we can use `npx prisma generate --watch`, but we also need to make
# TODO `node esbuild.config.mjs watch` reload the backend when the generated client changes...not easy

# TODO figure out why this doesn't use the versions in package-lock.json. For now, hard-coded the right version
RUN npx prisma@5.6.0 generate

# Not sure why dev dependencies aren't automatically installed here
CMD npm install --include=dev && \
    # This is for frontend only - the express backend server will serve all the outputs in public/
    # Transpile all frontend .ts files that are reachable from the application.ts entrypoint
    # Load all the html files and stuff that hasn't been imported
    (node_modules/.bin/esbuild --bundle --outdir=build/public "application.ts" "modules/client/**/*.png" \
        --loader:.png=copy \
        --loader:.ttf=file --loader:.eot=file --loader:.woff=file --loader:.svg=file --loader:.woff2=file \
        --watch=forever & \
    # Run the backend server in parallel, but bring the previous command to the foreground if the backend is killed
    node esbuild.config.mjs watch && fg)
