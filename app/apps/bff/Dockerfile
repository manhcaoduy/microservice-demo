FROM node:20-alpine 

WORKDIR /app

COPY package*.json yarn.lock ./
COPY tsconfig*.json ./
COPY webpack.config.js ./
COPY nest-cli.json ./

RUN yarn install --frozen-lockfile

COPY apps/bff ./apps/bff
COPY libs ./libs
COPY proto ./proto

RUN yarn build bff

EXPOSE 3000

CMD ["node", "/app/dist/apps/bff/main.js"]
