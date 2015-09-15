# Drawn Together

# Installation

1. Clone repository
2. Install [node.js](http://nodejs.org/)
  * curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.26.1/install.sh | bash
  * nvm install v0.12.6
  * nvm use v0.12.6
  * nvm alias default v0.12.6
3. Install [MongoDB](https://www.mongodb.org/downloads)
  * sudo apt-get install mongodb
4. Run npm install -g bower
  * Installs bower globally (tracks clientside packages)
5. Run npm install -g grunt-cli
  * Installs grunt globally (automation and scripts)
6. Run npm install
  * Installs packages defined in package.json locally (within the current folder)

- Run application: grunt
- Run with TLS: sh ./scripts/generate-ssl-certs.sh
- Test: grunt test

# Useful links
- [meanjs](https://github.com/meanjs/mean/tree/0.4.0)
