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
