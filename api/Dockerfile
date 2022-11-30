# pull the Node.js Docker image
FROM node:18

# create the directory inside the container
WORKDIR /usr/src/app
RUN ls

COPY . .
# copy the package.json files from local machine to the workdir in container
# COPY package*.json ./
# COPY yarn.lock ./

# run npm install in our local machine
RUN npm install yarn
RUN yarn
RUN yarn build
# copy the generated modules, build folder and server.js file to the container
COPY ./build ./build
# COPY ./migrations ./migrations
# COPY ./seeds ./seeds
# COPY knexfile.js .

# our app is running on port 9000 within the container, so need to expose it
EXPOSE 3000

# the command that starts our app
# CMD ["node", "index.js"]
# 
CMD [ "yarn", "production" ]
