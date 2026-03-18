FROM node:20-slim

WORKDIR /app

# Core environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Install dependencies - using npm install for reliability in varying environments
COPY package.json package-lock.json* ./
RUN npm install

# Copy source files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

EXPOSE 3000

# Start command
CMD ["npm", "run", "start"]
