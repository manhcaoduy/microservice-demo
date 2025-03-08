FROM node:20-alpine 

WORKDIR /app

COPY package*.json yarn.lock ./
COPY tsconfig*.json ./

RUN yarn install --frozen-lockfile

COPY apps/bff ./apps/bff
COPY libs ./libs

RUN yarn build bff

EXPOSE 3000
CMD ["node", "/app/dist/apps/bff/src/main.js"]
