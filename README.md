# Drawn Together

# Installation

1. Clone repository
  * `git clone https://github.com/icedtrees/drawn-together`
2. Install Docker
3. Run `docker compose up --build`
  * This will start a docker container for mongodb and one for your webserver, and install every dependency you need

* Run with TLS: sh ./scripts/generate-ssl-certs.sh
* Test: `npm test`
