FROM node:22.17.1

WORKDIR /app

# Instalar pnpm globalmente
RUN npm install -g pnpm

COPY package.json ./
COPY pnpm-lock.yaml ./

RUN pnpm i

COPY index.js ./
COPY .env ./

CMD ["pnpm", "dev"]