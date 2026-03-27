FROM node:20-slim
WORKDIR /app

# Do NOT set NODE_ENV=production here — npm install would skip devDependencies
# (tailwindcss, typescript, @tailwindcss/postcss are all devDeps needed for build)
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

# NOW set production mode for runtime
ENV NODE_ENV=production

EXPOSE 3000
CMD ["npm", "run", "start"]
