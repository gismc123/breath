FROM nginx:alpine

# Injected at build time by deploy.sh — changes every deploy so the SW detects an update
ARG BUILD_DATE=latest
# Set to your production URL (e.g. https://breathe.yourdomain.com) for canonical, OG, and sitemap
ARG APP_URL=https://yourdomain.com

COPY . /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Stamp the version into sw.js (triggers SW update) and substitute build-time vars into HTML/SEO files
RUN sed -i "s/__BUILD_DATE__/${BUILD_DATE}/g" /usr/share/nginx/html/sw.js && \
    sed -i "s/__APP_VERSION__/breathe-v1.0-${BUILD_DATE}/g" /usr/share/nginx/html/index.html && \
    sed -i "s|__APP_URL__|${APP_URL}|g" /usr/share/nginx/html/index.html && \
    sed -i "s|__APP_URL__|${APP_URL}|g" /usr/share/nginx/html/robots.txt && \
    sed -i "s|__APP_URL__|${APP_URL}|g" /usr/share/nginx/html/sitemap.xml

EXPOSE 80
