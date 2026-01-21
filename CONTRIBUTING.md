# Contributing to WebWhiz.ai

Want to contribute to WebWhiz? Follow along to setup a local isntance of webwhiz and make changes

# Self Hosting

There are two ways to run Self Host / run webwhiz

1. Docker - Easy
2. Manual Setup - Involved (but provides more flexibility)

## Docker

Prerequisites

- Docker & docker-compose

Running Webwhiz with docker

1. Clone the repo
2. Edit the `.env.docker` file present in the root of the repo and add your `OPENAI_KEY` & `OPENAI_KEY_2`
3. Use docker-compose to start the stack

```bash
# Bring up webwhiz
# Once the building is done and webwhiz starts the UI will be available at
# http://localhost:3030, backend is available at http://localhost:3000
# widget is available at http://localhost:3031
# To exit Press Ctrl-C
docker-compose up

# Alternatively Run webwhiz as a daemon
docker-compose up -d

# Stop Webwhiz
docker-compose down

# Force rebuild all containers (required only if some change is not picked up)
sudo docker-compose up --build --force-recreate
```

## Manual

WebWhiz is designed to be used as a production grade Chatbot that can be scaled up or down to handle any volume of data.

WebWhiz consists of mainly 3 components

1. The API server - This is the main webwhiz backend web server using NestJS
2. JS Celery Worker - Handles crawling, embeddings generation
3. Python Celery Worker - Container Cosine similarity calculator & HTML / PDF content extractor

For Database and Caching Webwhiz uses

- MongoDB
- Redis

The backend server uses third part services (including OpenAI) for powering the chatbot, as well as for error monitoring etc. Only OpenAI key is mandatory and you can ignore the others if you prefer to.

> NOTE: WebWhiz keeps embeddings in Redis to improve the performance of chatbot responses. For most organisations the chatbots created would be conatins data for a few hundren or thousands of pages, and Redis should work well while providing better performance. If you would like to use a dedicated vector database for searching relavant chunks please reach out to us.

## Prerequisites

- MongoDB v6
- Redis v7
- Node v18 + Yarn
- Python v3.6+

## Setting Enviornment Variables

1. Create a copy of the `.env.sample` file and rename as `.env`

The following variables as mandatory

- HOST - IP to which the web server should bind to typically `0.0.0.0`
- PORT - Port on which web server should listen to (Default 3000)
- SECRET_KEY - Secret used for encryption (JWT, etc).
- MONGO_URI - MongoDB uri to use
- MONGO_DBNAME - Name of Database inside MongoDB
- OPENAI_KEY - OpenAI API key
- OPENAI_KEY_2 - Alternate OpenAI API key, used when the primary one raises error. You can use the same API key for both if you don't want to provide two separate API keys

2. Inside the workers folder create a copy of the `.env.sample` and rename as `.env`.

Set the value for the following variables - `MONGO_URI`, `MONGO_DBNAME`, `REDIS_HOST`, `REDIS_PORT`

3. Configure `widget/nginx-variables.conf`.

`set $FRAME_ANCESTORS "http:"`, to allow unencrypted iframing of the widget in your development environment.

## Installing dependencies and running app

From the root folder run the following commands

```bash
# Install node dependencies
yarn install

# Install python worker dependencies
cd workers
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run application with pm2
cd ..
yarn run build
npm install -g pm2 # Use sudo if required
pm2 start ecosystem.config.js
```

This will start the backend http server, the js worker and the python worker

# Dev Setup

### Prerequisites

1. .env to be configured
2. nodejs (18+), python3.8+
3. mongodb, redis to be running (preferabily using docker)

```bash
# JS Setup
yarn install
yarn start:dev
yarn crawler:worker

# Python worker setup (inside workers folder)
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt # Only for the first time
celery -A worker worker -l info --concurrency 1
```
