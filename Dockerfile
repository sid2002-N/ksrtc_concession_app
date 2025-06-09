# Use an official Node.js runtime as a parent image (Choose an LTS version)
FROM node:20

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
# This leverages Docker cache layers - dependencies are only re-installed if these files change
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application code into the container
# Ensure you have a .dockerignore file to exclude node_modules, .git, etc.
COPY . .

# Your backend application listens on port 5000
EXPOSE 5000

# Your Vite frontend dev server listens on port 5173
EXPOSE 5173

# The default command will be overridden by docker-compose,
# but it's good practice to have one (e.g., for production)
# This assumes you have a "start" script in package.json for production builds
# CMD [ "npm", "run", "start" ]