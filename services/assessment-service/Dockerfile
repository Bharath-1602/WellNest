FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

FROM node:20-alpine AS production
WORKDIR /app
RUN addgroup -S wellnest && adduser -S wellnest -G wellnest
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/src ./src
USER wellnest
EXPOSE 3002
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3002/health || exit 1
CMD ["node", "src/index.js"]
