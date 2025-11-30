FROM node:18-alpine

# Create app directory
WORKDIR /app

# Create data directory for persistence
RUN mkdir -p /data

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY app.js .

# Expose port
EXPOSE 8080

# Set environment variables
ENV PORT=8080
ENV DATA_DIR=/data

# Start the application
CMD ["node", "app.js"]
