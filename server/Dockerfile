# Use the official Node.js LTS image
FROM node:18

# Set working directory
WORKDIR /app

# Copy only package files first (better layer caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Optionally run migrations with retry mechanism (using bash retries)
RUN bash -c "for i in {1..10}; do npx prisma migrate deploy && break || sleep 5; done"

# Expose the port your app runs on
EXPOSE 5000

# Start the app
CMD ["node", "server.js"]
