# Stage 1: Build with Node
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]







# FROM node:18-alpine AS build

# WORKDIR /app

# COPY package.json ./
# COPY package-lock.json ./
# RUN npm install
# COPY . .
# RUN npm run build

# FROM nginx:1.19-alpine

# EXPOSE 80
# COPY --from=build /app/dist /usr/share/nginx/html