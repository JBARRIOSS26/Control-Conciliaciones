FROM node:24-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build frontend bundle
COPY . .
RUN npm run build

# Create persistent storage folder for SQLite
RUN mkdir -p /app/data

# Cloud Environment Configuration
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3001
ENV DATA_DIR=/app/data

EXPOSE 3001

# Start fullstack backend (Express + SQLite + Frontend Static)
CMD ["npm", "start"]
