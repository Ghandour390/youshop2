FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build
RUN ls -la dist/ || echo "dist folder not found!"
RUN chmod +x start.sh

EXPOSE 3000

CMD ["./start.sh"]