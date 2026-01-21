# Fetching the latest node image on apline linux
FROM node:14-alpine AS builder_widget

# Declaring env
ENV NODE_ENV production

# Setting up the work directory
WORKDIR /app

# Installing dependencies
COPY ./package.json ./
COPY ./package-lock.json ./
RUN npm install

# Copying all the files in our project
COPY . .
COPY .env.docker .env

# If you get `Allocation failed`, lower this https://nodejs.org/api/cli.html#cli_max_old_space_size_size_in_megabytes
ENV NODE_OPTIONS --max-old-space-size=8192

# Building our application
RUN npm run build

# Fetching the latest nginx image
FROM nginx:1-alpine

# Copying built assets from builder
COPY --from=builder_widget /app/dist /usr/share/nginx/html

# Copying our nginx.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]