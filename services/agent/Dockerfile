FROM node:slim

RUN apt-get update
RUN apt-get install -y openssl

WORKDIR /app

COPY . .

RUN npm install pm2 -g
RUN npm install
RUN npm run build

ENV NODE_ENV=production
CMD ["npm", "run", "start"]