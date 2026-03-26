# Stage 1: Build
FROM node:20-slim AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 2: Runner
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Copy essentials from builder
# Standalone server and bundled modules
COPY --from=builder /app/.next/standalone ./
# Static assets (required for standalone)
COPY --from=builder /app/.next/static ./.next/static
# Public files (required for standalone)
COPY --from=builder /app/public ./public

EXPOSE 3000

# Entry point
CMD ["node", "server.js"]
