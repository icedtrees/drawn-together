# Drawn Together

# Pre-requisites

- Docker
- nvm (optional)
- node v21

# Installation

1. Clone repository
   1. `git clone https://github.com/icedtrees/drawn-together`
2. `nvm use`
3. `npm install` (optional - this will be done in the Docker container)

# Running locally

Using docker-compose for development:

1. Run `docker compose up --build -d`
   1. This will start a docker container for mongodb and one for your webserver, and install every dependency you need
   2. This will run the backend in development mode with hot reload on both 
      frontend and backend
2. Access at http://localhost:8443/

Using docker-compose to mimic production:

1. Run `docker compose --file compose-prod.yaml up --build -d`
    1. This will start a docker container for mongodb and one for your webserver, and install every dependency you need
    2. This will run the backend in production mode without hot reload
2. Access at http://localhost:8443/

# Running tests

See https://github.com/icedtrees/drawn-together/pull/119

# Prisma
This project uses an ORM called Prisma, whose main claim to fame is superior 
DevEx and a very modern, type-safe auto-generated Typescript client.

The client is generated from the `prisma/schema.prisma` file, which 
describes the shape of the database and all of the models. See https://www.prisma.io/docs/concepts/components/prisma-schema

The actual client is instantiated and configured in `modules/server/prisma.
ts`, and consumers should import the client from this file.

When running the Prisma CLI, execute it from the Docker container with 
`docker exec -it drawn-together-db-1 npx prisma format`, for example. Some 
important commands as a quick reference:
 - `npx prisma format` - auto-format the schema file. Also adds any missing 
   fields that it can automatically figure out, such as missing inverse 
   relationships.
 - `npx prisma generate` - generate new bindings from the schema file. Run 
   this after updating the schema file. This one is actually important to 
   run from the Docker container because it generates libc-specific code, and
   our containers use muslc.
 - `npx prisma db push` - forcefully make the database conform to the schema.
   This should only be used in local dev, because it can drop data in the db.
