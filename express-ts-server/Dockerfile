# Use the node:16 image as the base image
FROM node:16

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and yarn.lock files
COPY package*.json yarn.lock ./

# Install dependencies using yarn
RUN yarn install

# Install Prisma CLI for migrations
RUN yarn global add prisma

# Install TypeScript globally
RUN yarn global add typescript

# Install nodemon globally
RUN yarn global add nodemon

# Copy the rest of the application code into the container
COPY . .

# Expose port 4000 for the application
EXPOSE 4000

# Command to run the application
CMD [ "node", "src/index.ts" ]
