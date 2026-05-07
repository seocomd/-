# Build stage
FROM node:22-slim AS build

WORKDIR /app

# Install build essentials for better-sqlite3
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM node:22-slim

WORKDIR /app

# Install build essentials for better-sqlite3 in production too 
# (unless we copy the node_modules, but better-sqlite3 is picky)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public
COPY server.ts .

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]
