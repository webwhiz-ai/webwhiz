###################
# BUILD FOR PRODUCTION
###################

FROM node:18-alpine As build

WORKDIR /usr/src/app

COPY --chown=node:node package*.json yarn.lock ./

RUN yarn install

COPY --chown=node:node . .

# Set NODE_ENV environment variable
ENV NODE_ENV production
# If you get `Allocation failed`, lower this https://nodejs.org/api/cli.html#cli_max_old_space_size_size_in_megabytes
ENV NODE_OPTIONS --max-old-space-size=8192

# Run the build command which creates the production bundle
RUN yarn run build

# Remove the existing node_modules and install only production deps
RUN rm -rf node_modules && yarn install --production

USER node

###################
# PRODUCTION
###################

FROM node:18-alpine As production

# Copy the bundled code from the build stage to the production image
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist
COPY --chown=node:node .env.docker .env

# Start the server using the production build
CMD [ "node", "dist/main.js" ]