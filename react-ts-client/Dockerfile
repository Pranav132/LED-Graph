# Use the node:16 image as the base image
FROM node:16

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and yarn.lock files
COPY package*.json yarn.lock ./

# Install dependencies using yarn
RUN yarn install

# Copy the rest of the application code into the container
COPY . .

# Expose port 3000 for the application
EXPOSE 3000

# Command to run the application using yarn
CMD [ "yarn", "start" ]
