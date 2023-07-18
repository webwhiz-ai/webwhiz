# WebWhiz

Train ChatGPT on Your Website Data and Build an AI Chatbot that can instantly answer your customers queries.

![webwhiz](https://user-images.githubusercontent.com/6586706/236858939-4f3e4ac0-f3f7-4f76-8fee-add747b09ce1.png)



## 🔥 Core features

- Easy Integration
- Data-Specific Responses
- Regular Data Updates
- No code builder
- Customise chatbot
- Fine tuning
- Offline message




## 🤔 How it works ❓
Create and train a chatbot for your website in just a few simple steps.

- Just enter your website URL to get started. We'll automatically fetch and prepare training data.
- We’ll automatically train ChatGPT on your website based on the selected parameters and create the chatbot for you.
- To embed the chatbot to your website, simply add the tiny script tag to your website.


<hr>

## 🙋‍♂️ Frequently Asked Question ❓

### ***What is WebWhiz?***
WebWhiz allows you to train ChatGPT on your website data and build a chatbot that you can add to your website. No coding required.

### ***How frequently do you crawl my website?***
Currently we crawl your website once every month. Please contact us if you need your website to be scanned more frequently

### ***What data do you collect from my website?***
WebWhiz collects data from your website pages to train your chatbot. This includes text data from the pages as well as any metadata such as page titles or descriptions. We do not collect any personally identifiable information (PII) or sensitive data from your website. We scan only public data available to search engines

### ***What happens if I exceed my plan's limits?***
If you exceed your plan's limits for projects or pages, we will notify you. However, if you exceed the token limit for your plan, your chatbots will stop generating AI responses and will instead respond with a predefined message.

### ***What are tokens?***
Tokens are a unit of measurement used to calculate the amount of text data that is processed by your chatbot. Each token corresponds to a variable number of characters, depending on the complexity of the language used in the message. Each message your chatbot sends uses a certain number of tokens based on the length and complexity of the input and the AI response. You can view the current token usage of your account on the dashboard.

### ***Can I train custom data?***
Yes, you can train custom data by simply pasting content to WebWhiz

### ***Can I bring my own open ai Key***
Not at the moment, but, it will be possible in a couple of days.

### ***What is the maximum size of context?***
WebWhiz have any limitations on the size of context. However, please note that the number of pages you can crawl may be limited based on the plan you choose. Please refer to our plans page to learn more about the specific limitations of each plan.

## 📑 License
Webwhiz is open-source under the **GNU Affero General Public License Version 3 (AGPLv3)**

## WebWhiz SDK
WebWhiz SDK is available on NPM, CDNs, and GitHub.

-   [NPM](https://www.npmjs.com/) - NPM is a package manager for the JavaScript
    programming language. You can install `webwhiz` using the following
    command

    ```sh
    npm install webwhiz
    ```
- [CDN](https://www.unpkg.com/webwhiz@1.0.0/dist/sdk.js) Use directly from CDN

  ```sh
    https://www.unpkg.com/webwhiz@1.0.0/dist/sdk.js
  ```



## ☁️ Self Hosting

1. Docker - Easy
2. Manual Setup - Involved (but provides more flexibility)

### 📦 Docker

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
# To exit Press Ctrl-C
docker-compose up

# Alternatively Run webwhiz as a daemon
docker-compose up -d

# Stop Webwhiz
docker-compose down

# Force rebuild all containers (required only if some change is not picked up)
sudo docker-compose up --build --force-recreate
```

### 🛃 Manual

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

#### Prerequisites

- MongoDB v6
- Redis v7
- Node v18 + Yarn
- Python v3.6+

#### Setting Enviornment Variables

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

#### Installing dependencies and running app

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

#### Frontend 

Create `.env` file in the frontend folder and add the following variables 

```bash
REACT_APP_BASE_URL='https://api.website.com'
GOOGLE_AUTH_ID='Only if you need google login'
```

From the frontend folder run the following commands to start the server
```bash
# Install dependencies
npm install

# Run front end app
npm run start
```

Run `npm run build` to package the frontend app

If you face any issues, reach out to hi@webwhiz.ai
