# Drawn Together

# Installation

1. Clone repository
  * `git clone https://github.com/icedtrees/drawn-together`
2. Install [node.js](http://nodejs.org/)
  * `curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.26.1/install.sh | bash`
  * `source ~/.profile`
  * `nvm install v0.12.4`
  * `nvm use v0.12.4`
  * `nvm alias default v0.12.4`
  * Try v0.10.25 if the above fails
3. Install [MongoDB](https://www.mongodb.org/downloads)
  * `sudo apt-get install mongodb`
4. Run `npm install -g bower`
  * Installs bower globally (tracks clientside packages)
5. Run `npm install -g grunt-cli`
  * Installs grunt globally (automation and scripts)
6. Run `npm install` within cloned directory
  * Installs packages defined in package.json locally (within the current folder)
  * Likely to lead to issues with the node-gyp installation on Windows. Here are some links that may help fix those problems:
    * [node-gyp readme](https://github.com/nodejs/node-gyp)
    * [Visual Studio issue](http://stackoverflow.com/questions/21200655/how-do-i-get-node-gyp-to-work-on-windows-7-platform): use `npm install <package> --nodedir="<DRIVERLETTER>:\Users\<USERNAME>\.node-gyp\0.10.3"`
    * [Issues with installing Windows SDK 7](http://www.mathworks.com/matlabcentral/answers/101105-how-do-i-install-microsoft-windows-sdk-7-1)
    * Things Nara had to do (might be missing some stuff):
        * Install Visual Studio Express 2013
        * Install Windows SDK 7.1 (refer to [earlier link, Issues with installing Windows SDK 7](http://www.mathworks.com/matlabcentral/answers/101105-how-do-i-install-microsoft-windows-sdk-7-1)) and [64bit compiler for 7.1 Windows SDK](http://www.microsoft.com/en-us/download/details.aspx?id=4422)
        * Install Git
        * Make sure your have the right variables in your PATH
7. Install Ruby and SASS (for compiling CSS)
  * https://www.digitalocean.com/community/tutorials/how-to-install-ruby-on-rails-on-ubuntu-12-04-lts-precise-pangolin-with-rvm
  * `gpg --keyserver hkp://keys.gnupg.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3`
  * `curl -L https://get.rvm.io | bash -s stable`
  * `source ~/.rvm/scripts/rvm`
  * `rvm requirements`
  * `rvm install ruby`
  * `rvm use ruby --default`
  * `rvm rubygems current`
  * `gem install sass`

Note:
* May need for PhantomJS as a dependency `sudo apt-get install libfontconfig`

* Run application: grunt
* Run with TLS: sh ./scripts/generate-ssl-certs.sh
* Test: grunt test (make sure you run mongod.exe before this test)

# Useful links
- [meanjs](https://github.com/meanjs/mean/tree/0.4.0)
