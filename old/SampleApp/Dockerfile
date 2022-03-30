FROM nginx:latest
USER root
COPY nginx.conf /etc/nginx/nginx.conf

WORKDIR /usr/share/nginx/html
COPY ./dist/sampleapp /usr/share/nginx/html/sample-app