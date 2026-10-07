FROM node:22-alpine

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./
COPY client/package*.json ./client/

# Install server and client dependencies
RUN npm install
RUN npm --prefix client install

# Copy application source code
COPY . .

# Build frontend production bundle
RUN npm --prefix client run build

# Default environment variables
ENV PORT=5000
ENV NODE_ENV=production

EXPOSE 5000

# Start production server
CMD ["node", "server/server.js"]
