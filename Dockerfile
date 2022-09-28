FROM node:16.16.0-alpine3.16
WORKDIR /app
COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install
COPY . .
CMD ["node", "backend/server.js"]
