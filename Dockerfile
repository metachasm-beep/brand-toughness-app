FROM node:20-slim
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
# Ensure Next.js can find its assets by using next start directly
CMD ["npm", "run", "start"]
