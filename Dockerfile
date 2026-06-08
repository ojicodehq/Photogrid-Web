# syntax=docker/dockerfile:1.7

# ----------------------------------------------------------------
# Stage 1: build (Vite → dist/ statique)
# ----------------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ----------------------------------------------------------------
# Stage 2: runtime (nginx : sert le build statique)
# ----------------------------------------------------------------
FROM nginx:1.27-alpine AS runner

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# wget pour le healthcheck (alpine inclut busybox wget)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:80/ >/dev/null 2>&1 || exit 1
