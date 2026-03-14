FROM mcr.microsoft.com/playwright:v1.54.2-jammy

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY package.json package-lock.json* ./

RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY . .

RUN if [ -f prisma/schema.prisma ]; then npx prisma generate; fi

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
