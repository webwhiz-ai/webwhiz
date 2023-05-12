# Contributing to WebWhiz.ai

Want to contribute to WebWhiz? Follow along to setup a local isntance of webwhiz and make changes

## Running up Webwhiz locally

### Prerequisites
- MongoDB
- Redis
- Node v18
- Python 3.6+

### Checkout and run code
- Checkout webwhiz repo
- Run web server
```bash
yarn install
yarn run start:dev
```
- On an another terminal run js workers
```bash
yarn run crawler:worker
```
- Run celery workers on another terminal
```bash
cd workers
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m celery -A worker worker -l info --concurrency 2
```