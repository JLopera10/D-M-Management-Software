# Use official Node.js image
FROM node:22-alpine

# Set the working directory
WORKDIR /app

# Copy the package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the React code
COPY . .

# Expose the Vite port
EXPOSE 5173

# Start the Vite development server and expose it to the network
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]