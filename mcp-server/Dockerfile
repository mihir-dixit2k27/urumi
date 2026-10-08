FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npx tsc

# Switch to non-root user
USER node

EXPOSE 3000
CMD ["node", "dist/index.js"]
