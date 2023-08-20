# Use the Node.js v20 base image
FROM node:20

# Set the working directory inside container
WORKDIR /app

# Copy package.json and package-lock.json to container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to container
COPY . .

# Expose port that app runs on 
EXPOSE 8080

# Start the app in dev mode
CMD ["npm", "start"]
