FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production=false

# Copiar código fuente
COPY . .

RUN npm run build
