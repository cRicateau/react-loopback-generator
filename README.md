SG Fast-IT Generator
====================
![Build Status](https://circleci.com/gh/theodo/generator-sg-fastit.svg?style=shield&circle-token=ef4d0ddd693c572cc02fe25bb35d9d75a1a90573)

This repository provides a [Yeoman](http://yeoman.io/) generator for FastIT.
It provides following features:

 * Generate Loopback server or/and React front client
 * Docker environment
 * Quick configuration for PostgreSQL and MondoDB
 * Scripts to quick deploy on staging and homologation environments
 * Auto-configure Gaia-Mock locally

Prerequisites
=============

 * Install [nvm](https://github.com/creationix/nvm)
 * Install [docker](https://docs.docker.com/engine/installation/) and [docker-compose](https://docs.docker.com/compose/install/)
 * With nvm install the v6 of Node, at user scope: `nvm install 6.2`
 * Ports 80 and 35729 free on your host

How to install in order to use it?
==================================

``` bash
npm install -g yo
npm install -g git+ssh://git@github.com:theodo/generator-sg-fastit.git
```

If you want to use your local version of sg-fastit generator, cd into generator-sg-fastit folder and run:
``` bash
npm link
```

How to generate a project?
==================================

Go in folder where you want to generate the project, and run:

``` bash
yo sg-fastit
```

Follow instructions:

 * **Application name**: name of your application
 * **Application folder**: name of the project folder
 * **Client?**: generate a React client?
 * **Server?**: generate a Loopback server?
 * **Server port?**: use an available port [see and update this list](https://github.com/theodo/pepiniere-mothership/blob/prod/doc/general/servers_and_components.md#ports-list-in-use)

Wait few minutes while dependencies installation, and:

``` bash
cd <your-project-folder>
npm install
docker login -u PepiniereRegistryUser -p LetMeInThePepiniereRegistry https://registry.pepinie.re:5000
docker-compose up
```

You can now access to your application: https://localhost:8000/your-project-name/ with following [Gaia-Mock](https://github.com/theodo/pepiniere-gaia-mock/blob/prod/documentation/gaia-mock-docker.md) credientials:
 * Login: `user@socgen.com`
 * Sesame ID : `user`
 * Password by default: `1212121`

If your reset your password, your activation code is defined in docker-compose logs:

![Gaia Mock Activation Code](documentation/Gaia Mock Activation Code.png)

How to add a database?
======================

PostgreSQL, MongoDB or Elasticsearch
------------------------------------

``` bash
yo sg-fastit:server-datasource
```

Initially, the server comes with an in memory datasource. If you choose postgresql or mongodb, this in memory database will be replaced by the database, so it'll ask you if you want to override the datasource.json. Answer yes !

Then, you'll need to restart the docker-compose process by doing Ctrl+C and then `docker-compose up`

If you're using postgresql, you'll need to run the migration by doing `docker-compose exec server node_modules/.bin/db-migrate up`

Notice that if the server doesn't want to start, it's because the database starts slowly. Change something in the server folder, this will reboot the server and it'll be ok.

Other database
--------------

 * Add databse manually in  `docker-compose.yml`
 * Run `slc loopback:datasource`
 * Install corresponding Loopback connector
 * Add config in `server/boot/healtcheck.js`

And then?
=========

 * Read and update the **generated documentation** in your project directory
 * Init your Git repository `git init` and create a Github repository
 * Configure CircleCI: enable project, and update status badge in the generate README.mu
 * You can use [slc commands](https://docs.strongloop.com/display/public/LB/Command-line+reference), or use the following subgenerators:
  * `yo sg-fastit:client-reducer`: Generator to create client reducer
  * `yo sg-fastit:client-component`: Generator to create client component
  * `yo sg-fastit:server-datasource`: Generator to add datasource

Devtools
========================

#### Redux Devtools Extension
Generator uses Redux Devtools Extension for Redux logic debugging/monitoring.
Full documentation available at: [Redux Devtools Extension @ GitHub](https://github.com/zalmoxisus/redux-devtools-extension)

#### Chrome Dev Tools
Line by line debugging is available with the generator. More info on how to use it [here](https://blog.hospodarets.com/nodejs-debugging-in-chrome-devtools)

How to contribute?
==================

See [CONTRIBUTING.md](CONTRIBUTING.md)