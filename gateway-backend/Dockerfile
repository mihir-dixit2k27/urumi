FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install
RUN npx prisma generate

COPY . .
RUN npx tsc

USER node
EXPOSE 4000
CMD ["node", "dist/index.js"]
