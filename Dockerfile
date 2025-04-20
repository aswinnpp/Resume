# Use official Node.js image as base (pre-made environment)
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy your 'package.json' to install dependencies
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the app files
COPY . .

# Expose the port your app will run on (use the same port as your app)
EXPOSE 3000

# Run the app (start the Node.js server)
CMD ["node", "server.js"]
