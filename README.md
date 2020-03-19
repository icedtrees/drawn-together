# Drawn Together

# Installation

1. Clone repository
  * `git clone https://github.com/icedtrees/drawn-together`
2. Install NVM (node version manager)
  * nvm use (use version specified in .nvmrc)
3. Install [MongoDB](https://www.mongodb.org/downloads)
  * `sudo apt-get install mongodb`
  * OSX: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/
6. Run `npm install` within cloned directory
  * Installs packages defined in package.json locally (within the current folder)
7. Install Ruby and SASS (for compiling CSS)
  * https://www.digitalocean.com/community/tutorials/how-to-install-ruby-on-rails-on-ubuntu-12-04-lts-precise-pangolin-with-rvm
  * `gpg --keyserver hkp://keys.gnupg.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3`
  * `curl -L https://get.rvm.io | bash -s stable`
  * `source ~/.rvm/scripts/rvm`
  * `rvm requirements`
  * `rvm install ruby`
  * `rvm use ruby --default`
  * `rvm rubygems current`
  * `gem install sass` (if you don't care about rvm, just run this step)

* Run application: `npm start`
* Run with TLS: sh ./scripts/generate-ssl-certs.sh
* Test: `npm test`

# Useful links
- [meanjs](https://github.com/meanjs/mean/tree/0.4.0)
