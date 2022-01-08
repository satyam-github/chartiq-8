FROM nginx:1.15

WORKDIR /var/www/public

COPY dist .

COPY nginx.conf /etc/nginx/conf.d/default.conf
