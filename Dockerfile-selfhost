# Stage 1: Build with Node
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine


COPY default.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

# Create entrypoint directory if it doesn't exist
RUN mkdir -p /docker-entrypoint.d

# Copy and convert shell script to Unix format
COPY docker-entrypoint.d/10-runtime-rewrite.sh /docker-entrypoint.d/10-runtime-rewrite.sh

# Convert line endings to Unix format and make executable
RUN dos2unix /docker-entrypoint.d/10-runtime-rewrite.sh && \
    chmod +x /docker-entrypoint.d/10-runtime-rewrite.sh

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

 