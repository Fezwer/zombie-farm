# syntax=docker/dockerfile:1

FROM node:20-alpine AS build
WORKDIR /app

# зависимости
COPY package.json package-lock.json ./
RUN npm ci

# исходники
COPY . .

# важный момент: используем build-nolog (у тебя он есть), чтобы не зависеть от внешнего log.js
RUN npm run build-nolog

# --- runtime ---
FROM nginx:1.27-alpine AS runtime

# конфиг nginx под SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# статика
COPY --from=build /app/dist/ /usr/share/nginx/html/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
