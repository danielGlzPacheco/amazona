FROM node:16.16.0-alpine3.16

EXPOSE 3000

WORKDIR /app
COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install
COPY . .
CMD ["npm", "start"]
