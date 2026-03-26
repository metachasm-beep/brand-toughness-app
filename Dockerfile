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

# Copy static assets and public folder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

# Copy the standalone build properly
# Render expects .next/standalone/server.js
COPY --from=builder /app/.next/standalone ./.next/standalone

EXPOSE 3000

# Explicitly set the CMD to match Render's logs
CMD ["node", ".next/standalone/server.js"]
