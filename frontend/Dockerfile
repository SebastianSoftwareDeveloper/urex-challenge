FROM nginx:alpine

# Create non-root user for rootless Docker compatibility
RUN addgroup -g 1000 appuser && \
    adduser -D -u 1000 -G appuser appuser

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy application files
COPY --chown=appuser:appuser public /var/www/html

# Update nginx to run as non-root user
RUN sed -i 's/user  nginx;/user  appuser;/g' /etc/nginx/nginx.conf && \
    touch /var/run/nginx.pid && \
    chown -R appuser:appuser /var/run/nginx.pid && \
    chown -R appuser:appuser /var/cache/nginx

USER appuser

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
