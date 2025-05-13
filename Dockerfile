# Stage 1: Build with Node
FROM node:20-alpine AS builder

WORKDIR /app

ARG VITE_SPARROW_LAUNCH_URL
ARG VITE_API_BASE_URL
ARG VITE_LOGIN_REDIRECT

ENV VITE_SPARROW_LAUNCH_URL=$VITE_SPARROW_LAUNCH_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_LOGIN_REDIRECT=$VITE_LOGIN_REDIRECT


COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/nginx.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

 