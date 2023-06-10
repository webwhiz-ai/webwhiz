###################
# BUILD FOR PRODUCTION
###################

FROM python:3.8-slim-buster

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install dependencies
RUN apt-get update && \
    apt-get install -y -q \
        openssl curl libpq-dev python3-dev build-essential && \
    apt-get clean

# Copy project files
COPY . /app
COPY .env.docker /app/.env

# Set working directory
WORKDIR /app

# Install pip dependencies
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Start Celery worker
CMD celery -A worker worker -l info --concurrency 2