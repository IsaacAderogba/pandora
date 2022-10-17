FROM node:slim

RUN apt-get update
RUN apt-get install -y openssl

WORKDIR /app

COPY . .

ENV NODE_ENV=production

RUN npm install pm2 -g
RUN npm install --production
RUN npm run build

CMD ["npm", "run", "start"]