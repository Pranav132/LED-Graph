# Use an official Node.js runtime as a parent image
FROM node:16

# Set the working directory to /app
WORKDIR /app

# Copy the package.json and yarn.lock files to the container
COPY package*.json yarn.lock ./

# Install the dependencies
RUN yarn install

# Copy the rest of the application code to the container
COPY . .

RUN npx prisma generate

# RUN npx prisma migrate deploy

# Expose the port that the application listens on
EXPOSE 4000

# Start the application
CMD ["yarn", "dev"]