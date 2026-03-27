FROM node:20-slim
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

# next start serves everything from .next/ — no standalone path issues
CMD ["npm", "run", "start"]
