FROM node:20-alpine 

WORKDIR /app

COPY package*.json yarn.lock ./
COPY tsconfig*.json ./
COPY webpack.config.js ./
COPY nest-cli.json ./

RUN yarn install --frozen-lockfile

COPY apps/socketer ./apps/socketer
COPY libs ./libs

RUN yarn build socketer

EXPOSE 3001
EXPOSE 3002

CMD ["node", "/app/dist/apps/socketer/main.js"]
