# pull the Node.js Docker image
FROM node:18

# create the directory inside the container
WORKDIR /usr/src/migration

COPY . .
# copy the package.json files from local machine to the workdir in container
# COPY package*.json ./
# COPY yarn.lock ./

# run npm install in our local machine
RUN npm install
# RUN npm install knex

# the command that starts our app
CMD ["npm", "start"]
