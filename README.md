# TABLE OF CONTENTS

1.  [Introduction](#org836984f)
2.  [Development](#org957d994)
    -  [Setup](#org168090e)
    -  [Start hacking](#org30ae7c1)
        1.  [Frontend Development](#org7f062cc)
        2.  [Backend Development](#orga954538)
3.  [Development Roadmap](#roadmap)
4.  [Troubleshooting](#trouble)

<a id="org836984f"></a>

## Introduction

A Relayer Manager Application, built with Python, Tornado, and React's Create-React-App



<a id="org957d994"></a>

## Development


<a id="org168090e"></a>

### Setup

##### Prerequisite

The following must be included in the development toolbelt:

-   pyenv
-   Python 3.7.* (recommended installing with pyenv)
-   Python 2.7 (recommended installing with pyenv, if not in the system yet)
-   pipenv
-   nvm
-   node 10+ && npm 6+
-   Docker

You can test if any tool above work as expected using the *which* command below

``` shell
$ which <library>
```
*If the installing is correct, you should see some path or text got printed out in the terminal.*

As usual, clone the repository to your local machine and cd into it.

``` shell
$ git clone <tomorelayer-repository>
$ cd <tomorelayer-repository>
```

After that, install the specified application dependencies with **npm** and **pipenv**

``` shell
# Install frontend & node scripts dependencies
$ npm install

# Install backend dependencies
$ pipenv install

```

Next, setup local databases with **Docker**

*For development purpose, we are going to have 2 PosgreSQL docker-containers, one for developing & the other for testing - each get exposed on its own local port*

``` shell
$ npm run docker
```


You will need a local **.env.local** file. Copy the existing **.env.development** to make your own. Then you can make
changes to your local env file if needed. *(actually in most case, you wont need to make any change, unless you have
some docker-exposing-port-conflict problem)*


``` shell
$ cp .env.development .env.local
```


Start backend & frontend on 2 different terminal tabs
``` shell
# The frontend - since CREATE-REACT-APP takes quite some time to start - in another terminal
$ npm start

# Finally, Backend - certainly in another different terminal as well
$ npm run backend
```

For any installation/running problem, check out [Troubleshooting](#trouble) guide



<a id="org30ae7c1"></a>

### Development

backend has the entry point called "app", frontend "index.jsx"
Those are where you get started.

<a id="org7f062cc"></a>

#### Frontend Development

-   Made with *Create-React-App*
-   State Management with *Redux-Zero* (not the well-known, original *Redux* - since it introduces way too much
    boilerplate codes)
-   UI/UX Development with [Material-UI](https://material-ui.com/)


<a id="orga954538"></a>

#### Backend Development

-   Checkout Python Tornado docs&#x2026;
-   Communicate with Frontend through 2 channels: one is Socket and one for Restful API, checkout `backend/route` for details

<a id="roadmap"></a>


## Deployment
Please refer to this short [Deployment Guideline](https://github.com/tomochain/tomorelayer/tree/master/deploy)


## Development Roadmap

1. Relayer Registration & Update
   - [x] Backend Database
   - [x] SmartContract
   - [x] Depovs Document & Deployment
2. Refactoring frontend structure, finalise bundling setup
   - [x] Refactor UI/UX
   - [x] Login
   - [x] RelayerRegistration
   - [x] Complete Registration & Configuration Flow for Relayer User
3. Polishing Frontend
   - [ ] Customizing Material-UI
4. Showing & Updating all filled Orders from Relayers(OrderBook) in real time
   - [ ] List all filled orders
   - [ ] Showing Fill Order Details
5. Showing & Updating all supported token available for trading
6. Listing signed & verified Relayers
   - [ ] Counting filled orders
   - [ ] Network volume details
7. Make Portable/Reusable API Kit



<a id="trouble"></a>

## Troubleshooting

**1. I can't install `web3`, something went wrong with the `node-gyp` build process.**

Our project is using python 3.7.x, which is not yet supported by **node-gyp**. In order to install web3 correctly,
install **python2.7** (if not installed yet), and config your npm's python path to it
```sh
$ pyenv install 2.7
```
Inquire **python2.7** path, and copy it
```sh
$ which python2.7
```
Config npm's python path
```sh
$ npm config set python <your-python2.7-path>
```
Then you can re-install things by running `npm i`

**2. I can't get the Backend running, something is wrong with the 'Port already in use' warning.**

Probably your Backend's last working session encountered some error and the event-loop is still occupying the
development port (eg 8888). Just kill the port and restart the app as normal, using `task kill-port 8888`
