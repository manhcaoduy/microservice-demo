FROM node:20-alpine 

WORKDIR /app

COPY package*.json yarn.lock ./
COPY tsconfig*.json ./
COPY webpack.config.js ./
COPY nest-cli.json ./

RUN yarn install --frozen-lockfile

COPY apps/user ./apps/user
COPY libs ./libs
COPY proto ./proto

RUN yarn build user

EXPOSE 50051 

CMD ["node", "/app/dist/apps/user/main.js"]
