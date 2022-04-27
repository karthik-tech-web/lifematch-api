# Create image based on the official Node 8.11.1 image running on debian stretch from dockerhub
# FROM node:14.13.0-alpine
FROM node:14.13.1-buster
# ENV NODE_ENV=local
# Create the app directory and configure it to be the working dir
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Create directories for temp file upload
RUN mkdir -p /usr/src/app/tmp/

# Copy node app dependency definitions
COPY package.json /usr/src/app/

# Install pm2 *globally* & other dependencies
RUN npm install -g pm2
RUN npm install --silent --progress=false

# Get all the code needed to run the app
COPY . /usr/src/app

# Expose the port the app runs in
EXPOSE 8083

# Serve the app using pm2 process.json config file
CMD [ "pm2-runtime", "start", "process.json"]