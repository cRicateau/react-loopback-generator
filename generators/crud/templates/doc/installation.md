Installation
============

Requirements
------------

Before anything, you need the following software installed on your machine:

  * [Node](https://nodejs.org/en/download/current/) >= 6
  * [Docker](https://docs.docker.com/engine/installation/)
  * [Docker Compose](https://docs.docker.com/compose/install/)


Project installation
--------------------
To install the project, you must at first clone the code repository :
``` bash
    git clone git@github.com:yourrepository/<%= applicationName %>.git
```

Then, this project can be installed by running the install script:
``` bash
    cd <%= applicationName %>/
    npm install
    docker-compose up
    docker exec -it <%= applicationName %>_server_1 npm rebuild mmmagic
```
And then you can access to your application by this url : http://localhost/<%= applicationName %>/


Database initialization
-----------------------

In order to use the import excel file functionality, you need to setup a real database in the backend. 
