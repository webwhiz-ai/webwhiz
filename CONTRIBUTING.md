# Contributing to WebWhiz.ai

Want to contribute to WebWhiz? Follow along to setup a local isntance of webwhiz and make changes

# Self Hosting

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
npm install -g pm2 # Use sudo if required
pm2 start ecosystem.config.js
```

This will start the backend http server, the js worker and the python worker
