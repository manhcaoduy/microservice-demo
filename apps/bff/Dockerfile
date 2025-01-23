# Base image
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Bundle app source
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD [ "npm", "run", "start:prod" ]
