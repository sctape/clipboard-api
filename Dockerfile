FROM node:16-slim

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./

RUN apt-get update
RUN apt-get install -y openssl

RUN npm install
COPY . .
EXPOSE 5000

RUN npx prisma generate
RUN npx prisma migrate dev --name init
CMD [ "npm", "run", "dev" ]