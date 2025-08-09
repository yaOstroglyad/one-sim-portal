FROM node:16-alpine as build-stage

WORKDIR /app
ARG project

COPY package*.json ./
RUN npm install --unsafe-perm=true --allow-root
COPY . .

RUN npm run build-prod

FROM nginx:alpine
RUN rm -rf /var/www/html/*
#COPY default.conf /etc/nginx/conf.d/default.conf
COPY default.conf /etc/nginx/conf.d/default.conf.template
COPY --from=build-stage /app/dist/ /var/www/html/
CMD ["/bin/sh", "-c", "envsubst '$BACKEND_PROXY_URL' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]




