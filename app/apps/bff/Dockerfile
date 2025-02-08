# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json yarn.lock ./
COPY tsconfig*.json ./
COPY apps/bff ./apps/bff
COPY libs ./libs

RUN yarn install --frozen-lockfile
RUN yarn build bff

# Production stage
FROM node:18-alpine

WORKDIR /app
COPY package*.json yarn.lock ./
RUN yarn install --frozen-lockfile --production

COPY --from=builder /app/dist/apps/bff ./dist

EXPOSE 3000
CMD ["node", "dist/src/main.js"]
