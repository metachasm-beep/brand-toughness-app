# Base image with Playwright + Chromium dependencies preinstalled
FROM mcr.microsoft.com/playwright:v1.54.2-jammy

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Install dependencies first for better layer caching
COPY package.json package-lock.json* ./

RUN npm ci

# Copy app source
COPY . .

# Build the Next.js app
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
