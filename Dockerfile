# Build stage
FROM node:20-alpine as build-stage

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM nginx:stable-alpine as production-stage

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built files from build stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Custom nginx config to handle Cloud Run's port environment variable with gzip & caching
RUN printf "server {\n\
    listen 8080;\n\
    server_name localhost;\n\
    root /usr/share/nginx/html;\n\
\n\
    gzip on;\n\
    gzip_vary on;\n\
    gzip_proxied any;\n\
    gzip_comp_level 6;\n\
    gzip_types text/plain text/css text/xml application/json application/javascript application/xml+rss application/atom+xml image/svg+xml;\n\
\n\
    location ~* \\\.(webp|jpg|jpeg|png|gif|svg|ico|woff2?)$ {\n\
        expires 1y;\n\
        add_header Cache-Control \"public, max-age=31536000, immutable\";\n\
        try_files \$uri =404;\n\
    }\n\
\n\
    location ~* \\\.(css|js)$ {\n\
        expires 7d;\n\
        add_header Cache-Control \"public, max-age=604800, stale-while-revalidate=86400\";\n\
        try_files \$uri =404;\n\
    }\n\
\n\
    location /eventlabs/ {\n\
        index index.html;\n\
        try_files \$uri \$uri/ /eventlabs/index.html;\n\
    }\n\
\n\
    location / {\n\
        index index.html index.htm;\n\
        try_files \$uri \$uri/ /index.html;\n\
    }\n\
\n\
    error_page 500 502 503 504 /50x.html;\n\
    location = /50x.html {\n\
        root /usr/share/nginx/html;\n\
    }\n\
}\n" > /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
