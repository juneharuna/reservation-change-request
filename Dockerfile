# Stage 1: Build Stage
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files and install ALL dependencies
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Production Stage
FROM node:20-slim

WORKDIR /app

# Copy package files and install only PRODUCTION dependencies
COPY package*.json ./
RUN npm install --production

# Copy build assets from stage 1
COPY --from=builder /app/dist ./dist

# Copy backend server code
COPY reservation ./reservation

# Create an initial empty data file if not present (handled by server.cjs, but good practice)
RUN mkdir -p /app/reservation && touch /app/reservation/requests.json

# Environment variables
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Start the server
CMD ["npm", "start"]
