# Stage 1: Build with Node
FROM node:20-alpine AS builder

WORKDIR /app

ARG VITE_SPARROW_LAUNCH_URL
ARG VITE_API_BASE_URL
ARG VITE_LOGIN_REDIRECT
ARG VITE_SPARROW_DOCS_URL
ARG VITE_ENVIRONMENT

ENV VITE_SPARROW_LAUNCH_URL=$VITE_SPARROW_LAUNCH_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_LOGIN_REDIRECT=$VITE_LOGIN_REDIRECT
ENV VITE_SPARROW_DOCS_URL=$VITE_SPARROW_DOCS_URL
ENV VITE_ENVIRONMENT=$VITE_ENVIRONMENT

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine


COPY default.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

 